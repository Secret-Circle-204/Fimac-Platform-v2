import { getPayloadClient } from "@/db/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { RichText } from '@/components/shared/rich-text'
import { ShareButton } from '@/components/shared/share-button'
import { SERVER_URL } from "@/env"

import { unstable_cache } from "next/cache"
import { cache } from "react"

// Deduplicated and cached single post lookup (Server Caching Layer)
const getPost = cache(async (slug: string) => {
  return await unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const posts = await payload.find({
        collection: "blog-posts",
        where: {
          slug: { equals: slug },
          status: { equals: "published" },
        },
        limit: 1,
        depth: 1, // For populating related entities (featuredImage, categories, etc.)
      })
      return posts.docs[0] || null
    },
    [`blog-post-${slug}`],
    {
      revalidate: 300, // 5 Minutes stale duration
      tags: [`blog-post:${slug}`],
    }
  )()
})

// Deduplicated and cached related posts lookup
const getRelatedPosts = cache(async (postId: string | number, categoryId: string | number) => {
  return await unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const relatedPosts = await payload.find({
        collection: "blog-posts",
        where: {
          and: [
            { status: { equals: "published" } },
            { id: { not_equals: postId } },
            { category: { equals: categoryId } },
          ],
        },
        limit: 3,
        depth: 1,
      })
      return relatedPosts.docs
    },
    [`blog-related-${postId}`],
    {
      revalidate: 300,
      tags: [`blog-post-related:${postId}`],
    }
  )()
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const title = post.seo?.metaTitle || `${post.title} | Fimac Group Blog`
  const description = post.seo?.metaDescription || post.excerpt
  const postImageUrl = post.featuredImage && typeof post.featuredImage === "object" && post.featuredImage.url
    ? post.featuredImage.url
    : "/scene-with-business-.jpg"

  const absoluteImageUrl = postImageUrl.startsWith('http') ? postImageUrl : `${SERVER_URL}${postImageUrl}`

  return {
    title,
    description,
    keywords: post.seo?.metaKeywords || post.tags?.map((t: { tag?: string | null }) => t.tag).filter(Boolean) || [],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      images: [
        {
          url: absoluteImageUrl,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Fetch the post using cached single source of truth
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  // Resolve related category ID safely
  const categoryId = typeof post.category === "object" && post.category ? post.category.id : post.category
  
  // Run related posts fetch separately but utilizing high performance cache layer
  const relatedPosts = categoryId 
    ? await getRelatedPosts(post.id, categoryId) 
    : []

  const postImageUrl = post.featuredImage && typeof post.featuredImage === "object" && post.featuredImage.url
    ? post.featuredImage.url
    : "/scene-with-business-.jpg"
  const absoluteImageUrl = postImageUrl.startsWith('http') ? postImageUrl : `${SERVER_URL}${postImageUrl}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [absoluteImageUrl],
    datePublished: post.publishedDate || post.createdAt,
    dateModified: post.updatedAt,
    author: [
      {
        '@type': 'Person',
        name: post.author || 'Fimac Group Team',
        url: `${SERVER_URL}/about`,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'FIMAC Group',
      logo: {
        '@type': 'ImageObject',
        url: `${SERVER_URL}/advisor_consultation.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SERVER_URL}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
        {/* Back Button */}
        <section className="bg-gray-50 py-4 border-b">
          <div className="container mx-auto px-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </section>

        {/* Hero Section with Featured Image */}
        <section className="relative h-[400px] md:h-[500px] bg-gray-900">
          {post.featuredImage && typeof post.featuredImage === "object" ? (
            <Image
              src={post.featuredImage.url || ""}
              alt={post.title}
              fill
              className="object-cover opacity-80"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
              <span className="text-9xl opacity-30">📰</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              {post.category && typeof post.category === "object" && (
                <Badge className="mb-4 bg-blue-600">{post.category.name}</Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {post.publishedDate
                      ? new Date(post.publishedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-blue-900 pl-6 italic">
                {post.excerpt}
              </p>

              {/* Share Buttons */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                <span className="text-sm font-medium text-gray-600">Share:</span>
                <ShareButton title={post.title} excerpt={post.excerpt} />
              </div>

              {/* Main Content */}
              <div className="prose prose-lg max-w-none">
                <RichText content={post.content} />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600 mr-2">Tags:</span>
                    {post.tags.map((tagItem: { tag?: string | null }, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tagItem.tag || ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <div className="relative h-48 bg-gray-200">
                        {relatedPost.featuredImage &&
                        typeof relatedPost.featuredImage === "object" ? (
                          <Image
                            src={relatedPost.featuredImage.url || ""}
                            alt={relatedPost.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-4xl">📄</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-blue-900 transition-colors">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <Button asChild variant="link" className="p-0 h-auto text-blue-900">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          Read More
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}


      </main>
    </div>
    </>
  )
}
