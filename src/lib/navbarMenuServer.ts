// Server-only: the navbar's Product Range menu, built from the live catalogue so the real
// category and condition links are in every page's HTML. Without it the server sent the
// hard-coded placeholder menu (navbarMenu.ts STATIC_*), whose guessed addresses included a
// dozen 404s, and the real menu only appeared after JavaScript ran.
//
// Same query and builder the browser uses (loadDynamicMenu), so both render the same menu
// and the page hydrates without a swap. Cached for an hour like the rest of the catalogue
// (catalogServer.ts). Do not import this from a client component.
import { unstable_cache } from 'next/cache';
import { client } from './sanity';
import { buildDynamicMenu, CATALOG_QUERY, type MenuSection } from '@/components/navbarMenu';

/** The serialisable part of DynamicMenu; the browser adds `resolve` when its own fetch lands. */
export type ServerNavMenu = {
  desktopColumns: MenuSection[][] | null;
  mobileSections: MenuSection[] | null;
};

async function buildMenu(): Promise<ServerNavMenu | null> {
  const result = await client.fetch(CATALOG_QUERY);
  const menu = buildDynamicMenu(result);
  return menu ? { desktopColumns: menu.desktopColumns, mobileSections: menu.mobileSections } : null;
}

const getCachedMenu = unstable_cache(buildMenu, ['navbar-product-menu-v1'], {
  revalidate: 3600,
  tags: ['catalog'],
});

/** The menu, or null if Sanity can't be reached; the placeholder menu shows then (never throws). */
export async function getServerNavMenu(): Promise<ServerNavMenu | null> {
  try {
    return await getCachedMenu();
  } catch (err) {
    console.error('[navbarMenuServer] Failed to build the Product Range menu:', err);
    return null;
  }
}
