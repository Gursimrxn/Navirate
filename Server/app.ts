import { Application, Router, RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { findPath } from "./graph.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
const router = new Router();

router.get("/api/path", (ctx: RouterContext) => {
  const start = ctx.request.url.searchParams.get("start");
  const end = ctx.request.url.searchParams.get("end");
  if (!start || !end) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Please provide start and end query parameters." };
    return;
  }
  const pathResult = findPath(start, end);
  if (pathResult.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: "No path found." };
    return;
  }
  ctx.response.body = { path: pathResult };
});

const app = new Application();

app.use(oakCors({ origin: "*" }));
app.use(router.routes());
app.use(router.allowedMethods());

const port = 5000;
console.log(`Server is running at http://localhost:${port}`);
await app.listen({ port });
