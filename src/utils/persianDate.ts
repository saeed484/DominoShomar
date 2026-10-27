/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(input: string | number): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

/**
 * Returns formatted Jalali / Persian date & time string
 */
export function getFormattedPersianDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleString('fa-IR');
  }
}

/**
 * Returns a short Persian date (e.g. ۱۴۰۳/۰۸/۰۶)
 */
export function getShortPersianDate(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
}
