function splitPath(path: string) {
  return path.split("/").filter((item) => item !== "");
}

export async function Router(request: Request, routes: any): Promise<Response> {
  //get url OK
  const url = new URL(request.url);
  //get method
  const reqMethod = request.method;
  //parse url
  const splittedPath = splitPath(url.pathname);
  //get url keys if exist

  if (splittedPath.length == 0) {
    return new Response("welcome home");
  }

  const searchParams = url.searchParams;

  const routeExists = routes.find(
    (route: any) => route.path === splittedPath[0]
  );

  if (!routeExists) {
    return new Response("route not found");
  }

  const methodAllowed = routeExists.methods[reqMethod];

  if (!methodAllowed) {
    return new Response("method not allowed");
  }

  if (routeExists.middlewares.length > 0) {
    for (const middleware of routeExists.middlewares) {
      await middleware();
    }
  }

  if (reqMethod === "POST") {
    try {
      const bodyData = await request.text();
      return routeExists.methods[reqMethod](bodyData);
    } catch (error: any) {
      return new Response(error.message);
    }
  }
  return routeExists.methods[reqMethod](searchParams);
}
