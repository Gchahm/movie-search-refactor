import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Batched, merge-safe URL search params updater.
 *
 * Problem it solves: When multiple parts of the app update different query params
 * around the same time (e.g. `q` and `page`), separate `router.replace` calls
 * can race and overwrite each other because each call starts from a stale snapshot.
 *
 * Solution: we enqueue all mutators that arrive in the same tick and flush them
 * together in a single microtask, applying them to the latest window.location
 * search params and performing only one `router.replace` if needed.
 */

type Mutator = (params: URLSearchParams) => void;

let queue: Mutator[] = [];
let scheduled = false;
let lastRouter: AppRouterInstance | null = null;

function flushQueue() {
  scheduled = false;

  if (typeof window === 'undefined') return; // SSR guard
  const router = lastRouter;
  lastRouter = null;
  if (!router) return;

  const params = new URLSearchParams(window.location.search);
  for (const mut of queue) {
    try {
      mut(params);
    } catch {
      // ignore a single mutator failure; continue applying others
    }
  }
  queue = [];

  const next = params.toString();
  const current = window.location.search.startsWith('?')
    ? window.location.search.slice(1)
    : window.location.search;

  if (next !== current) {
    const path = window.location.pathname; // always use the latest path
    const url = next ? `${path}?${next}` : path;
    router.replace(url);
  }
}

export function replaceSearchParams(
  router: AppRouterInstance,
  mutator: (params: URLSearchParams) => void
) {
  if (typeof window === 'undefined') return; // SSR guard

  lastRouter = router; // keep the most recent router instance for the batch
  queue.push(mutator);

  if (!scheduled) {
    scheduled = true;
    // Microtask batching: flush after current call stack, before next paint
    Promise.resolve().then(flushQueue);
  }
}
