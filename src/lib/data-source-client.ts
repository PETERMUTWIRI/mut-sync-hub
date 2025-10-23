export async function createDataSourceAPI(payload: FormData) {
  const res = await fetch('/api/datasources', {
    method: 'POST',
    body: payload, // FormData auto-sets headers
  });
  if (!res.ok) throw new Error((await res.text()) || 'Unknown error');
  return res.json(); // { id, engine }
}