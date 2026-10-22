/** Accept embed session tokens only from the page itself or the native WebView. */
export function isTrustedEmbedSessionOrigin(
  eventOrigin: string,
  pageOrigin: string,
  hasNativeHost: boolean,
): boolean {
  if (eventOrigin === pageOrigin) return true;
  return hasNativeHost && (eventOrigin === "" || eventOrigin === "null");
}
