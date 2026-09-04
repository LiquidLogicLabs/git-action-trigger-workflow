/**
 * Encode a value for use as a single path segment in an API URL.
 *
 * Interpolating a value straight into a path lets it redirect the request. Verified against
 * WHATWG URL resolution, which is what this action's transport applies — src/http/client.ts
 * builds every request as `new URL(path, baseUrl)`:
 *
 *   owner = "../../.."  ->  /api/v1/repos/../../../r/actions/workflows  =>  /r/actions/workflows
 *   id    = ".."        ->  /repos/o/r/actions/workflows/../dispatches  =>  /repos/o/r/actions/dispatches
 *
 * Dispatch is a POST, so a redirected request posts to an endpoint the caller never named.
 *
 * Every interpolated value is attacker-influenceable: owner and repo are parsed from the
 * `repo` input (or GITEA_REPOSITORY / GITHUB_REPOSITORY), and the workflow id, path, file
 * and name all come back in the list endpoint's response body, which is validated only far
 * enough to confirm a name/path/file is present.
 *
 * encodeURIComponent is necessary but not sufficient: it does not encode dots, so a bare
 * "." or ".." survives it unchanged and is then removed by dot-segment normalisation. Those
 * two are refused outright rather than encoded, because no legitimate owner, repo, workflow
 * id or workflow file is named "." or "..".
 */
export declare function safeSegment(value: string | number, label: string): string;
//# sourceMappingURL=url.d.ts.map