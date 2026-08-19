/**
 * Known international news outlet names.
 * Partial, case-insensitive matching is used, so "BBC News" will match
 * source names like "BBC News - World" or "BBC News International".
 *
 * TODO: Replace this frontend filter with a backend `?region=international`
 * query param once the Source entity gains a region/country field.
 */
export const INTERNATIONAL_SOURCE_NAMES: string[] = [
  'BBC News',
  'Al Jazeera',
  'Reuters',
  'The Guardian',
  'Dawn',
  'CNN International',
  'CNN',
  'France 24',
  'Deutsche Welle',
  'DW',
  'The Independent',
  'Associated Press',
  'AFP',
  'Sky News',
  'euronews',
  'The Times',
  'The Telegraph',
  'Financial Times',
  'Bloomberg',
  'The Economist',
  'Le Monde',
  'Der Spiegel',
  'Haaretz',
  'South China Morning Post',
  'Arab News',
  'Geo News',
];

/**
 * Returns true if the given source name partially matches any known
 * international outlet name (case-insensitive).
 *
 * Example: isInternationalSource("BBC News - World") → true
 */
export function isInternationalSource(sourceName: string): boolean {
  const lower = sourceName.toLowerCase();
  return INTERNATIONAL_SOURCE_NAMES.some((name) =>
    lower.includes(name.toLowerCase()) || name.toLowerCase().includes(lower)
  );
}
