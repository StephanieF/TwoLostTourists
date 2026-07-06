import Link from "next/link";
import type { Metadata } from "next";
import { getAllTags, getPostsByTag } from "@/lib/posts";

export function generateStaticParams() {
	return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ tag: string }>;
}): Promise<Metadata> {
	const { tag } = await params;
	return { title: `#${tag} — Two Lost Tourists` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
	const { tag } = await params;
	const posts = getPostsByTag(tag);

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-semibold">#{tag}</h1>

			<ul className="mt-8 space-y-8">
				{posts.map((post) => (
					<li key={post.slug}>
						<Link href={`/blog/${post.slug}`} className="text-xl font-medium hover:underline">
							{post.frontmatter.title}
						</Link>
						<p className="text-sm text-foreground/60">{post.frontmatter.date}</p>
						<p className="mt-1 text-foreground/80">{post.frontmatter.excerpt}</p>
					</li>
				))}
			</ul>

			{posts.length === 0 && (
				<p className="mt-8 text-foreground/60">No posts tagged &ldquo;{tag}&rdquo; yet.</p>
			)}
		</div>
	);
}
