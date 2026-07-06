import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
	const recentPosts = getAllPosts().slice(0, 5);

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-semibold">Two Lost Tourists</h1>
			<p className="mt-4 text-foreground/80">
				A 1999 Country Coach diesel pusher, kept running one repair at a time. Restoration
				logs and road trip notes, written for anyone else trying to keep an orphaned coach on
				the road.
			</p>

			<div className="mt-8">
				<Link
					href="/blog"
					className="rounded border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
				>
					Read the blog →
				</Link>
			</div>

			{recentPosts.length > 0 && (
				<section className="mt-12">
					<h2 className="text-xl font-medium">Recent posts</h2>
					<ul className="mt-4 space-y-6">
						{recentPosts.map((post) => (
							<li key={post.slug}>
								<Link href={`/blog/${post.slug}`} className="font-medium hover:underline">
									{post.frontmatter.title}
								</Link>
								<p className="text-sm text-foreground/60">{post.frontmatter.date}</p>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
