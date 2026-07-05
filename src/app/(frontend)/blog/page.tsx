import { getPayloadClient } from "@/db/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export const metadata = {
  title: "Blog | Fimac Group",
  description:
    "Stay updated with the latest hospitality investment trends, market analysis, and expert advice",
}

import { unstable_cache } from "next/cache"

const getCachedBlogData = unstable_cache(
  async () => {
    const payload = await getPayloadClient()

    // Fetch published blog posts and categories in parallel
    const [postsRes, categoriesRes] = await Promise.all([
      payload.find({
        collection: "blog-posts",
        where: {
          status: {
            equals: "published",
          },
        },
        sort: "-publishedDate",
        limit: 50,
        depth: 1, // Need featuredImage and category populated
        select: {
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          publishedDate: true,
          readTime: true,
          author: true,
          featured: true,
        },
      }),
      payload.find({
        collection: "blog-categories",
        limit: 20,
        depth: 0,
        select: {
          name: true,
        },
      }),
    ])

    return {
      posts: postsRes.docs,
      categories: categoriesRes.docs,
    }
  },
  ["blog-page-data"],
  {
    revalidate: 300, // 5 minutes cache
    tags: ["blog-posts", "blog-categories"],
  }
)

export default async function BlogPage() {
  const { posts, categories } = await getCachedBlogData()

  // Get featured post
  const featuredPost =
    posts.find((post: { featured?: boolean | null }) => post.featured) || posts[0]

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
                            ? formatDistanceToNow(new Date(featuredPost.publishedDate), {
                                addSuffix: true,
                              })
                            : "Recently"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime || 5} min read</span>
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
                <Button variant="outline" size="sm">
                  All Posts
                </Button>
                {categories.map((category) => (
                  <Button key={category.id} variant="outline" size="sm">
                    {category.name}
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

            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-2">No Posts Yet</h3>
                <p className="text-gray-600">Check back soon for new content</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts
                  .filter((post: { id?: string | number | null }) => post.id !== featuredPost?.id)
                  .map((post) => (
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
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
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
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime || 5} min</span>
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
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="max-w-2xl mx-auto mb-8 text-blue-100">
              Get the latest articles and market insights delivered directly to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              />
              <Button variant="secondary" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
