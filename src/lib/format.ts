/** Whole rupees as "₹1,499" (Indian digit grouping). */
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
