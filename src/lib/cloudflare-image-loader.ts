/**
 * Custom next/image loader backed by Cloudflare Images.
 *
 * Requires three named (non-flexible) Cloudflare Images variants on the account,
 * matching the widths below — CLAUDE.md prohibits exposing the "original"/flexible
 * variant publicly, so this intentionally maps to a fixed, small set of named
 * variants rather than passing an arbitrary `w=` param through.
 */
const VARIANTS = [
	{ name: "sm", width: 640 },
	{ name: "md", width: 1080 },
	{ name: "lg", width: 1920 },
] as const;

export default function cloudflareImageLoader({
	src,
	width,
}: {
	src: string;
	width: number;
	quality?: number;
}): string {
	const base = process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL;
	if (!base) {
		throw new Error(
			"NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL is not set — copy .env.example to .env.local and fill it in.",
		);
	}
	const variant = VARIANTS.find((v) => width <= v.width) ?? VARIANTS[VARIANTS.length - 1];
	return `${base.replace(/\/$/, "")}/${src}/${variant.name}`;
}
