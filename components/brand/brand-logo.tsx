import Image from "next/image";

const SIZE = {
  bar: { width: 112, height: 43 },
  menu: { width: 200, height: 77 },
  login: { width: 260, height: 100 },
} as const;

export function BrandLogo({ place }: { place: keyof typeof SIZE }) {
  const size = SIZE[place];
  return (
    <Image
      src="/edubite-logo.png"
      alt="eduBite"
      width={size.width}
      height={size.height}
      priority={place !== "menu"}
      className="object-contain"
      style={{ width: size.width, height: size.height }}
    />
  );
}
