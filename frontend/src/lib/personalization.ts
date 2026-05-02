const RECENT_KEY = 'nestmart-recently-viewed';
const CATEGORY_KEY = 'nestmart-category-clicks';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function trackProductView(productId: string, category: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const recent = safeParse<string[]>(window.localStorage.getItem(RECENT_KEY), []);
  const nextRecent = [productId, ...recent.filter((id) => id !== productId)].slice(0, 8);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));

  const categoryClicks = safeParse<Record<string, number>>(window.localStorage.getItem(CATEGORY_KEY), {});
  const nextClicks = {
    ...categoryClicks,
    [category]: (categoryClicks[category] ?? 0) + 1
  };
  window.localStorage.setItem(CATEGORY_KEY, JSON.stringify(nextClicks));
}

export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return safeParse<string[]>(window.localStorage.getItem(RECENT_KEY), []);
}

export function getCategoryClicks(): Record<string, number> {
  if (typeof window === 'undefined') {
    return {};
  }
  return safeParse<Record<string, number>>(window.localStorage.getItem(CATEGORY_KEY), {});
}
