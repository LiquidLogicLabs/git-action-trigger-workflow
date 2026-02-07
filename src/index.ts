import * as core from '@actions/core';
import { readConfig } from './config';
import { createHttpClient } from './http/client';
import { Logger } from './logger';
import { createPlatformClient } from './platforms';
import { findWorkflowByName } from './utils/workflows';

async function run(): Promise<void> {
  const cfg = await readConfig();
  const log = new Logger(cfg.verbose);

  if (cfg.skipCertificateCheck) {
    log.warning('TLS certificate verification is disabled. This is a security risk and should only be used with trusted endpoints.');
  }

  core.setSecret(cfg.token);

  log.info(
    `Triggering workflow '${cfg.workflowName}' in ${cfg.baseUrl}/${cfg.owner}/${cfg.repo} on ref '${cfg.ref}' (platform=${cfg.platform})`,
  );

  log.debug(`inputs keys: ${Object.keys(cfg.inputs).join(', ') || '(none)'}`);

  const http = createHttpClient({
    baseUrl: cfg.apiBaseUrl,
    token: cfg.token,
    logger: log,
    verbose: cfg.verbose,
    skipCertificateCheck: cfg.skipCertificateCheck,
    userAgent: 'git-action-trigger-workflow',
  });

  const client = createPlatformClient(cfg.platform, {
    baseUrl: cfg.baseUrl,
    apiBaseUrl: cfg.apiBaseUrl,
    owner: cfg.owner,
    repo: cfg.repo,
    token: cfg.token,
    logger: log,
    verbose: cfg.verbose,
    http,
  });

  const { workflows } = await client.listWorkflows();
  const wf = findWorkflowByName(workflows, cfg.workflowName);

  const result = await client.dispatchWorkflow(wf, cfg.ref, cfg.inputs);
  log.info(`Dispatch request accepted (${result.status}).`);
}

run().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  core.setFailed(msg);
});

