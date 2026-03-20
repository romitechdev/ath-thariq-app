export const firstWords = (text: string, limit = 10): string => {
  if (typeof text !== 'string') {
    return '-';
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '-';
  }

  if (words.length <= limit) {
    return words.join(' ');
  }

  return `${words.slice(0, limit).join(' ')}...`;
};