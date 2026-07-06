import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
	images: {
		loader: "custom",
		loaderFile: "./src/lib/cloudflare-image-loader.ts",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "imagedelivery.net",
			},
		],
	},
};

const withMDX = createMDX({
	options: {
		// String plugin names (not imported functions) are required for Turbopack —
		// see https://nextjs.org/docs/app/guides/mdx#using-plugins-with-turbopack.
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
