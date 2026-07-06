import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Cloudflare Workers' nodejs_compat fs polyfill doesn't implement readdirSync,
// so posts can't be listed from disk at request time. Instead, bundle all post
// frontmatter into a JSON module at build time that gets statically imported —
// no runtime fs access needed. Runs automatically via the dev/build npm scripts.
// Post bodies are rendered separately via a dynamic `import()` of the .mdx file
// itself (compiled to plain JS by @next/mdx at build time — see
// src/app/blog/[slug]/page.tsx), so only frontmatter needs to travel through here.

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUTPUT_FILE = path.join(process.cwd(), "src", "generated", "posts.json");

const filenames = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

const posts = filenames.map((filename) => {
	const slug = filename.replace(/\.mdx$/, "");
	const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
	const { data } = matter(raw);
	return { slug, frontmatter: data };
});

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2) + "\n");
console.log(`Wrote ${OUTPUT_FILE} (${posts.length} post(s)).`);
