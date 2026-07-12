interface CalculateValidPageOptions {
  requestedPage: number
  totalPages: number
}

interface CalculateValidPageResult {
  shouldRedirect: boolean
  redirectToPage: number
}

/**
 * Centrally validates pagination bounds to prevent empty results.
 * Can be reused across Search, Admin, Seller Dashboard, Favorites, etc.
 *
 * @param options - The requested page and total pages
 * @returns If redirect is needed and the closest valid page (bounded between 1 and totalPages)
 */
export function calculateValidPage({
  requestedPage,
  totalPages,
}: CalculateValidPageOptions): CalculateValidPageResult {
  const maxPage = Math.max(1, totalPages)
  const shouldRedirect = requestedPage > maxPage
  const redirectToPage = shouldRedirect ? maxPage : requestedPage

  return {
    shouldRedirect,
    redirectToPage,
  }
}
