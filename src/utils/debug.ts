export function isDebugMode(): boolean {
  return new URLSearchParams(window.location.search).has('debug');
}
