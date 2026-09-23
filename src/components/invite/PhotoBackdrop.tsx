// A photograph fixed behind the whole page, with a tint over it so the text stays readable.
export function PhotoBackdrop({ file, tint, position = "center" }: { file: string; tint: string; position?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ backgroundImage: `linear-gradient(${tint}, ${tint}), url(${file})`, backgroundSize: "cover", backgroundPosition: position, backgroundRepeat: "no-repeat" }}
    />
  );
}
