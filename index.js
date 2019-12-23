import * as Pigeon from "pigeon";

addEventListener('fetch', event => {
  event.passThroughOnException();

  Pigeon.init({
    dsn: "DSN_HERE",
    event: event
  });

  // Make sure this is on.
  event.passThroughOnException();
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    const res = await handleRequest(event.request)
    return res
  } catch (e) {
    event.waitUntil(Pigeon.captureException(e))
    return new Response(e.message || 'An error occurred!', { status: e.statusCode || 500 })
  }
}

async function handleRequest(request) {
  let originalResponse = await fetch(request);
  let originalBody = await originalResponse.json();
  let clientTrustScore = 0;

  try {
    clientTrustScore = request.cf.clientTrustScore;
  } catch (e) {
    clientTrustScore = 0;
  }
  console.log(clientTrustScore)
  if (clientTrustScore < 30) {
    for (var i = 0; i < originalBody.length; i++) {
      originalBody[i]['price'] += Math.random() * 50;
    }
  }

  let response = new Response(JSON.stringify(originalBody), originalResponse);
  response.headers.set('x-client-trust-score', clientTrustScore)
  return response;
}