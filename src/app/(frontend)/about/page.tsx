import Image from 'next/image'

import { FadeIn } from '@/components/animations/fade-in'

const values = [
  {
    title: 'Integrity',
    description: 'We operate with unwavering honesty and transparency in all our dealings.',
  },
  {
    title: 'Expertise',
    description:
      'We are committed to deep market knowledge and continuous professional development.',
  },
  {
    title: 'Partnership',
    description: 'We build lasting relationships based on trust and mutual respect.',
  },
  {
    title: 'Innovation',
    description: 'We leverage cutting-edge technology to enhance our platform and services.',
  },
  {
    title: 'Excellence',
    description: 'We strive for the highest standards in every aspect of our work.',
  },
]

const strengths = [
  'Niche Specialization: Our exclusive focus on hospitality properties provides us with a deep understanding of the market.',
  'Global Network: We have a broad network of high-net-worth individuals, institutional investors, and seasoned brokers.',
  'Expert Team: Our team comprises seasoned professionals with backgrounds in finance, real estate, and hospitality management.',
  'Data-Driven Insights: We use advanced analytics to provide accurate valuations and market forecasts.',
]

const keysOfSuccess = [
  'Building a Trust Ecosystem: Establishing FIMAC as the go-to brand for honest and reliable advice.',
  'Seamless User Experience: Creating an intuitive and powerful digital platform that simplifies the buying and selling process.',
  'Strategic Partnerships: Collaborating with leading brokers and financial institutions to expand our reach.',
  'Content Leadership: Becoming an authority on hospitality investment through insightful market research and analysis.',
]

export const metadata = {
  title: 'About FIMAC | Hospitality Investment Advisors',
  description:
    "Discover FIMAC's mission, values, and strengths in global hospitality transactions.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col ">
      <main className="flex-1">
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
            {/* Immersive gradient overlays for luxurious text readability */}
            {/* <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-transparent z-10" /> */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent opacity-80 z-10" /> */}
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
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white max-w-4xl">
                Financial Investment <br className=" hidden sm:inline" />
                <span className=" text-white">Management Advice</span> Consultants
              </h1>

              {/* Sleek, Readable Body Text */}
              <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl font-light">
                FIMAC (Financial Investment Management Advice Consultants) is a premier global
                consultancy specializing in the sale and acquisition of hospitality properties. Our
                exclusive platform and services are tailored for business owners, investors, and
                brokers in the hotel, motel, resort, and boutique hotel sectors. We provide a
                sophisticated marketplace combined with expert advisory services, including
                valuation, marketing, and negotiation. Our expertise ensures that every client
                receives personalized attention and a strategic approach designed to maximize value.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <FadeIn className="space-y-8">
              <p className="text-xs tracking-[0.4em] uppercase text-blue-900">
                Foundation & Strategic Vision
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                Built on vision, driven by purpose
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  <strong>Vision:</strong> To be the world&apos;s most trusted and influential
                  platform for hospitality property transactions, redefining the standards of
                  excellence and becoming the first choice for professionals seeking to buy or list
                  hospitality assets.
                </p>
                <p>
                  <strong>Mission:</strong> Our mission is to empower hospitality business owners,
                  investors, and brokers by providing a seamless, secure, and expert-led platform
                  that facilitates successful transactions. We are dedicated to delivering
                  exceptional value through unparalleled market intelligence, strategic advice, and
                  a commitment to client success.
                </p>
              </div>
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
            </FadeIn>
            <FadeIn delay={80}>
              <div className="relative overflow-hidden h-full w-full rounded-3xl shadow-2xl">
                <Image
                  src={'/scene-with-business-.jpg'}
                  alt="Strategic vision session"
                  className="h-full w-full object-cover"
                  width={500}
                  height={500}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </section>

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
                  <h2 className="text-3xl sm:text-4xl font-semibold">
                    Why hospitality leaders partner with FIMAC
                  </h2>
                </div>
                <div className="space-y-4">
                  {strengths.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                      <p className="text-white/90">{item}</p>
                    </div>
                  ))}
                </div>
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
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src={'/building-dreamy.jpg'}
                    alt="Modern hospitality building"
                    className="md:max-h-[700px] w-full object-cover"
                    width={800}
                    height={1000}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/40 to-transparent" />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </div>
  )
}
