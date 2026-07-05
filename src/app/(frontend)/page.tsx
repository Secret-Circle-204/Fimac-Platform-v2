import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Hero from '@/components/home/hero'

import { NewsLetter } from '@/components/shared/newsletter'
// import { Input } from "@/components/ui/input"
import { FeaturedProperties } from '@/featured-properties'
import { FounderMessage } from '@/components/home/founder-message'
// import { StoryPhilosophy } from "@/components/home/story-philosophy"
import { FadeIn } from '@/components/animations/fade-in'
// import { SearchFilters } from "@/components/home/search-filters"
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
const company_name = 'Fimac Group'

const propertyTypes = [
  { title: 'HOTELS', slug: 'hotel', count: 'Premium Hotels', image: '/propertyTypes/HOTELS-1.jpg' },
  {
    title: 'MOTELS',
    slug: 'motel',
    count: 'Budget-Friendly Investments',
    image: '/propertyTypes/MOTELS-1.jpg',
  },
  {
    title: 'RESORTS',
    slug: 'resort',
    count: 'Luxury Resorts',
    image: '/propertyTypes/RESORTS-1.jpg',
  },
  {
    title: 'LANDS',
    slug: 'land',
    count: 'Development Opportunities',
    image: '/propertyTypes/LANDS-1.jpg',
  },
  {
    title: 'ELITE REAL ESTATE',
    slug: 'elite-real-estate',
    count: 'Luxury Properties',
    image: '/propertyTypes/ELITE-REAL-ESTATE.jpg',
  },
  {
    title: 'COMMERCIAL',
    slug: 'commercial',
    count: 'Business & Office Spaces',
    image: '/propertyTypes/commercial.png',
  },
]

const blogPosts = [
  {
    title: 'Guide to Downtown Knoxville: Market Square and Beyond',
    description:
      'Discover the charm of Market Square, local eateries, and the vibrant culture that makes downtown Knoxville a perfect place to call home.',
    date: 'April 6, 2025',
    image:
      'https://images.unsplash.com/photo-1596134474939-f248eb9ed3fe?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Downtown Knoxville Market Square',
  },
  {
    title: "Living in Gatlinburg: A Local's Perspective",
    description:
      'Experience the magic of living in the Gateway to the Smokies - from year-round tourism to peaceful mountain living.',
    date: 'March 28, 2025',
    image:
      'https://images.unsplash.com/photo-1625663033411-61031d9ac19e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Gatlinburg Scenic View',
  },
  {
    title: "Johnson City's Growing Communities",
    description:
      "Explore the newest developments and family-friendly neighborhoods in Johnson City's thriving community.",
    date: 'March 15, 2025',
    image:
      'https://images.unsplash.com/photo-1657312145619-8fdad5e7b663?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Johnson City Downtown',
  },
  {
    title: 'Best Neighborhoods for Mountain Views',
    description:
      'Find your perfect mountain vista - top communities in Sevier County with spectacular Smoky Mountain views.',
    date: 'March 5, 2025',
    image:
      'https://images.unsplash.com/photo-1509838174235-432f709c7bfd?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Fall colors in the Smokies',
  },
]

