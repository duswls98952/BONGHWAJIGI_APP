import type { ResponseSnapshot } from '../api/types';
type Versions = Partial<ResponseSnapshot['input_versions']>;
// Keep accepted write versions until every later snapshot reflects them.
export function createInputRequirements() {
  const global: Versions = {};
  const contexts = new Map<string, number>();
  return {
    require(versions: Versions, responseId?: string) {
      for (const key of ['profile', 'location'] as const) {
        if (versions[key] !== undefined) global[key] = Math.max(global[key] ?? 0, versions[key]);
      }
      if (responseId && versions.context !== undefined) contexts.set(responseId, Math.max(contexts.get(responseId) ?? 0, versions.context));
    },
    satisfied(response: ResponseSnapshot) {
      return response.input_versions.profile >= (global.profile ?? 0)
        && response.input_versions.location >= (global.location ?? 0)
        && response.input_versions.context >= (contexts.get(response.id) ?? 0);
    },
  };
}
