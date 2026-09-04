import { safeSegment } from '../utils/url';
import { createGiteaClient } from '../platforms/gitea';
import { createGithubClient } from '../platforms/github';
import type { HttpClient } from '../http/client';
import { Logger } from '../logger';

/**
 * A value interpolated unencoded into an API path can redirect the request to a different
 * endpoint. Verified against WHATWG URL resolution, which is what this action's transport
 * applies — `new URL(path, baseUrl)` in src/http/client.ts:
 *
 *   owner = "../../.."  ->  /api/v1/repos/../../../r/actions/workflows  =>  /r/actions/workflows
 *   id    = ".."        ->  /repos/o/r/actions/workflows/../dispatches  =>  /repos/o/r/actions/dispatches
 *
 * The bare ".." case is the one encoding alone does not stop, and it matters here because
 * dispatch is a POST: a redirected POST acts on a different endpoint than the caller named.
 *
 * Tests assert the NORMALIZED pathname, not the built string — asserting the built string
 * passes while the sink stays open.
 */
const BASE = 'https://api.example.com';
const normalized = (path: string) => new URL(path, BASE).pathname;

const logger = new Logger(false);

function recordingHttp(paths: string[]): HttpClient {
  return {
    getJson: async <T,>(path: string) => {
      paths.push(path);
      return { status: 404, text: 'not found' } as { status: number; data?: T; text?: string };
    },
    postJson: async <T,>(path: string) => {
      paths.push(path);
      return { status: 404, text: 'not found' } as { status: number; data?: T; text?: string };
    },
  };
}

const ctx = (http: HttpClient, owner: string, repo: string) => ({
  baseUrl: BASE,
  apiBaseUrl: BASE,
  http,
  logger,
  owner,
  repo,
  token: 'x',
  verbose: false,
});

describe('safeSegment', () => {
  test('encodes slashes so a segment cannot introduce new path levels', () => {
    const path = `/repos/o/r/actions/workflows/${safeSegment('../../../user', 'workflow')}/dispatches`;
    expect(normalized(path)).toBe('/repos/o/r/actions/workflows/..%2F..%2F..%2Fuser/dispatches');
  });

  test.each(['..', '.'])('refuses a bare %s, which encoding alone would not stop', (dots) => {
    expect(() => safeSegment(dots, 'workflow')).toThrow(/redirect/i);
  });

  test('encodes a query string so it cannot alter the request', () => {
    const path = `/repos/o/r/actions/workflows/${safeSegment('ci.yml?per_page=1', 'workflow')}`;
    expect(normalized(path)).toBe('/repos/o/r/actions/workflows/ci.yml%3Fper_page%3D1');
    expect(new URL(path, BASE).search).toBe('');
  });

  test('encodes a fragment so the rest of the path is not discarded', () => {
    const path = `/repos/o/r/actions/workflows/${safeSegment('ci.yml#x', 'workflow')}/dispatches`;
    expect(normalized(path)).toBe('/repos/o/r/actions/workflows/ci.yml%23x/dispatches');
  });

  test('leaves an ordinary value readable', () => {
    expect(safeSegment('ci.yml', 'workflow')).toBe('ci.yml');
    expect(safeSegment('10', 'workflow id')).toBe('10');
  });

  test('names the label so an operator can tell which value was rejected', () => {
    expect(() => safeSegment('..', 'owner')).toThrow(/owner/);
  });
});

/**
 * The tests above prove safeSegment is correct; these prove the call sites use it. Before
 * this change both clients encoded the workflow path/name but interpolated owner, repo and
 * the server-supplied workflow id raw — the exact partial fix these tests guard against.
 */
describe.each([
  ['gitea', createGiteaClient, '/api/v1'],
  ['github', createGithubClient, ''],
] as const)('%s call sites', (_name, createClient, prefix) => {
  test('encodes owner and repo, which come from the user-supplied repo input', async () => {
    const paths: string[] = [];
    const client = createClient(ctx(recordingHttp(paths), '../../../user', 'r'));
    await expect(client.listWorkflows()).rejects.toThrow();
    expect(paths.map(normalized)).toContain(`${prefix}/repos/..%2F..%2F..%2Fuser/r/actions/workflows`);
    expect(paths.map(normalized).every((p) => p.startsWith(`${prefix}/repos/`))).toBe(true);
  });

  test('refuses a bare .. owner rather than letting the path collapse', async () => {
    const paths: string[] = [];
    const client = createClient(ctx(recordingHttp(paths), '..', 'r'));
    await expect(client.listWorkflows()).rejects.toThrow(/redirect/i);
    expect(paths).toEqual([]);
  });

  test('encodes the workflow id, which is a server-supplied response field', async () => {
    const paths: string[] = [];
    const client = createClient(ctx(recordingHttp(paths), 'o', 'r'));
    // The list endpoint's JSON is not validated beyond "has a name/path/file", so `id`
    // reaches the URL as whatever the server sent, despite its declared number type.
    const hostileId = '../../../user' as unknown as number;
    await expect(client.dispatchWorkflow({ id: hostileId, name: 'CI' }, 'main', {})).rejects.toThrow();
    expect(paths.map(normalized)).toContain(`${prefix}/repos/o/r/actions/workflows/..%2F..%2F..%2Fuser/dispatches`);
  });

  test('refuses a bare .. workflow id rather than posting to the parent endpoint', async () => {
    const paths: string[] = [];
    const client = createClient(ctx(recordingHttp(paths), 'o', 'r'));
    const hostileId = '..' as unknown as number;
    await expect(client.dispatchWorkflow({ id: hostileId, name: 'CI' }, 'main', {})).rejects.toThrow(/redirect/i);
    expect(paths).toEqual([]);
  });

  test('refuses a bare .. workflow path rather than posting to the parent endpoint', async () => {
    const paths: string[] = [];
    const client = createClient(ctx(recordingHttp(paths), 'o', 'r'));
    await expect(client.dispatchWorkflow({ name: 'CI', path: '..' }, 'main', {})).rejects.toThrow(/redirect/i);
    expect(paths).toEqual([]);
  });

  test('keeps an ordinary dispatch path unchanged', async () => {
    const paths: string[] = [];
    const client = createClient(ctx(recordingHttp(paths), 'o', 'r'));
    await expect(
      client.dispatchWorkflow({ id: 10, name: 'CI', path: '.github/workflows/ci.yml' }, 'main', {}),
    ).rejects.toThrow();
    expect(paths.map(normalized)).toContain(`${prefix}/repos/o/r/actions/workflows/10/dispatches`);
  });
});