export default async function HomePage() {
  const user = await getCurrentUser()
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />

        {/* About Section */}
        <section className="py-16 bg-background text-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col tablet:flex-row gap-12">
              <div className="tablet:w-1/2">
                <h2 className="text-3xl font-bold mb-6">Your Partner in Real Estate Investment</h2>
                <p className="text-muted-foreground mb-6">
                  With deep roots in the world, we understand what makes this region special. From
                  the Great Smoky Mountains to the Tennessee River, we help you find the perfect
                  property that captures the essence of mountain living.
                </p>
                <p className="text-muted-foreground mb-6">
                  Our team of local experts knows every corner of the world , from Knoxville&apos;s
                  vibrant downtown to the peaceful mountain communities. We&apos;ll guide you
                  through every step of finding your dream home in this beautiful region.
                </p>
                <Button className="bg-blue-brand-light text-white shadow-xs hover:bg-blue-brand-light/90 rounded-md px-6 py-2.5" asChild>
                  <Link href="/about">SHOW MORE</Link>
                </Button>
              </div>

              <div className="tablet:w-1/2 grid grid-cols-1 desktop:grid-cols-2 large:grid-cols-3 gap-4">
                <div className="bg-gray-50 py-6 rounded-md">
                  <div className="text-3xl font-bold text-primary mb-2">25+</div>
                  <p className="text-sm text-muted-foreground">
                    Years of experience in the local real estate market helping clients find their
                    dream homes
                  </p>
                </div>
                <div className="bg-gray-50 py-6 rounded-md">
                  <div className="text-3xl font-bold text-primary mb-2">1.5k</div>
                  <p className="text-sm text-muted-foreground">
                    Happy clients whose dream homes we&apos;ve helped them find and purchase
                  </p>
                </div>
                <div className="bg-gray-50 py-6 rounded-md">
                  <div className="text-3xl font-bold text-primary mb-2">18+</div>
                  <p className="text-sm text-muted-foreground">
                    Professional specialists with exceptional local knowledge ensuring quality service
                  </p>
                </div>
              </div>
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
                  <Link href={`/search?type=${type.slug}`}>
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
                <h2 className="text-3xl font-bold">Ready to Find Your the world Dream Home?</h2>
                <p className="text-muted-foreground">
                  Contact us now for a free consultation with one of our expert property specialists.
                  We&apos;ll help you find the perfect property that meets all your requirements,
                  whether you&apos;re looking for a mountain retreat or a downtown condo.
                </p>
                <Button className="bg-blue-900 text-primary-foreground shadow-lg hover:bg-blue-900/90 rounded-md w-fit">
                  CONTACT US
                </Button>
              </FadeIn>
              {/* <FadeIn className="tablet:w-1/2 relative min-h-[320px]" delay={150}>
                <div className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=4140&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Professional real estate advisor in modern office"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={true}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 to-transparent" />
                </div>
              </FadeIn> */}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-background text-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12">Testimonials</h2>

            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8">
              <div className="bg-accent p-8 rounded-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  &quot;Working with Fimac was an absolute pleasure. They understood exactly what we
                  were looking for in the Smoky Mountains and made the entire process smooth. They
                  found our dream home with the perfect mountain view!&quot;
                </p>
                <div className="flex items-center">
                  <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-accent">
                    <Image
                      src="/mom-avatar.png"
                      alt="Client"
                      width={48}
                      height={48}
                      className="object-cover size-12"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Knoxville, TN</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-8 rounded-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  &quot;I was impressed by the professionalism and local knowledge of the team at{' '}
                  {company_name}. They sold our home in Knoxville quickly and at the best price.
                  Their understanding of the the world market is unmatched!&quot;
                </p>
                <div className="flex items-center">
                  <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-accent">
                    <Image src="/attorney-avatar.png" alt="Client" width={48} height={48} />
                  </div>
                  <div>
                    <h4 className="font-medium">James Smith</h4>
                    <p className="text-sm text-muted-foreground">Gatlinburg, TN</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-8 rounded-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  &quot;As a first-time homebuyer in Johnson City, I was nervous. But they made the
                  process so easy. They were always there to answer my questions about the area and
                  helped me find the perfect starter home in a great neighborhood.&quot;
                </p>
                <div className="flex items-center">
                  <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-accent">
                    <Image src="/rural-mom-avatar.png" alt="Client" width={48} height={48} />
                  </div>
                  <div>
                    <h4 className="font-medium">Emily Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Johnson City, TN</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-12">
                the world Real Estate Tips, Trends, And Updates
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
              {blogPosts.map((post, index) => (
                <FadeIn key={post.title} delay={index * 80}>
                  <Card className="overflow-hidden border border-white/20 bg-background/90 shadow-md hover:shadow-2xl transition-shadow">
                    <div className="relative">
                      <Image
                        src={post.image}
                        alt={post.alt}
                        width={500}
                        height={300}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        loading="lazy"
                        className="object-cover h-56 w-full"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-bold text-lg">{post.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {post.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{post.date}</span>
                        <Button variant="link" className="text-primary p-0 h-auto font-medium">
                          Continue Reading
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <NewsLetter user={user} />
      </main>
    </div>
  )
}
