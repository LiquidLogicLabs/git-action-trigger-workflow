/**
 * GitHub E2E tests for trigger-workflow.
 * Requires GITHUB_TOKEN or TEST_GITHUB_TOKEN; uses TEST_GITHUB_REPO (default: LiquidLogicLabs/git-action-release-tests).
 * For dispatch test, set TEST_GITHUB_WORKFLOW="E2E Trigger Test" (workflow in test repo).
 */
import { createGithubClient } from '../src/platforms/github';
import { createHttpClient } from '../src/http/client';
import { Logger } from '../src/logger';

const token = process.env.TEST_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const repo = process.env.TEST_GITHUB_REPO || 'LiquidLogicLabs/git-action-release-tests';
const serverUrl = process.env.TEST_GITHUB_SERVER_URL || 'https://github.com';
const apiUrl = process.env.TEST_GITHUB_API_URL || 'https://api.github.com';
const workflowName = process.env.TEST_GITHUB_WORKFLOW;
const ref = process.env.TEST_GITHUB_REF || 'main';

const logger = new Logger(false);

describe('github e2e', () => {
  const [owner, repoName] = (repo || '').split('/');

  beforeAll(() => {
    if (!token) {
      throw new Error('GITHUB_TOKEN or TEST_GITHUB_TOKEN required for e2e');
    }
    if (!owner || !repoName) {
      throw new Error('TEST_GITHUB_REPO must be owner/repo');
    }
  });

  const http = createHttpClient({
    baseUrl: apiUrl,
    token: token!,
    logger,
    verbose: false,
    userAgent: 'git-action-trigger-workflow-e2e',
  });

  const client = createGithubClient({
    baseUrl: serverUrl,
    apiBaseUrl: apiUrl,
    http,
    logger,
    owner,
    repo: repoName,
    token: token!,
    verbose: false,
  });

  test('lists workflows', async () => {
    const { workflows } = await client.listWorkflows();
    expect(Array.isArray(workflows)).toBe(true);
  });

  test('dispatches workflow when name provided', async () => {
    if (!workflowName) {
      throw new Error('TEST_GITHUB_WORKFLOW required (e.g. "E2E Trigger Test")');
    }
    const { workflows } = await client.listWorkflows();
    const wf = workflows.find((w) => w.name === workflowName || w.path?.includes(workflowName));
    if (!wf) {
      throw new Error(`Workflow '${workflowName}' not found in repository ${repo}`);
    }
    const res = await client.dispatchWorkflow(wf, ref, {});
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
  });
});

