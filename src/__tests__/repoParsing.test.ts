import { __internal, parseRepoTarget } from '../config';

describe('parseRepoTarget', () => {
  test('parses owner/repo', () => {
    expect(parseRepoTarget('alice/project')).toEqual({ owner: 'alice', repo: 'project' });
  });

  test('parses repo URL and derives baseUrl', () => {
    expect(parseRepoTarget('https://gitea.example.com/alice/project')).toEqual({
      baseUrl: 'https://gitea.example.com',
      owner: 'alice',
      repo: 'project',
    });
  });

  test('strips .git suffix', () => {
    expect(parseRepoTarget('https://gitea.example.com/alice/project.git')).toEqual({
      baseUrl: 'https://gitea.example.com',
      owner: 'alice',
      repo: 'project',
    });
  });
});

describe('platform detection + api base', () => {
  const { detectPlatform, computeApiBase, normalizeOrigin } = __internal;
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear GitHub environment variables that might interfere with detection
    const cleanedEnv = { ...originalEnv };
    delete cleanedEnv.GITHUB_SERVER_URL;
    delete cleanedEnv.GITHUB_REPOSITORY;
    delete cleanedEnv.GITHUB_API_URL;
    delete cleanedEnv.GITHUB_ACTIONS;
    delete cleanedEnv.GITHUB_TOKEN;
    delete cleanedEnv.GITEA_SERVER_URL;
    delete cleanedEnv.GITEA_REPOSITORY;
    delete cleanedEnv.GITEA_TOKEN;
    process.env = cleanedEnv;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('detects github by host', async () => {
    await expect(detectPlatform('https://github.com', undefined)).resolves.toBe('github');
  });

  test('detects gitea by default', async () => {
    await expect(detectPlatform('https://gitea.example.com', undefined)).resolves.toBe('gitea');
  });

  test('computes github api base for dotcom', () => {
    expect(computeApiBase('github', 'https://github.com')).toBe('https://api.github.com');
  });

  test('computes github api base for GHES', () => {
    expect(computeApiBase('github', 'https://github.company.com')).toBe('https://github.company.com/api/v3');
  });

  test('normalizes origin only', () => {
    expect(normalizeOrigin('https://github.com/foo/bar')).toBe('https://github.com');
  });
});


