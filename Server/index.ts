import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { findPath, findEmergencyPath } from "./graph.ts";

const app = new Application();
const router = new Router();

// Get port from environment variable or use default
const port = parseInt(Deno.env.get("PORT") || "8000");

router.get("/path", (ctx) => {
  try {
    const start = ctx.request.url.searchParams.get("start");
    const end = ctx.request.url.searchParams.get("end");
    const emergencyParam = ctx.request.url.searchParams.get("emergency");
    const isEmergency =
      emergencyParam !== null && emergencyParam.toLowerCase() === "true";

    if (!start) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Please provide start parameter." };
      return;
    }

    let pathResult;
    try {
      if (isEmergency) {
        pathResult = findEmergencyPath(start);
      } else {
        if (!end) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Please provide end parameter for normal navigation." };
          return;
        }
        pathResult = findPath(start, end);
      }
    } catch (error) {
      console.error("Path finding error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to calculate path" };
      return;
    }

    if (pathResult.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "No path found." };
      return;
    }

    ctx.response.body = {
      path: pathResult,
      type: isEmergency ? "emergency" : "normal",
    };
  } catch (error) {
    console.error("Request handling error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

// Add shutdown handler
app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Server running on ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`,
  );
});

// Start the server
try {
  await app.listen({ port });
} catch (error) {
  console.error("Failed to start server:", error);
  Deno.exit(1);
}
