export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  if (url.pathname === '/blog') {
    return Response.redirect(url.origin + '/blog/', 301);
  }
  
  const targetUrl = 'https://dp-exam-clock.pages.dev' + url.pathname + url.search;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    redirect: 'manual'
  });

  return response;
}