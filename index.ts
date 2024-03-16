import type { Route, HttpMethods, RouteHandler } from "./types";

function splitPath(path: string) {
  return path.split("/").filter((item) => item !== "");
}

export async function Router(
  request: Request,
  routes: Route[]
): Promise<Response> {
  //get url OK
  try {
    const url = new URL(request.url);
    const reqMethod = request.method.toUpperCase();
    //parse url
    const splittedPath = splitPath(url.pathname);
    //get url keys if exist
    if (splittedPath.length == 0) {
      const rootRoute = routes.find((route) => route.path === "/");
      const methodAllowed = rootRoute?.methods[reqMethod as HttpMethods];
      if (rootRoute && methodAllowed) {
        return methodAllowed(
          request,
          url.searchParams as unknown as URLSearchParams
        );
      } else {
        return new Response("Route not found or invalid method");
      }
    }

    let newUrl: string = "";
    if (splittedPath.length > 1) {
      newUrl = splittedPath.join("/");
    } else {
      newUrl = splittedPath[0];
    }

    const routeExists = routes.find((route) => {
      return route.path === newUrl;
    });

    if (!routeExists) {
      return new Response("route not found");
    }

    //checking if the provided method is valid
    if (!["GET", "POST", "PUT", "PATCH"].includes(request.method)) {
      return new Response("method not allowed");
    }

    // checking if the method is allowed for that route
    const methodAllowed = routeExists.methods[request.method as HttpMethods];

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

    const handler = routeExists.methods[request.method as HttpMethods];
    if (typeof handler !== "function") {
      return new Response("method not allowed");
    }

    try {
      return handler(request, url.searchParams as unknown as URLSearchParams);
    } catch (error: any) {
      return new Response(error.message);
    }
  } catch (error: any) {
    return new Response(error.message);
  }
}
