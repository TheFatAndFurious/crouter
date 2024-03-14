import Bun from "bun";
import { initializeDb } from "./data/database";
import { Router } from "./Router";
import { fakeCallback, fakePost } from "./users/usersController";
import { fakeMiddleware } from "./middlewares/testMiddleware";
import { encoreUnTest } from "./middlewares/anotherMid";
initializeDb();

const routes = [
  {
    route: "home",
    path: "home",
    queries: ["authors", "tags"],
    methods: { GET: fakeCallback, POST: fakePost },
    middlewares: [fakeMiddleware, encoreUnTest],
  },
  {
    route: "about",
    path: "about",
    methods: ["POST"],
  },
  {
    route: "contact",
    path: "contact",
    methods: ["GET"],
  },
];

Bun.serve({
  fetch(request: Request): Response | Promise<Response> {
    return Router(request, routes);
  },
});
