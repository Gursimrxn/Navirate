import { Application, Router } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import createGraph from "npm:ngraph.graph";
import * as path from "npm:ngraph.path";
import { BuildingData, PathPoint } from "./types.ts";

const app = new Application();
const router = new Router();

// Load building data dynamically
const buildingsDir = "./data/buildings";
const buildingFiles = Deno.readDirSync(buildingsDir);
const buildings: BuildingData[] = [];
const graph = createGraph();

for (const file of buildingFiles) {
  if (file.isFile && file.name.endsWith(".json")) {
    const buildingData: BuildingData = JSON.parse(
      Deno.readTextFileSync(`${buildingsDir}/${file.name}`)
    );
    buildings.push(buildingData);

    // Add nodes with prefixed IDs (e.g., "building1-5")
    Object.entries(buildingData.nodes).forEach(([nodeId, coord]) => {
      const fullId = `${buildingData.id}-${nodeId}`;
      graph.addNode(fullId, { ...coord, building: buildingData.id });
    });

    // Add bidirectional links with prefixed IDs
    buildingData.connections.forEach(([source, target]) => {
      const fullSource = `${buildingData.id}-${source}`;
      const fullTarget = `${buildingData.id}-${target}`;
      graph.addLink(fullSource, fullTarget);
      graph.addLink(fullTarget, fullSource);
    });
  }
}

// Initialize pathfinder
const pathFinder = path.aStar(graph, {
  distance(fromNode, toNode) {
    if (!fromNode.data || !toNode.data) return 0;
    const dx = fromNode.data.x - toNode.data.x;
    const dy = fromNode.data.y - toNode.data.y;
    return Math.sqrt(dx * dx + dy * dy) * 111319.9; // Approximate meters
  },
  heuristic(fromNode, toNode) {
    if (!fromNode.data || !toNode.data) return 0;
    const dx = fromNode.data.x - toNode.data.x;
    const dy = fromNode.data.y - toNode.data.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
});

// Store exits per building
const buildingExits: Record<string, string[]> = {};
buildings.forEach((building) => {
  buildingExits[building.id] = building.exits.map(
    (exit) => `${building.id}-${exit}`
  );
});

// Helper to get node name (placeholder, can be enhanced with POI data)
function getNodeName(id: string): string {
  return id; // Replace with actual name lookup if available
}

// Pathfinding functions
function findPath(startNodeId: string, endNodeId: string): PathPoint[] {
  const pathResult = pathFinder.find(startNodeId, endNodeId);
  if (!pathResult || pathResult.length === 0) {
    throw new Error(`No path found between ${startNodeId} and ${endNodeId}`);
  }
  return pathResult.reverse().map((n) => ({
    id: n.id,
    name: getNodeName(n.id),
    coordinates: n.data,
  }));
}

function findEmergencyPath(startNodeId: string): PathPoint[] {
  const buildingId = startNodeId.split("-")[0];
  const exits = buildingExits[buildingId];
  if (!exits || exits.length === 0) {
    throw new Error(`No exits defined for building ${buildingId}`);
  }
  let shortestPath: any[] = [];
  let minDistance = Infinity;
  exits.forEach((exitId) => {
    const pathToExit = pathFinder.find(startNodeId, exitId);
    if (pathToExit && pathToExit.length > 0) {
      const distance = pathToExit.length; // Can use actual distance if needed
      if (distance < minDistance) {
        minDistance = distance;
        shortestPath = pathToExit;
      }
    }
  });
  if (shortestPath.length === 0) {
    throw new Error(`No emergency path found from ${startNodeId}`);
  }
  return shortestPath.reverse().map((n) => ({
    id: n.id,
    name: getNodeName(n.id),
    coordinates: n.data,
  }));
}

// API Routes
router.get("/buildings", (ctx) => {
  const buildingList = buildings.map((b) => ({
    id: b.id,
    name: b.name,
    floors: b.floors,
    pois: b.pois.map((poi) => ({ ...poi, id: `${b.id}-${poi.id}` })),
    exits: b.exits.map((exit) => `${b.id}-${exit}`),
  }));
  ctx.response.body = buildingList;
});

router.post("/path/building/:buildingId", async (ctx) => {
  const { buildingId } = ctx.params;
  const body = await ctx.request.body().value;
  const { start, end, emergency } = body;

  if (!start) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Start node is required" };
    return;
  }

  try {
    let pathResult: PathPoint[];
    if (emergency) {
      pathResult = findEmergencyPath(start);
    } else {
      if (!end) {
        ctx.response.status = 400;
        ctx.response.body = { error: "End node is required for normal navigation" };
        return;
      }
      pathResult = findPath(start, end);
    }
    ctx.response.body = { path: pathResult, type: emergency ? "emergency" : "normal" };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

router.get("/geojson", (ctx) => {
  // Placeholder: Assuming a combined GeoJSON file exists or is generated
  const geojson = { type: "FeatureCollection", features: [] };
  ctx.response.body = geojson;
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
