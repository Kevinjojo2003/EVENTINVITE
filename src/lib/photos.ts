// Background photos. All are from Unsplash and used under the Unsplash License
// (https://unsplash.com/license). Credits are listed in the README as well.
export type PhotoKey = "none" | "blue-gold" | "green-leaves" | "pink-roses" | "white-paper" | "botanical-paper";

export type PhotoDef = {
  label: string;
  file: string; // served from /public/backgrounds
  tone: "dark" | "light";
  tint: string; // laid over the photo so text stays readable
  position: string;
  credit: { name: string; url: string };
};

export const PHOTOS: Record<Exclude<PhotoKey, "none">, PhotoDef> = {
  "blue-gold": {
    label: "Gold mandala on deep teal",
    file: "/backgrounds/blue-gold.jpg",
    tone: "dark",
    tint: "rgba(4, 22, 26, 0.28)",
    position: "top left",
    credit: { name: "Maksym Tymchyk", url: "https://unsplash.com/photos/DbCggUHnSXs" },
  },
  "green-leaves": {
    label: "Paper on green leaves",
    file: "/backgrounds/green-leaves.jpg",
    tone: "light",
    tint: "rgba(250, 253, 247, 0.62)",
    position: "center",
    credit: { name: "Valkyrie Pierce", url: "https://unsplash.com/photos/5H5xjUsgpLY" },
  },
  "pink-roses": {
    label: "Pink roses on marble",
    file: "/backgrounds/pink-roses.jpg",
    tone: "light",
    tint: "rgba(255, 250, 248, 0.6)",
    position: "center",
    credit: { name: "Georgia de Lotz", url: "https://unsplash.com/photos/1n_HNfGVBxE" },
  },
  "white-paper": {
    label: "Dried flowers on stone",
    file: "/backgrounds/white-paper.jpg",
    tone: "light",
    tint: "rgba(252, 250, 245, 0.66)",
    position: "center",
    credit: { name: "Annie Spratt", url: "https://unsplash.com/photos/qJQcpKHtkJI" },
  },
  "botanical-paper": {
    label: "Botanical paper",
    file: "/backgrounds/botanical-paper.jpg",
    tone: "light",
    tint: "rgba(252, 250, 245, 0.62)",
    position: "center",
    credit: { name: "Annie Spratt", url: "https://unsplash.com/photos/Yu-PUYHMVlg" },
  },
};

export const PHOTO_LIST = (Object.keys(PHOTOS) as Exclude<PhotoKey, "none">[]).map((k) => ({ key: k, ...PHOTOS[k] }));
