// The scene library. A scene is configuration: a sky, and which animated layers sit in it.
// The <Scene> component reads this and draws it; templates just pick a scene by key.
export type SceneKey = "none" | "moonlight" | "sunrise-journey" | "golden-hour" | "garden-day" | "ocean-dusk";

export type SceneDef = {
  label: string;
  blurb: string;
  sky: string; // CSS gradient
  skyEnd?: string; // a second sky the page fades into as you scroll (the "journey")
  cloud: string; // cloud colour
  petal: string[]; // petal colours
  effects: {
    stars?: boolean;
    moon?: boolean;
    sun?: boolean;
    clouds?: number;
    petals?: boolean;
    birds?: boolean;
    waves?: boolean;
  };
};

export const SCENES: Record<Exclude<SceneKey, "none">, SceneDef> = {
  moonlight: {
    label: "Moonlight",
    blurb: "A deep blue night. Stars twinkle, the moon rises, clouds drift.",
    sky: "linear-gradient(180deg, #040820 0%, #0c1a4a 52%, #22357a 100%)",
    cloud: "rgba(150, 172, 232, 0.16)",
    petal: ["#f4d99a", "#e7b8c8"],
    effects: { stars: true, moon: true, clouds: 4 },
  },
  "sunrise-journey": {
    label: "Night to sunrise",
    blurb: "Opens under stars and a moon. As you scroll, the moon sets and the sun rises.",
    sky: "linear-gradient(180deg, #040820 0%, #0c1a4a 52%, #22357a 100%)",
    skyEnd: "linear-gradient(180deg, #33245c 0%, #93476c 46%, #ef955c 100%)",
    cloud: "rgba(255, 224, 200, 0.22)",
    petal: ["#ffd9a8", "#f5b7b1"],
    effects: { stars: true, moon: true, sun: true, clouds: 5, birds: true },
  },
  "golden-hour": {
    label: "Golden hour",
    blurb: "A warm amber sky, a low sun, drifting clouds, petals and birds.",
    sky: "linear-gradient(180deg, #ffeec4 0%, #ffd58f 46%, #f5a56a 100%)",
    cloud: "rgba(255, 255, 255, 0.55)",
    petal: ["#e8788a", "#f7b6a0", "#ffffff"],
    effects: { sun: true, clouds: 4, petals: true, birds: true },
  },
  "garden-day": {
    label: "Garden morning",
    blurb: "A pale morning sky with clouds, falling petals and birds.",
    sky: "linear-gradient(180deg, #bde3f6 0%, #e4f2ea 56%, #f9f2dc 100%)",
    cloud: "rgba(255, 255, 255, 0.75)",
    petal: ["#f1a0b4", "#ffffff", "#f7cf7a"],
    effects: { clouds: 4, petals: true, birds: true },
  },
  "ocean-dusk": {
    label: "Ocean dusk",
    blurb: "A sunset over the sea, with rolling waves and birds.",
    sky: "linear-gradient(180deg, #1c2858 0%, #86406b 44%, #ee8e68 76%, #f8c98c 100%)",
    cloud: "rgba(255, 210, 190, 0.28)",
    petal: ["#ffd8a8"],
    effects: { sun: true, clouds: 3, birds: true, waves: true },
  },
};

export const SCENE_LIST = (Object.keys(SCENES) as Exclude<SceneKey, "none">[]).map((k) => ({ key: k, ...SCENES[k] }));
