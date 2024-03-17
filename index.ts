import Bun from "bun";
import type { Route, HttpMethods, RouteHandler, RouteParams } from "./types";

async function fakeHamdlerGET(
  request: Request,
  params: URLSearchParams,
  routeParams: RouteParams
) {
  const paramsObject: Record<string, string> = {};
  const newParams = params.forEach((value, key) => {
    paramsObject[key] = value;
  });
  console.log("🚀 ~ newParams ~ newParams:", paramsObject, routeParams);

  return new Response(
    `search params: ${JSON.stringify(paramsObject, null, 2)}`
  );
}
async function fakeHamdlerGETsecondlevel(
  request: Request,
  params: URLSearchParams,
  routeParams: RouteParams
) {
  const paramsObject: Record<string, string> = {};
  const newParams = params.forEach((value, key) => {
    paramsObject[key] = value;
  });
  console.log("🚀 ~ newParams ~ newParams:", paramsObject);

  return new Response(
    `welcome to the second level: ${JSON.stringify(paramsObject, null, 2)}`
  );
}
async function fakeHamdlerGETthirdlevel(
  request: Request,
  params: URLSearchParams,
  routeParams: RouteParams
) {
  const paramsObject: Record<string, string> = {};
  const newParams = params.forEach((value, key) => {
    paramsObject[key] = value;
  });
  console.log("🚀 ~ newParams ~ newParams:", paramsObject);

  return new Response(
    `welcome to the THIRD level: ${JSON.stringify(paramsObject, null, 2)}`
  );
}

async function fakeHamdlerPOST(
  request: Request,
  params: URLSearchParams,
  routeParams: RouteParams
) {
  const bodyText = await request.text();
  console.log(bodyText);

  return new Response(bodyText);
}

const routes = [
  {
    route: "home",
    path: "home",
    queries: ["authors", "tags"],
    methods: { GET: fakeHamdlerGET, POST: fakeHamdlerPOST },
    middlewares: [],
  },
  {
    route: "home",
    path: "home/secondlevel",
    queries: ["authors", "tags"],
    methods: { GET: fakeHamdlerGETsecondlevel, POST: fakeHamdlerPOST },
    middlewares: [],
  },
  {
    route: "home",
    path: "home/secondlevel/thirdlevel",
    queries: ["authors", "tags"],
    methods: { GET: fakeHamdlerGETthirdlevel, POST: fakeHamdlerPOST },
    middlewares: [],
  },
  {
    route: "root",
    path: "/",
    queries: ["authors", "tags"],
    methods: { GET: fakeHamdlerGETthirdlevel, POST: fakeHamdlerPOST },
    middlewares: [],
  },
];

Bun.serve({
  fetch(request: Request): Response | Promise<Response> {
    return Router(request, routes);
  },
});

//TODO: Type everything

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
    //get method
    const reqMethod = request.method;
    //parse url
    let splittedPath = splitPath(url.pathname);
    // getting the ids if there are any
    let routeParams: RouteParams = {};
    if (splittedPath.length >= 2) {
      const testPath = splittedPath[splittedPath.length - 1];
      const isNumeric = /^\d+$/.test(testPath);
      if (isNumeric) {
        routeParams = { [splittedPath[splittedPath.length - 2]]: testPath };
        splittedPath = splittedPath.slice(0, splittedPath.length - 1);
      }
    }

    //get url keys if exist
    if (splittedPath.length == 0) {
      const rootRoute = routes.find((route) => route.path === "/");
      const methodAllowed = rootRoute?.methods[reqMethod as HttpMethods];
      if (rootRoute && methodAllowed) {
        return methodAllowed(
          request,
          url.searchParams as unknown as URLSearchParams,
          routeParams
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

    const handler = routeExists.methods[reqMethod as HttpMethods];
    if (typeof handler !== "function") {
      return new Response("method not allowed");
    }

    //TODO: check for the search params type
    try {
      return handler(
        request,
        url.searchParams as unknown as URLSearchParams,
        routeParams
      );
    } catch (error: any) {
      return new Response(error.message);
    }
  } catch (error: any) {
    return new Response(error.message);
  }
}
