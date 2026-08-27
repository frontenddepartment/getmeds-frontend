import { useState, useEffect } from 'react';
import { sanityQuery } from './sanityProxy';

export interface StaticPageDoc<T = any> {
  _id: string;
  _type: 'staticPage';
  pageName: string;
  title?: string;
  data?: T;
  lastSynced?: string;
}

/**
 * Direct GROQ query to retrieve a static page document from Sanity CMS (read-only).
 */
export async function getStaticPageFromSanity<T = any>(pageName: string): Promise<T | null> {
  try {
    const query = `*[_type == "staticPage" && pageName == $pageName][0]`;
    const res = await sanityQuery<any>(query, { pageName });
    if (res && res.data) {
      if (typeof res.data === 'string') {
        return JSON.parse(res.data) as T;
      }
      return res.data as T;
    }
    return null;
  } catch (err) {
    console.warn(`[Sanity Read] Failed to fetch static page '${pageName}' from Sanity:`, err);
    return null;
  }
}

/**
 * React hook to fetch static page data from Sanity CMS with fallback to local /data/static/<pageName>.json
 */
export function useStaticPage<T = any>(pageName: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      // 1. Try reading from Sanity database (read-only)
      const sanityResult = await getStaticPageFromSanity<T>(pageName);
      if (sanityResult && isMounted) {
        setData(sanityResult);
        setLoading(false);
        return;
      }

      // 2. Fallback to local /data/static/<pageName>.json
      try {
        const response = await fetch(`/data/static/${pageName}.json`, { cache: 'no-store' });
        if (response.ok) {
          const localJson = await response.json();
          if (isMounted) {
            setData(localJson as T);
            setLoading(false);
          }
          return;
        }
      } catch (err: any) {
        console.warn(`[Static Fallback] Could not load local /data/static/${pageName}.json`, err);
        if (isMounted) {
          setError(err);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [pageName]);

  return { data, loading, error };
}
