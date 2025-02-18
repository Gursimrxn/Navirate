import createGraph from "npm:ngraph.graph";
import * as path from 'npm:ngraph.path';
const graph = createGraph();
const nodeData = {
  5:  { x: 76.66057423511904, y: 30.516562768022, floor: "G" },
  6:  { x: 76.66057391235302, y: 30.51655136768173, floor: "G" },
  7:  { x: 76.66053808534917, y: 30.51654719682537, floor: "G" },
  8:  { x: 76.66060463628912, y: 30.516553131535645, floor: "G" },
  9:  { x: 76.66060530709979, y: 30.516543885253228, floor: "G" },
  10: { x: 76.66062593456138, y: 30.516531171614133, floor: "G" },
  11: { x: 76.66065964285411, y: 30.516554720739748, floor: "G" },
  12: { x: 76.66067540330704, y: 30.516551541809207, floor: "G" },
  13: { x: 76.6606795642544,  y: 30.516532512126687, floor: "G" },
  14: { x: 76.66057283207857, y: 30.51653154462244, floor: "G" },
  15: { x: 76.66053776177438, y: 30.5165361533207, floor: "G" },
  16: { x: 76.66057101231672, y: 30.516486245001133, floor: "G" },
  17: { x: 76.66055328639578, y: 30.51648607165012, floor: "G" },
  18: { x: 76.66055403999752, y: 30.516474385777656, floor: "G" },
  19: { x: 76.6605698775611,  y: 30.51644970016956, floor: "G" },
  20: { x: 76.6605885593126,  y: 30.51644955415925, floor: "G" },
  21: { x: 76.66056745846367, y: 30.516363533092033, floor: "G" },
  22: { x: 76.66058479129703, y: 30.516367953497877, floor: "G" },
  23: { x: 76.6605859216989,  y: 30.516351073884223, floor: "G" },
  24: { x: 76.66055050242096, y: 30.51633906338742, floor: "G" },
  25: { x: 76.6605659539511,  y: 30.516286518425915, floor: "G" },
  26: { x: 76.66052641626811, y: 30.516554638312158, floor: "G" },
  27: { x: 76.66053227517625, y: 30.516498103905235, floor: "G" },
  28: { x: 76.66063881855825, y: 30.51648519287268, floor: "G" },
  29: { x: 76.66052612466649, y: 30.51652851155896, floor: "G" },
  30: { x: 76.66063433391935, y: 30.516404752009677, floor: "G" },
  31: { x: 76.66053138417857, y: 30.516389098030473, floor: "G" },
  32: { x: 76.66063022327751, y: 30.516318146347587, floor: 1 },
  33: { x: 76.6605660237139,  y: 30.516271218785093, floor: "G" },
  34: { x: 76.66058521026105, y: 30.516247845365285, floor: "G" },
  35: { x: 76.66061184941827, y: 30.516237881492756, floor: "G" },
  36: { x: 76.66064394971983, y: 30.516237708765942, floor: "G" }
};
Object.entries(nodeData).forEach(([id, coord]) => {
  graph.addNode(id.toString(), coord);
});
const connections = [
  [5, 6], [5, 7],
  [6, 14], [6, 7], [6, 8],
  [7, 26],
  [8, 9], [8, 11],
  [9, 10],
  [11, 12],
  [12, 13],
  [14, 15], [14, 16],
  [15, 29],
  [16, 17], [16, 18], [16, 19],
  [17, 27],
  [18, 19],
  [19, 20], [19, 21],
  [20, 28],
  [21, 22], [21, 23], [21, 24], [21, 25],
  [22, 30],
  [23, 32],
  [24, 31],
  [21, 33],
  [33, 34],
  [34, 35],
  [35, 36]
];
connections.forEach(([source, target]) => {
  const s = source.toString();
  const t = target.toString();
  graph.addLink(s, t);
  graph.addLink(t, s);
});
const pathFinder = path.aStar(graph, {
  distance(fromNode, toNode) {
    if (!fromNode.data || !toNode.data) return 0;
    const dx = fromNode.data.x - toNode.data.x;
    const dy = fromNode.data.y - toNode.data.y;
    return Math.sqrt(dx * dx + dy * dy) * 111319.9;
  },
  heuristic(fromNode, toNode) {
    if (!fromNode.data || !toNode.data) return 0;
    const dx = fromNode.data.x - toNode.data.x;
    const dy = fromNode.data.y - toNode.data.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
});
export function getNodeName(id: string | number): string {
  const names: Record<number, string> = {
    5:  'Main Door',
    6:  'Main Entrance',
    7:  'Node 7',
    8:  'Node 8',
    9:  'Node 9',
    10: 'Conference Room',
    11: 'Node 11',
    12: 'Node 12',
    13: 'Node 13',
    14: 'Node 14',
    15: 'Node 15',
    16: 'Node 16',
    17: 'Node 17',
    18: 'Node 18',
    19: 'Node 19',
    20: 'Node 20',
    21: 'Node 21',
    22: 'Node 22',
    23: 'Node 23',
    24: 'Node 24',
    25: 'Node 25',
    26: 'Wing Commander',
    27: 'Cabin 2',
    28: 'Computer Lab 004',
    29: 'Cabin 1',
    30: 'Computer Lab 005',
    31: 'Classroom 4',
    32: 'Makers Lab 005',
    36: 'Lift Endpoint'
  };
  return names[Number(id)] || `Node ${id}`;
}
export function findPath(startNodeId: string, endNodeId: string, currentFloor?: string) {
  const startNode = graph.getNode(startNodeId);
  const endNode = graph.getNode(endNodeId);
  if (!startNode?.data || !endNode?.data) {
    throw new Error(`Node not found: ${startNodeId} or ${endNodeId}`);
  }
  const startFloor = startNode.data.floor;
  const endFloor = endNode.data.floor;
  if (startFloor === endFloor) {
    const p = pathFinder.find(startNodeId, endNodeId);
    if (!p || p.length === 0) {
      throw new Error(`No path found between ${startNodeId} and ${endNodeId}`);
    }
    const sortedPath = p.reverse();
    return sortedPath.map(n => ({
      id: n.id,
      name: getNodeName(n.id),
      coordinates: { ...n.data, floor: String(n.data.floor) }
    }));
  } else {
    const liftId = "36";
    const pathToLift = pathFinder.find(startNodeId, liftId);
    const pathFromLift = pathFinder.find(liftId, endNodeId);
    if (!pathToLift || pathToLift.length === 0 || !pathFromLift || pathFromLift.length === 0) {
      throw new Error(`No multi-floor path found between ${startNodeId} and ${endNodeId}`);
    }
    const sortedPathToLift = pathToLift.reverse();
    const sortedPathFromLift = pathFromLift.reverse();
    const leg1 = sortedPathToLift.map(n => ({
      id: n.id,
      name: getNodeName(n.id),
      coordinates: { ...n.data, floor: String(n.data.floor) }
    }));
    const leg2 = sortedPathFromLift.map(n => ({
      id: n.id,
      name: getNodeName(n.id),
      coordinates: { ...n.data, floor: String(endFloor) }
    }));
    const completePath = [...leg1, ...leg2];
    if (currentFloor) {
      if (currentFloor === startFloor) {
        return leg1;
      } else if (currentFloor === String(endFloor)) {
        return leg2;
      }
    }
    return completePath;
  }
}
export function findEmergencyPath(startNodeId: string) {
  const mainDoorId = "5"; 
  const liftId = "36";

  const startNode = graph.getNode(startNodeId);
  const endNode = graph.getNode(mainDoorId);
  if (!startNode?.data || !endNode?.data) {
    throw new Error(`Node not found: ${startNodeId} or ${mainDoorId}`);
  }

  const startFloor = startNode.data.floor;
  const mainDoorFloor = endNode.data.floor;

  // If already on the same floor
  if (startFloor === mainDoorFloor) {
    const directPath = pathFinder.find(startNodeId, mainDoorId);
    if (!directPath || directPath.length === 0) {
      throw new Error(`No emergency path found from ${startNodeId} to ${mainDoorId}`);
    }
    return directPath.reverse().map(n => ({
      id: n.id,
      name: getNodeName(n.id),
      coordinates: { ...n.data, floor: String(n.data.floor) }
    }));
  }

  // Multi-floor path: start -> lift -> main door
  const pathToLift = pathFinder.find(startNodeId, liftId);
  const pathFromLift = pathFinder.find(liftId, mainDoorId);
  if (!pathToLift || !pathToLift.length || !pathFromLift || !pathFromLift.length) {
    throw new Error(`No multi-floor emergency path from ${startNodeId} to ${mainDoorId}`);
  }

  const leg1 = pathToLift.reverse().map(n => ({
    id: n.id,
    name: getNodeName(n.id),
    coordinates: { ...n.data, floor: String(n.data.floor) }
  }));

  const leg2 = pathFromLift.reverse().map(n => ({
    id: n.id,
    name: getNodeName(n.id),
    coordinates: { ...n.data, floor: String(n.data.floor) }
  }));

  return [...leg1, ...leg2];
}