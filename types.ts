export type HttpMethods = "GET" | "POST" | "PUT" | "PATCH";
export type RouteParams = { [key: string]: string };
export type RouteHandler =
  | ((
      request: Request,
      params: URLSearchParams,
      routeParams: RouteParams
    ) => Promise<Response>)
  | ((
      request: Request,
      params: URLSearchParams,
      routeParams: RouteParams
    ) => Response);

export interface Route {
  route: string;
  path: string;
  methods: Partial<Record<HttpMethods, RouteHandler>>;
  middlewares: Function[];
  queries: string[];
}
