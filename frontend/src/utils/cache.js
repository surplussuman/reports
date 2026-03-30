// Module-level in-memory cache for large datasets that can't fit in localStorage
// Cleared on page refresh (intentional — forces fresh data on each session)
export const _atsCache = { data: null };
