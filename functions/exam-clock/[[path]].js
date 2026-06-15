export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  const targetUrl = 'https://dp-exam-clock.pages.dev' + url.pathname + url.search;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    redirect: 'manual'
  });

  return response;
}