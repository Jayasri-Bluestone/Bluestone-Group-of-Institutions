import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes without style conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}