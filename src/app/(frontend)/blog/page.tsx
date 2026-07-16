import { getPayloadClient } from "@/db/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import type { Where } from "payload"

export const metadata = {
  title: "Blog | Fimac Group",
  description: "Stay updated with the latest hospitality investment trends, market analysis, and expert real estate advice.",
  keywords: ["real estate blog", "hospitality blog", "hotel investment trends", "FIMAC updates"],
  alternates: {
    canonical: '/blog',
  },
}

const getCachedBlogData = async (page: number, categoryId: string) => {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient()

      const limit = 9
      const where: Where = {
        status: {
          equals: "published",
        },
      }

      if (categoryId && categoryId !== "all") {
        where.category = {
          equals: categoryId,
        }
      }

      // Fetch published blog posts and categories in parallel
      const [postsRes, categoriesRes] = await Promise.all([
        payload.find({
          collection: "blog-posts",
          where,
          sort: "-publishedDate",
          limit,
          page,
          depth: 1, // Need featuredImage and category populated
          select: {
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            category: true,
            publishedDate: true,
            author: true,
            featured: true,
          },
        }),
        payload.find({
          collection: "blog-categories",
          limit: 50,
          depth: 0,
          select: {
            name: true,
          },
        }),
      ])

      return {
        posts: postsRes.docs,
        categories: categoriesRes.docs,
        totalPages: postsRes.totalPages || 1,
        currentPage: postsRes.page || 1,
      }
    },
    [`blog-page-data-${page}-${categoryId}`],
    {
      revalidate: 300, // 5 minutes cache
      tags: ["blog-posts", "blog-categories"],
    }
  )()
}

export default async function BlogPage(props: {
  searchParams?: Promise<{ page?: string; category?: string }>
}) {
  const resolvedParams = (await props.searchParams) || {}
  const page = Math.max(1, parseInt(resolvedParams.page || "1") || 1)
  const categoryId = resolvedParams.category || "all"

  const { posts, categories, totalPages, currentPage } = await getCachedBlogData(page, categoryId)

  // Get featured post (only on the first page when showing all posts)
  const featuredPost =
    page === 1 && categoryId === "all"
      ? posts.find((post: { featured?: boolean | null }) => post.featured) || posts[0]
      : null

  // Filter out featured post from grid listings if visible
  const displayPosts = featuredPost
    ? posts.filter((post: { id?: string | number | null }) => post.id !== featuredPost.id)
    : posts

  return (
    <div className="flex min-h-screen flex-col pt-24">
      <main className="flex-1 ">
        {/* Hero Section */}
        <section className="bg-blue-fimac bg-gradient-to-r from-blue-900 to-blue-700 text-white py-32">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Fimac Group Blog</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Expert insights, market trends, and investment tips for hospitality real estate
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12 bg-gray-50 border-b">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <div className="relative h-64 md:h-full bg-gray-200">
                      {featuredPost.featuredImage &&
                      typeof featuredPost.featuredImage === "object" ? (
                        <Image
                          src={featuredPost.featuredImage.url || ""}
                          alt={featuredPost.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                          <span className="text-6xl">📰</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">Featured</Badge>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <h3 className="text-3xl font-bold mb-4 hover:text-blue-900 transition-colors">
                        {featuredPost.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {featuredPost.publishedDate
                            ? new Date(featuredPost.publishedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recently"}
                        </span>
                      </div>
                    </div>

                    <Button asChild className="w-fit bg-blue-900 hover:bg-blue-800">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Categories Filter */}
        {categories.length > 0 && (
          <section className="py-8 bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild variant={categoryId === "all" ? "default" : "outline"} size="sm">
                  <Link href="/blog">All Posts</Link>
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    asChild
                    variant={String(categoryId) === String(category.id) ? "default" : "outline"}
                    size="sm"
                  >
                    <Link href={`/blog?category=${category.id}`}>{category.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>

            {displayPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-2">No Posts Yet</h3>
                <p className="text-gray-600">Check back soon for new content</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <Link href={`/blog/${post.slug}`}>
                        <div className="relative h-48 bg-gray-200">
                          {post.featuredImage && typeof post.featuredImage === "object" ? (
                            <Image
                              src={post.featuredImage.url || ""}
                              alt={post.title}
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

                      <CardContent className="p-6">
                        {/* Category Badge */}
                        {post.category && typeof post.category === "object" && (
                          <Badge variant="outline" className="mb-3">
                            {post.category.name}
                          </Badge>
                        )}

                        {/* Title */}
                        <Link href={`/blog/${post.slug}`}>
                          <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-blue-900 transition-colors">
                            {post.title}
                          </h3>
                        </Link>

                        {/* Excerpt */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

                        {/* Meta Info */}
                        <div className="flex items-center text-xs text-gray-500 mb-4 pb-4 border-b">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {post.publishedDate
                                ? new Date(post.publishedDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                        </div>

                        {/* Read More Button */}
                        <Button asChild variant="link" className="p-0 h-auto text-blue-900">
                          <Link href={`/blog/${post.slug}`}>
                            Read More
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    {currentPage > 1 ? (
                      <Button asChild variant="outline">
                        <Link
                          href={`/blog?page=${currentPage - 1}${categoryId !== "all" ? `&category=${categoryId}` : ""}`}
                        >
                          Previous
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Previous
                      </Button>
                    )}

                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>

                    {currentPage < totalPages ? (
                      <Button asChild variant="outline">
                        <Link
                          href={`/blog?page=${currentPage + 1}${categoryId !== "all" ? `&category=${categoryId}` : ""}`}
                        >
                          Next
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Next
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>


      </main>
    </div>
  )
}
