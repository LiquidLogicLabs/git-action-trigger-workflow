import { PlatformId } from './platforms/types';
export type RepoTarget = {
    owner: string;
    repo: string;
    baseUrl?: string;
};
export type ActionConfig = {
    platform: PlatformId;
    baseUrl: string;
    apiBaseUrl: string;
    owner: string;
    repo: string;
    workflowName: string;
    ref: string;
    token: string;
    inputs: Record<string, unknown>;
    verbose: boolean;
    skipCertificateCheck: boolean;
};
export declare function parseRepoTarget(repoInput: string): RepoTarget;
declare function normalizeOrigin(baseUrl: string): string;
declare function detectPlatform(baseUrl: string | undefined, repoUrlHost: string | undefined): Promise<PlatformId>;
declare function computeApiBase(platform: PlatformId, baseUrl: string): string;
export declare function readConfig(): Promise<ActionConfig>;
export declare const __internal: {
    detectPlatform: typeof detectPlatform;
    computeApiBase: typeof computeApiBase;
    normalizeOrigin: typeof normalizeOrigin;
};
export {};
