export async function safeBrowserNotify(title: string, body: string) {
  // only works in client context – we’ll broadcast the data
  // socket message will trigger the toast on the client
  // (no-op on server – safe)
}