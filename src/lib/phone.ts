/**
 * Phone Number Utilities
 *
 * Handles parsing, cleaning, and formatting phone numbers across the platform.
 * Supports strings containing single or multiple phone numbers separated by
 * slashes (/), commas (,), pipes (|), semicolons (;), or words like 'and' / '&'.
 */

export interface ParsedPhoneNumber {
  /** The formatted display label (e.g. "+2 01042430127") */
  display: string
  /** The clean RFC 3966 `tel:` URI value (e.g. "+201042430127") */
  telUri: string
  /** Clean international digits without symbols for WhatsApp or SMS (e.g. "201042430127") */
  cleanDigits: string
}

/**
 * Parses a phone number string that may contain one or multiple phone numbers.
 *
 * @example
 * parsePhoneNumbers("+2 01042430127 / +2 01042370148")
 * // Returns:
 * // [
 * //   { display: "+2 01042430127", telUri: "+201042430127", cleanDigits: "201042430127" },
 * //   { display: "+2 01042370148", telUri: "+201042370148", cleanDigits: "201042370148" }
 * // ]
 */
export function parsePhoneNumbers(rawPhone?: string | null): ParsedPhoneNumber[] {
  if (!rawPhone || !rawPhone.trim()) {
    return []
  }

  // Split by common separators: /, ,, |, ;, " & ", " and ", " - " (surrounded by spaces)
  const segments = rawPhone
    .split(/[\/,|;]|\s+&\s+|\s+and\s+|\s+-\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const parsed: ParsedPhoneNumber[] = []

  for (const segment of segments) {
    const hasPlus = segment.startsWith('+')
    const digitsOnly = segment.replace(/\D/g, '')

    // Only consider valid if it has at least 6 digits (avoids empty symbols or noise)
    if (digitsOnly.length >= 6) {
      parsed.push({
        display: segment,
        telUri: hasPlus ? `+${digitsOnly}` : digitsOnly,
        cleanDigits: digitsOnly,
      })
    }
  }

  return parsed
}

/**
 * Returns the primary (first) clean phone number.
 * Useful for single-button CTAs like "Call Us" or mobile quick dialers.
 */
export function getPrimaryPhoneNumber(rawPhone?: string | null): ParsedPhoneNumber | null {
  const parsed = parsePhoneNumbers(rawPhone)
  return parsed.length > 0 ? parsed[0] : null
}

/**
 * Generates a clean WhatsApp direct chat URL.
 */
export function getWhatsAppLink(rawPhone?: string | null, message?: string): string | null {
  const primary = getPrimaryPhoneNumber(rawPhone)
  if (!primary) return null

  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${primary.cleanDigits}${encodedMsg}`
}
