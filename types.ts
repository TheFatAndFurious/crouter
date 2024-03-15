export type HttpMethods = "GET" | "POST" | "PUT" | "PATCH";

export type RouteHandler =
  | ((request: Request, params: URLSearchParams) => Promise<Response>)
  | ((request: Request, params: URLSearchParams) => Response);

export interface Route {
  route: string;
  path: string;
  methods: Partial<Record<HttpMethods, RouteHandler>>;
  middlewares: Function[];
  queries: string[];
}
