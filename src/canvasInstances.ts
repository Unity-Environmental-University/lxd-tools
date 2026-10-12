export interface CanvasInstance {
  name: string;
  origin: string;
  accounts: {
    name: string;
    id: number;
  }[];
}

const DEFAULT_INSTANCES: Record<string, CanvasInstance> = {
  unity: {
    name: "Unity",
    origin: "https://unity.instructure.com",
    accounts: [
      { name: "Distance Education", id: 169877 },
      { name: "Distance Education Development", id: 170329 },
      { name: "Unity College", id: 98244 },
    ],
  },
  careeredge: {
    name: "Career Edge",
    origin: "https://careeredge.instructure.com",
    accounts: [
      { name: "Root", id: 1 },
      { name: "Career Edge", id: 136 },
    ],
  },
};

const STORAGE_KEY = "CANVAS_INSTANCES";

export async function getInstances(): Promise<Record<string, CanvasInstance>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to load Canvas instances from storage:", e);
  }
  return DEFAULT_INSTANCES;
}

export async function saveInstances(instances: Record<string, CanvasInstance>): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
}

export function getInstanceFromOrigin(origin: string, instances: Record<string, CanvasInstance>): CanvasInstance | null {
  for (const instance of Object.values(instances)) {
    if (instance.origin === origin) {
      return instance;
    }
  }
  return null;
}

export function getInstanceFromUrl(url: string, instances: Record<string, CanvasInstance>): CanvasInstance | null {
  try {
    const urlObj = new URL(url);
    return getInstanceFromOrigin(urlObj.origin, instances);
  } catch {
    return null;
  }
}
