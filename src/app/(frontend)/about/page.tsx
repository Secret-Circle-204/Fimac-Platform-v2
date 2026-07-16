import Image from 'next/image'
import { FadeIn } from '@/components/animations/fade-in'
import { getCachedAboutPage } from '@/lib/cache/about-page'

export const metadata = {
  title: 'About FIMAC | Hospitality Investment Advisors',
  description: "Discover FIMAC's mission, values, and strengths in global hospitality transactions.",
  keywords: ["FIMAC company", "about FIMAC", "real estate advisors", "hospitality transactions"],
  alternates: {
    canonical: '/about',
  },
}

export default async function AboutPage() {
  const aboutData = await getCachedAboutPage()

  const heroTitle = aboutData?.heroTitle || ''
  const heroDescription = aboutData?.heroDescription || ''
  const visionTitle = aboutData?.visionTitle || ''
  const visionText = aboutData?.visionText || ''
  const missionText = aboutData?.missionText || ''

  const values = aboutData?.values || []

  const strengthsTitle = aboutData?.strengthsTitle || ''
  const strengths = aboutData?.strengths && aboutData.strengths.length > 0
    ? aboutData.strengths.map(s => s.strength).filter(Boolean)
    : []

  const keysOfSuccess = aboutData?.keysOfSuccess && aboutData.keysOfSuccess.length > 0
    ? aboutData.keysOfSuccess.map(k => k.key).filter(Boolean)
    : []

  const visionImgUrl =
    aboutData?.visionImage && typeof aboutData.visionImage === 'object' && 'url' in aboutData.visionImage && aboutData.visionImage.url
      ? aboutData.visionImage.url
      : null

  const strengthsImgUrl =
    aboutData?.strengthsImage && typeof aboutData.strengthsImage === 'object' && 'url' in aboutData.strengthsImage && aboutData.strengthsImage.url
      ? aboutData.strengthsImage.url
      : null

  return (
    <div className="flex min-h-screen flex-col ">
      <main className="flex-1">
        {/* Hero Section */}
        {(heroTitle || heroDescription) && (
          <section className="relative overflow-hidden text-white pt-36 pb-20 md:pt-44 md:pb-28 lg:pt-48 lg:pb-36 flex items-center ">
            {/* Background Images and Gradients */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/bg-gold.png"
                alt="FIMAC textured gold background"
                fill
                className="object-cover  mix-blend-overlay"
                priority
                fetchPriority="high"
              />
            </div>

            {/* Floating glowing shapes for a modern design aesthetic */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-gold-royal/15 rounded-full blur-[120px] pointer-events-none z-10 animate-pulse" />
            <div className="absolute -bottom-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-10" />

            <div className="relative container mx-auto px-4 flex items-center justify-start h-full z-20">
              <FadeIn className="space-y-6 text-left w-full">
                {/* Premium Luxury Subheading Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-royal/10 border border-gold-royal/30 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    About FIMAC
                  </span>
                </div>

                {/* High-end Styled Headline */}
                {heroTitle && (
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white max-w-4xl whitespace-pre-line">
                    {heroTitle}
                  </h1>
                )}

                {/* Sleek, Readable Body Text */}
                {heroDescription && (
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl font-light">
                    {heroDescription}
                  </p>
                )}
              </FadeIn>
            </div>
          </section>
        )}

        {/* Vision & Mission Section */}
        {(visionTitle || visionText || missionText || values.length > 0 || visionImgUrl) && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <FadeIn className="space-y-8">
                <p className="text-xs tracking-[0.4em] uppercase text-blue-900">
                  Foundation & Strategic Vision
                </p>
                {visionTitle && (
                  <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                    {visionTitle}
                  </h2>
                )}
                {(visionText || missionText) && (
                  <div className="space-y-4 text-slate-600 leading-relaxed">
                    {visionText && (
                      <p>
                        <strong>Vision:</strong> {visionText}
                      </p>
                    )}
                    {missionText && (
                      <p>
                        <strong>Mission:</strong> {missionText}
                      </p>
                    )}
                  </div>
                )}
                {values.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {values.map((value) => (
                      <div
                        key={value.title}
                        className="rounded-2xl border border-slate-200 p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-semibold text-slate-900">{value.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{value.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </FadeIn>
              {visionImgUrl && (
                <FadeIn delay={80}>
                  <div className="relative overflow-hidden h-full w-full rounded-3xl shadow-2xl">
                    <Image
                      src={visionImgUrl}
                      alt="Strategic vision session"
                      className="h-full w-full object-cover"
                      width={500}
                      height={500}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </FadeIn>
              )}
            </div>
          </section>
        )}

        {/* Strengths Section */}
        {(strengthsTitle || strengths.length > 0 || keysOfSuccess.length > 0 || strengthsImgUrl) && (
          <section className="relative overflow-hidden py-20 bg-slate-950 text-white">
            <div className="absolute inset-0 opacity-40">
              <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-10 h-48 w-48 rounded-full bg-blue-500 blur-[120px]" />
            </div>
            <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-[1fr_0.9fr] xlarge:grid-cols-[1fr_0.9fr] xlarge:items-center">
              <FadeIn>
                <div className="space-y-8">
                  <div>
                    <p className="text-xs tracking-[0.4em] uppercase text-blue-200">Our Strengths</p>
                    {strengthsTitle && (
                      <h2 className="text-3xl sm:text-4xl font-semibold">
                        {strengthsTitle}
                      </h2>
                    )}
                  </div>
                  {strengths.length > 0 && (
                    <div className="space-y-4">
                      {strengths.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                          <p className="text-white/90">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {keysOfSuccess.length > 0 && (
                    <div className="flex h-full flex-col justify-between space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                      <p className="text-xs tracking-[0.4em] uppercase text-blue-200">
                        Our Keys of Success
                      </p>
                      <div className="mt-6 space-y-4 text-white/90">
                        {keysOfSuccess.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                            <p>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
              {strengthsImgUrl && (
                <FadeIn delay={80}>
                  <div className="space-y-8">
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <Image
                        src={strengthsImgUrl}
                        alt="Modern hospitality building"
                        className="md:max-h-[700px] w-full object-cover"
                        width={800}
                        height={1000}
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-black/40 to-transparent" />
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
