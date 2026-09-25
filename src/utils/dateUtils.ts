/**
 * Utility functions for safe date formatting across LEXFLOW
 */

export function formatSafeDate(
  dateInput: string | number | Date | null | undefined, 
  fallback = 'Recently generated'
): string {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return fallback;
  }
}

export function formatSafeFullDate(
  dateInput: string | number | Date | null | undefined,
  fallback = 'Recent'
): string {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return fallback;
  }
}
