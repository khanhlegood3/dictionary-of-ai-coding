// Deterministic 3D force layout for the term map.
// It runs at build time, so the browser only has to draw fixed positions.

export type Vec3 = [number, number, number];

const ITERATIONS = 700;
const START_STEP = 0.35;
const SPRING = 0.9;
const GROUP_PULL = 0.22;
const CENTER_PULL = 0.12;

// Small seeded generator: the same input always gives the same map.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Place `count` nodes in a unit sphere.
 *
 * @param edges  Undirected pairs of node indexes. Linked nodes pull together.
 * @param groups Group id per node. Nodes of one group drift toward each other,
 *               so each curriculum section forms a loose region of the map.
 */
export function layoutGraph(
  count: number,
  edges: [number, number][],
  groups: number[]
): Vec3[] {
  const random = mulberry32(20260501);
  const pos: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    pos.push([random() * 2 - 1, random() * 2 - 1, random() * 2 - 1]);
  }

  const degree = new Array<number>(count).fill(0);
  for (const [a, b] of edges) {
    degree[a] = (degree[a] ?? 0) + 1;
    degree[b] = (degree[b] ?? 0) + 1;
  }

  const groupIds = [...new Set(groups)];

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const step = START_STEP * (1 - iteration / ITERATIONS) + 0.002;
    const force: Vec3[] = pos.map(() => [0, 0, 0]);

    // Every pair pushes apart.
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = pos[i] as Vec3;
        const b = pos[j] as Vec3;
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const dz = a[2] - b[2];
        const dist = Math.max(Math.hypot(dx, dy, dz), 0.02);
        const push = 1 / (dist * dist);
        const fi = force[i] as Vec3;
        const fj = force[j] as Vec3;
        fi[0] += (dx / dist) * push;
        fi[1] += (dy / dist) * push;
        fi[2] += (dz / dist) * push;
        fj[0] -= (dx / dist) * push;
        fj[1] -= (dy / dist) * push;
        fj[2] -= (dz / dist) * push;
      }
    }

    // Linked nodes pull together. Hubs pull less per link, or they would drag
    // the whole map into one clump.
    for (const [i, j] of edges) {
      const a = pos[i] as Vec3;
      const b = pos[j] as Vec3;
      const weight =
        SPRING / Math.sqrt(Math.max(degree[i] ?? 1, degree[j] ?? 1));
      const fi = force[i] as Vec3;
      const fj = force[j] as Vec3;
      for (let axis = 0; axis < 3; axis++) {
        const delta = ((b[axis] as number) - (a[axis] as number)) * weight;
        fi[axis] = (fi[axis] as number) + delta;
        fj[axis] = (fj[axis] as number) - delta;
      }
    }

    // Each node drifts toward the middle of its group, and toward the origin.
    for (const group of groupIds) {
      const members: number[] = [];
      groups.forEach((g, i) => {
        if (g === group) members.push(i);
      });
      const centroid: Vec3 = [0, 0, 0];
      for (const i of members) {
        const p = pos[i] as Vec3;
        centroid[0] += p[0] / members.length;
        centroid[1] += p[1] / members.length;
        centroid[2] += p[2] / members.length;
      }
      for (const i of members) {
        const p = pos[i] as Vec3;
        const f = force[i] as Vec3;
        for (let axis = 0; axis < 3; axis++) {
          const toGroup = (centroid[axis] as number) - (p[axis] as number);
          f[axis] =
            (f[axis] as number) +
            toGroup * GROUP_PULL -
            (p[axis] as number) * CENTER_PULL;
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const p = pos[i] as Vec3;
      const f = force[i] as Vec3;
      const size = Math.hypot(f[0], f[1], f[2]);
      if (size === 0) continue;
      const move = Math.min(size, step) / size;
      p[0] += f[0] * move;
      p[1] += f[1] * move;
      p[2] += f[2] * move;
    }
  }

  // Centre the cloud and scale it so the farthest node sits on the unit sphere.
  const centre: Vec3 = [0, 0, 0];
  for (const p of pos) {
    centre[0] += p[0] / count;
    centre[1] += p[1] / count;
    centre[2] += p[2] / count;
  }
  let radius = 0;
  for (const p of pos) {
    p[0] -= centre[0];
    p[1] -= centre[1];
    p[2] -= centre[2];
    radius = Math.max(radius, Math.hypot(p[0], p[1], p[2]));
  }
  const scale = radius === 0 ? 1 : 1 / radius;
  return pos.map((p) => [
    Math.round(p[0] * scale * 1000) / 1000,
    Math.round(p[1] * scale * 1000) / 1000,
    Math.round(p[2] * scale * 1000) / 1000,
  ]);
}
