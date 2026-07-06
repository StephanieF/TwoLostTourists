import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
	title: "Blog — Two Lost Tourists",
	description: "Restoration logs and road trip notes for a 1999 Country Coach diesel pusher.",
};

export default function BlogIndexPage() {
	const posts = getAllPosts();

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-semibold">Blog</h1>
			<p className="mt-2 text-foreground/70">
				Restoration logs and road trip notes for a 1999 Country Coach diesel pusher.
			</p>

			<nav className="mt-6 flex gap-4 text-sm">
				<Link href="/blog/tag/restoration" className="hover:underline">
					Restoration
				</Link>
				<Link href="/blog/tag/road-trip" className="hover:underline">
					Road Trips
				</Link>
				<Link href="/blog/search" className="hover:underline">
					Search
				</Link>
			</nav>

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

			{posts.length === 0 && <p className="mt-8 text-foreground/60">No posts yet.</p>}
		</div>
	);
}
