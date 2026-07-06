import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export function generateStaticParams() {
	return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) return {};
	return {
		title: `${post.frontmatter.title} — Two Lost Tourists`,
		description: post.frontmatter.excerpt,
	};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) notFound();

	const { default: Content } = await import(`@content/posts/${slug}.mdx`);

	return (
		<article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-12">
			<h1>{post.frontmatter.title}</h1>
			<p>{post.frontmatter.date}</p>
			<Content />
		</article>
	);
}
