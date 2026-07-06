import type { MDXComponents } from "mdx/types";
import Image from "next/image";

/**
 * `alt` has no default — every photo in a post must describe the action and the
 * part, never the person, per this repo's "Famous Hands" voice rules.
 */
function Figure({
	src,
	alt,
	caption,
	width = 1080,
	height = 720,
}: {
	src: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
}) {
	return (
		<figure className="my-8">
			<Image src={src} alt={alt} width={width} height={height} className="h-auto w-full rounded" />
			{caption ? <figcaption className="mt-2 text-sm text-foreground/70">{caption}</figcaption> : null}
		</figure>
	);
}

const components: MDXComponents = {
	Figure,
	table: (props) => (
		<div className="overflow-x-auto">
			<table {...props} />
		</div>
	),
};

export function useMDXComponents(): MDXComponents {
	return components;
}
