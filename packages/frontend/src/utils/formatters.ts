/**
 * Format pence to pounds sterling (£)
 * @param pence - Amount in pence
 * @returns Formatted string like "£1.23"
 */
export function formatPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
