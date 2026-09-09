export type NavSearchFallback = Record<string, string>;

function toSearchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

export function splitNavUrl(url: string): {
  pathname: string;
  searchParams: URLSearchParams;
} {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) {
    return { pathname: url, searchParams: new URLSearchParams() };
  }

  return {
    pathname: url.slice(0, queryIndex),
    searchParams: new URLSearchParams(url.slice(queryIndex + 1)),
  };
}

export function isSectionHomePath(pathname: string): boolean {
  return pathname.split("/").filter(Boolean).length === 1;
}

export function isNavPathnameActive(
  pathname: string,
  targetPathname: string,
): boolean {
  if (isSectionHomePath(targetPathname)) {
    return pathname === targetPathname;
  }

  return (
    pathname === targetPathname || pathname.startsWith(`${targetPathname}/`)
  );
}

export function isNavUrlActive(
  pathname: string,
  currentSearch: string,
  url: string,
  searchFallback?: NavSearchFallback,
): boolean {
  const { pathname: targetPathname, searchParams: targetParams } =
    splitNavUrl(url);

  if (!isNavPathnameActive(pathname, targetPathname)) {
    return false;
  }

  const targetEntries = [...targetParams.entries()];
  if (targetEntries.length === 0) {
    return true;
  }

  const currentParams = toSearchParams(currentSearch);

  return targetEntries.every(([key, value]) => {
    const current = currentParams.get(key) ?? searchFallback?.[key] ?? null;
    return current === value;
  });
}
