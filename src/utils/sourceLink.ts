export const normalizeSourceLinks = (source: unknown): string[] => {
  if (Array.isArray(source)) {
    return source
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof source === 'string') {
    const trimmed = source.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

export const getSourceHref = (source?: string | null): string | null => {
  if (!source) {
    return null;
  }

  const trimmed = source.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
};
