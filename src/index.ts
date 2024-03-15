import Bun from "bun";
import { fakeCallback, fakePost } from "./users/usersController";

type HttpMethods = "GET" | "POST" | "PUT" | "PATCH";
type RouteHandler =
  | ((request: Request, params: URLSearchParams) => Promise<Response>)
  | ((request: Request, params: URLSearchParams) => Response);

interface Route {
  route: string;
  path: string;
  methods: Partial<Record<HttpMethods, RouteHandler>>;
  middlewares: Function[];
  queries: string[];
}

const routes = [
  {
    route: "home",
    path: "home",
    queries: ["authors", "tags"],
    methods: {},
    middlewares: [],
  },
];

Bun.serve({
  fetch(request: Request): Response | Promise<Response> {
    return Router(request, routes);
  },
});

//TODO: Type everything
//TODO: Handle errors
//TODO: Find a way to handle subroutes

function splitPath(path: string) {
  return path.split("/").filter((item) => item !== "");
}

export async function Router(
  request: Request,
  routes: Route[]
): Promise<Response> {
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

  // Checking if the first segment of the pathname has a corresponding route
  const routeExists = routes.find(
    (route: Route) => route.path === splittedPath[0]
  );

  //if not you're getting an error
  if (!routeExists) {
    return new Response("route not found");
  }

  //checking if the provided method is valid
  if (!["GET", "POST", "PUT", "PATCH"].includes(reqMethod)) {
    return new Response("method not allowed");
  }

  // checking if the method is allowed for that route
  const methodAllowed = routeExists.methods[reqMethod as HttpMethods];

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

  //TODO: check for the search params type
  try {
    return routeExists.methods[reqMethod as HttpMethods](
      request,
      url.searchParams as unknown as URLSearchParams
    );
  } catch (error: any) {
    return new Response(error.message);
  }
}
