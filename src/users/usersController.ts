export function fakeCallback(params: URLSearchParams) {
  params.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });
  return new Response("fake callback");
}

export function fakePost(test: string) {
  return new Response(`fake post ${test}`);
}
