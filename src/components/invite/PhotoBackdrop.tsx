import { PHOTOS, type PhotoKey } from "@/lib/photos";

// A photograph fixed behind the whole page, with a tint over it so the text stays readable.
export function PhotoBackdrop({ photo }: { photo: Exclude<PhotoKey, "none"> }) {
  const p = PHOTOS[photo];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ backgroundImage: `linear-gradient(${p.tint}, ${p.tint}), url(${p.file})`, backgroundSize: "cover", backgroundPosition: p.position, backgroundRepeat: "no-repeat" }}
    />
  );
}
