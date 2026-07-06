import Link from "next/link";
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const metadata: Metadata = { title: "Search — Two Lost Tourists" };

interface PostRow {
	slug: string;
	title: string;
	excerpt: string;
	published_at: string;
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q } = await searchParams;
	const query = q?.trim() ?? "";

	let results: PostRow[] = [];
	if (query) {
		const { env } = await getCloudflareContext({ async: true });
		const like = `%${query}%`;
		const { results: rows } = await env.DB.prepare(
			`SELECT slug, title, excerpt, published_at FROM posts
			 WHERE draft = 0 AND (title LIKE ? OR excerpt LIKE ? OR tags_flat LIKE ?)
			 ORDER BY published_at DESC`,
		)
			.bind(like, like, like)
			.all<PostRow>();
		results = rows;
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-semibold">Search</h1>
			<form method="get" className="mt-6 flex gap-2">
				<input
					type="text"
					name="q"
					defaultValue={query}
					placeholder="engine, batteries, generator..."
					className="flex-1 rounded border border-foreground/20 bg-transparent px-3 py-2"
				/>
				<button type="submit" className="rounded border border-foreground/20 px-4 py-2">
					Search
				</button>
			</form>

			{query && results.length === 0 && (
				<p className="mt-8 text-foreground/60">No posts match &ldquo;{query}&rdquo;.</p>
			)}

			<ul className="mt-8 space-y-8">
				{results.map((post) => (
					<li key={post.slug}>
						<Link href={`/blog/${post.slug}`} className="text-xl font-medium hover:underline">
							{post.title}
						</Link>
						<p className="text-sm text-foreground/60">{post.published_at}</p>
						<p className="mt-1 text-foreground/80">{post.excerpt}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
