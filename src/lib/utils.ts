import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyIDR(amount: number): string {
  const num = Number(amount); // Ensure it's a number
  let formattedNumber;

  if (num % 1 === 0) { // Integer
    formattedNumber = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } else { // Has decimals
    formattedNumber = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  return `IDR ${formattedNumber}`;
}
