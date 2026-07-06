// Generated at build time by scripts/generate-content-index.mjs (via the predev/prebuild
// npm scripts) — a static JSON import, not a runtime fs read. The Cloudflare Workers
// nodejs_compat fs polyfill doesn't implement readdirSync, so content can't be listed
// from disk once this code is running in the Worker.
import postsData from "@/generated/posts.json";

export interface PostFrontmatter {
	title: string;
	date: string;
	excerpt: string;
	tags: string[];
	draft?: boolean;
	coverImageId?: string;
}

export interface Post {
	slug: string;
	frontmatter: PostFrontmatter;
}

const allPosts = postsData as Post[];

function publishedPosts(): Post[] {
	return allPosts
		.filter((post) => !post.frontmatter.draft)
		.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getAllPosts(): Post[] {
	return publishedPosts();
}

export function getPostBySlug(slug: string): Post | undefined {
	return publishedPosts().find((post) => post.slug === slug);
}

export function getAllTags(): string[] {
	const tags = new Set<string>();
	for (const post of publishedPosts()) {
		for (const tag of post.frontmatter.tags ?? []) tags.add(tag);
	}
	return Array.from(tags).sort();
}

export function getPostsByTag(tag: string): Post[] {
	return publishedPosts().filter((post) => post.frontmatter.tags?.includes(tag));
}
