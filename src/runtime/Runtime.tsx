import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Envelope, ResponseSnapshot, Schema } from '../api/types';
import { acceptRevision, canUseVoiceTurn } from '../core/presentation';
import { validateResponse } from '../core/validation';
import { runUpdates, type SyncStatus } from '../core/updates';
import { settings } from '../config';
import { newId } from '../platform/storage';
import { createInputRequirements } from '../core/inputVersions';
import { ApiError } from '../api/http';

export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 }, mutations: { retry: false } } });
const inputRequirements = createInputRequirements();
function checkedResponse(value: Envelope<ResponseSnapshot>, id: string) {
  validateResponse(value, id);
  if (!inputRequirements.satisfied(value.data)) throw new ApiError(409, 'INPUTS_NOT_CAUGHT_UP');
  return value;
}
const RuntimeContext = createContext<{ status: SyncStatus; foreground: boolean; restart: () => void; refreshResponse: (id: string) => Promise<void>; sendText: (id: string, text: string) => Promise<void> } | null>(null);
export const keys = { home: ['home'], config: ['config'], profile: ['profile'], response: (id: string) => ['response', id], alert: (id: string) => ['alert', id], route: (id: string, revision: number) => ['route', id, revision], turn: (id: string) => ['turn', id] };

function Runtime({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<SyncStatus>('connecting');
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [generation, setGeneration] = useState(0);
  const latestTurn = useRef<{ responseId: string; clientId: string; turnId?: string } | null>(null);
  const restart = () => setGeneration((v) => v + 1);

  async function refreshAlert(id: string, signal?: AbortSignal, minimumRevision = 0) {
    const value = await api.alert(id, signal);
    if (value.data.id !== id || value.data.revision < minimumRevision) throw new ApiError(409, 'RESOURCE_NOT_CAUGHT_UP');
    if (signal?.aborted) return;
    queryClient.setQueryData<Envelope<Schema<'Alert'>>>(keys.alert(id), (old) => acceptRevision(old, value));
  }
  async function refreshResponse(id: string, signal?: AbortSignal, minimumRevision = 0) {
    const value = checkedResponse(await api.response(id, signal), id);
    if (value.data.revision < minimumRevision) throw new ApiError(409, 'RESOURCE_NOT_CAUGHT_UP');
    if (signal?.aborted) return;
    queryClient.setQueryData<Envelope<ResponseSnapshot>>(keys.response(id), (old) => acceptRevision(old, value));
  }
  async function applyTurn(responseId: string, turnId: string, signal?: AbortSignal) {
    const value = await api.turn(responseId, turnId, signal);
    const response = queryClient.getQueryData<Envelope<ResponseSnapshot>>(keys.response(responseId));
    if (signal?.aborted || latestTurn.current?.responseId !== responseId || !response || !canUseVoiceTurn(value.data, response.data, latestTurn.current.clientId)) return;
    queryClient.setQueryData(keys.turn(responseId), value);
  }
  async function sendText(responseId: string, text: string) {
    const response = queryClient.getQueryData<Envelope<ResponseSnapshot>>(keys.response(responseId));
    if (!response) throw new ApiError(409, 'RESPONSE_REQUIRED');
    if (latestTurn.current?.turnId) await api.cancelTurn(latestTurn.current.responseId, latestTurn.current.turnId).catch(() => undefined);
    const clientId = newId();
    latestTurn.current = { responseId, clientId };
    queryClient.removeQueries({ queryKey: keys.turn(responseId) });
    const result = await api.createTurn(responseId, { client_turn_id: clientId, response_revision: response.data.revision, captured_at: new Date().toISOString(), transcript: text, locale: 'ko-KR' }, clientId);
    if (latestTurn.current?.clientId !== clientId) return;
    latestTurn.current.turnId = result.data.turn_id;
    if (result.data.status === 'ready') await applyTurn(responseId, result.data.turn_id);
  }
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!foreground) { setStatus('background'); return; }
    const controller = new AbortController();
    void runUpdates({
      status: setStatus,
      bootstrap: async (signal) => {
        // Official alerts are displayed independently of personal guidance / model availability.
        const [config, home] = await Promise.all([api.config(signal), api.home(signal)]);
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        queryClient.setQueryData(keys.config, config);
        queryClient.setQueryData(keys.home, home);
        await Promise.all([
          ...home.data.active_alert_ids.map((id) => refreshAlert(id, signal)),
          ...home.data.active_response_ids.map((id) => refreshResponse(id, signal)),
        ]);
        // A ready event may have happened while the app was suspended.
        if (latestTurn.current?.turnId) await applyTurn(latestTurn.current.responseId, latestTurn.current.turnId, signal);
        return home.data.sync_cursor;
      },
      poll: api.updates,
      apply: async (event, signal) => {
        if (event.type.startsWith('alert.')) await refreshAlert(event.resource_id, signal, event.resource_revision);
        else if (event.type.startsWith('response.')) await refreshResponse(event.resource_id, signal, event.resource_revision);
        else if (event.type === 'voice_turn.ready' && event.response_id) await applyTurn(event.response_id, event.resource_id, signal);
        else {
          await queryClient.invalidateQueries({ queryKey: keys.profile });
          const home = await api.home(signal);
          if (!signal.aborted) queryClient.setQueryData(keys.home, home);
          await Promise.all(home.data.active_response_ids.map((id) => refreshResponse(id, signal)));
        }
      },
    }, controller.signal);
    return () => controller.abort();
  }, [foreground, generation]);
  return <RuntimeContext.Provider value={{ status, foreground, restart, refreshResponse, sendText }}>{children}</RuntimeContext.Provider>;
}
export function AppProviders({ children }: React.PropsWithChildren) { return <QueryClientProvider client={queryClient}><Runtime>{children}</Runtime></QueryClientProvider>; }
export function useRuntime() { const context = useContext(RuntimeContext); if (!context) throw new Error('AppProviders required'); return context; }
export function markGuidanceStale(versions: Partial<ResponseSnapshot['input_versions']> = {}, responseId?: string) {
  inputRequirements.require(versions, responseId);
  queryClient.setQueriesData<Envelope<ResponseSnapshot>>({ queryKey: responseId ? keys.response(responseId) : ['response'] }, (old) => old ? { ...old, meta: { ...old.meta, data_status: 'stale' } } : old);
}
export function useSnapshot(id: string) { return useQuery({ queryKey: keys.response(id), queryFn: ({ signal }) => api.response(id, signal).then((v) => acceptRevision(queryClient.getQueryData<Envelope<ResponseSnapshot>>(keys.response(id)), checkedResponse(v, id))), enabled: !!id }); }
export function useClock() { const [now, setNow] = useState(Date.now()); useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []); return now; }
export const isMock = settings.mode === 'mock';
