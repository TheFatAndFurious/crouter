import Bun from "bun";
import { initializeDb } from "./data/database";
import { Router } from "./Router";
import { fakeCallback, fakePost } from "./users/usersController";
import { fakeMiddleware } from "./middlewares/testMiddleware";
import { encoreUnTest } from "./middlewares/anotherMid";
initializeDb();

type HttpMethods = "GET" | "POST" | "PUT" | "PATCH";
type RouteHandler =
  | ((request: Request, res: Response) => Promise<Response> | void)
  | ((request: Request, response: Response) => Response | void);

interface Route {
  route: string;
  path: string;
  methods: Record<HttpMethods, RouteHandler>;
  middlewares: Function[];
  queries: HttpMethods[];
}

const routes = [
  {
    route: "home",
    path: "home",
    queries: ["authors", "tags"],
    methods: { GET: fakeCallback, POST: fakePost },
    middlewares: [fakeMiddleware, encoreUnTest],
  },
];

Bun.serve({
  fetch(request: Request): Response | Promise<Response> {
    return Router(request, routes);
  },
});
