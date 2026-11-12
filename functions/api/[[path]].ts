interface Env {
  API_ORIGIN: string;
}
export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  if (!env.API_ORIGIN) return Response.json({ code: 'API_NOT_CONFIGURED' }, { status: 503 });
  const incoming = new URL(request.url);
  const upstream = new URL(incoming.pathname + incoming.search, env.API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete('host');
  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
  const output = new Headers(response.headers);
  output.set('cache-control', 'no-store, no-transform');
  return new Response(response.body, { status: response.status, headers: output });
};
