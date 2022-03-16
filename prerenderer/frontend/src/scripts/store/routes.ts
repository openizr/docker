interface Routes {
  [path: string]: () => Promise<unknown>;
}

export default {
  '/': () => import('scripts/pages/Home.svelte'),
  '/old': () => import('scripts/pages/Redirect.svelte'),
} as Routes;
