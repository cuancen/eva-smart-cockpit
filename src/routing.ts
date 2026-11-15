export type AppRoute = 'landing' | 'cockpit';

export function routeFromHash(hash: string): AppRoute {
  return hash.startsWith('#/cockpit') ? 'cockpit' : 'landing';
}
