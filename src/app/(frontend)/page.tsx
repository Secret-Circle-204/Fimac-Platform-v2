import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import Hero from '@/components/home/hero'

// import { Input } from "@/components/ui/input"
import { FeaturedProperties } from '@/featured-properties'
import { FounderMessage } from '@/components/home/founder-message'
// import { StoryPhilosophy } from "@/components/home/story-philosophy"
import { FadeIn } from '@/components/animations/fade-in'
// import { SearchFilters } from "@/components/home/search-filters"
import Link from 'next/link'
import { getCachedLatestBlogPosts } from '@/lib/cache/blog-posts'


const propertyTypes = [
  {
    title: 'HOTELS',
    href: '/search?category=hospitality',
    count: 'Premium Hotels',
    image: '/propertyTypes/HOTELS-1.jpg',
  },
  {
    title: 'MOTELS',
    href: '/search?category=hospitality&type=motel',
    count: 'Budget-Friendly Investments',
    image: '/propertyTypes/MOTELS-1.jpg',
  },
  {
    title: 'RESORTS',
    href: '/search?category=hospitality&type=resort',
    count: 'Luxury Resorts',
    image: '/propertyTypes/RESORTS-1.jpg',
  },
  {
    title: 'LANDS',
    href: '/search?category=land',
    count: 'Development Opportunities',
    image: '/propertyTypes/LANDS-1.jpg',
  },
  {
    title: 'ELITE REAL ESTATE',
    href: '/search?category=residential',
    count: 'Luxury Properties',
    image: '/propertyTypes/ELITE-REAL-ESTATE.jpg',
  },
  {
    title: 'COMMERCIAL',
    href: '/search?category=commercial',
    count: 'Business & Office Spaces',
    image: '/propertyTypes/commercial.png',
  },
]

export default async function HomePage() {
  const latestPosts = await getCachedLatestBlogPosts(4)
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />

        {/* About Section */}
        <section className="py-16 bg-background text-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Your Partner in Real Estate Investment</h2>
              <p className="text-muted-foreground mb-6">
                FIMAC (Financial Investment Management Advice Consultants) is a premier global
                consultancy specializing in the sale and acquisition of hospitality properties.
                Our exclusive platform and services are tailored for business owners, buyers, and
                brokers in the hotel, motel, resort, and boutique hotel sectors. We provide a
                sophisticated marketplace combined with expert advisory services, including
                valuation, marketing, and negotiation. Our expertise ensures that every client
                receives personalized attention and a strategic approach designed to maximize
                value.
              </p>
              <Button
                className="bg-blue-brand-light text-white shadow-xs hover:bg-blue-brand-light/90 rounded-md px-6 py-2.5"
                asChild
              >
                <Link href="/about">SHOW MORE</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* <SearchFilters /> */}
        <FeaturedProperties />
        {/* Property Types */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-8">
                Explore the world &apos;s Diverse Property Types
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
              {propertyTypes.map((type, index) => (
                <FadeIn key={type.title} delay={index * 80}>
                  <Link href={type.href}>
                    <div className="group relative overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-shadow duration-500 hover:shadow-xl">
                      <Image
                        src={type.image}
                        alt={type.title}
                        width={500}
                        height={300}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover h-64 w-full"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                        <h3 className="text-xl font-bold text-white mb-1">{type.title}</h3>
                        <p className="text-white/80 text-sm">{type.count}</p>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
        <FounderMessage />
        {/* <StoryPhilosophy /> */}

        {/* CTA Section */}
        <section className="relative overflow-hidden py-16 bg-accent text-accent-foreground">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-[-5%] top-1/4 h-72 w-72 rounded-full bg-blue-500 blur-2xl" />
            <div className="absolute right-[-5%] bottom-0 h-72 w-72 rounded-full bg-amber-400 blur-xl" />
          </div>
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col tablet:flex-row bg-background/90 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <FadeIn className="tablet:w-1/2 p-12 flex flex-col justify-center space-y-6">
                <h2 className="text-3xl font-bold">
                  Ready to Find Your the world Dream Propertie?
                </h2>
                <p className="text-muted-foreground">
                  Contact us now for a free consultation with one of our expert property
                  specialists. We&apos;ll help you find the perfect property that meets all your
                  requirements, whether you&apos;re looking for a mountain retreat or a downtown
                  condo.
                </p>
                <Button className="bg-blue-900 text-primary-foreground shadow-lg hover:bg-blue-900/90 rounded-md w-fit">
                  CONTACT US
                </Button>
              </FadeIn>
              <FadeIn className="tablet:w-1/2 relative min-h-[320px]" delay={150}>
                <div className="absolute inset-0">
                  <Image
                    src="/advisor_consultation.png"
                    alt="Professional real estate advisor in modern office"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 to-transparent" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>


        {/* Blog Section */}
        {latestPosts.length > 0 && (
          <section className="py-16 bg-accent text-accent-foreground">
            <div className="container mx-auto px-4">
              <FadeIn>
                <h2 className="text-3xl font-bold mb-12">
                  the world Real Estate Tips, Trends, And Updates
                </h2>
              </FadeIn>

              <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
                {latestPosts.map((post, index) => {
                  const postImageUrl =
                    post.featuredImage && typeof post.featuredImage === 'object' && 'url' in post.featuredImage && post.featuredImage.url
                      ? post.featuredImage.url
                      : '/scene-with-business-.jpg'

                  const postDate = post.publishedDate
                    ? new Date(post.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently'

                  return (
                    <FadeIn key={post.title} delay={index * 80}>
                      <Card className="overflow-hidden border border-white/20 bg-background/90 shadow-md hover:shadow-2xl transition-shadow h-full flex flex-col justify-between">
                        <div>
                          <div className="relative">
                            {postImageUrl && (
                              <Image
                                src={postImageUrl}
                                alt={post.title}
                                width={500}
                                height={300}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                loading="lazy"
                                className="object-cover h-56 w-full"
                              />
                            )}
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-lg">{post.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-3">
                              {post.excerpt}
                            </p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>{postDate}</span>
                              <Button asChild variant="link" className="text-primary p-0 h-auto font-medium">
                                <Link href={`/blog/${post.slug}`}>
                                  Continue Reading
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </FadeIn>
                  )
                })}
              </div>

              <div className="mt-12 flex justify-center">
                <Button asChild className="bg-blue-900 hover:bg-blue-800 text-white rounded-md px-8 py-3">
                  <Link href="/blog">
                    View All Posts
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}


      </main>
    </div>
  )
}
