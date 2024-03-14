//TODO: Type everything
//TODO: Handle errors
//TODO: Handle PUT, PATCH, DELETE methods
//TODO: Find a way to handle subroutes

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

  //TODO: update that route to make sure it is able to handle params or subroutes
  if (splittedPath.length == 0) {
    return new Response("welcome home");
  }

  // Here we get the search params
  const searchParams = url.searchParams;

  // Checking if the first segment of the pathname has a corresponding route
  const routeExists = routes.find(
    (route: any) => route.path === splittedPath[0]
  );

  //if not you're getting an error
  if (!routeExists) {
    return new Response("route not found");
  }

  // checking if the method is allowed for that route
  const methodAllowed = routeExists.methods[reqMethod];

  // if not you're getting an error
  if (!methodAllowed) {
    return new Response("method not allowed");
  }

  // if route and method are both ok we're going to run the middlewares associated to that route
  if (routeExists.middlewares.length > 0) {
    for (const middleware of routeExists.middlewares) {
      await middleware();
    }
  }

  if (reqMethod === "POST") {
    // if the method is POST we're going to run the callback associated to that route and provide him with the request.body
    try {
      const bodyData = await request.text();
      return routeExists.methods[reqMethod](bodyData);
    } catch (error: any) {
      return new Response(error.message);
    }
  }
  // if the method is GET we're going to run the callback associated to that route and provide him with the request.searchParams
  return routeExists.methods[reqMethod](searchParams);
}
