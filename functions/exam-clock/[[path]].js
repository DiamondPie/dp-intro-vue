export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === '/exam-clock') {
    return Response.redirect(url.origin + '/exam-clock/', 301);
  }

  const targetPath = url.pathname.replace(/^\/exam-clock/, '');

  const targetUrl = 'https://dp-exam-clock.pages.dev' + targetPath + url.search;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    redirect: 'manual'
  });

  return response;
}