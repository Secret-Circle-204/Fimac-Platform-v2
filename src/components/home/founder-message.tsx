import Image from "next/image"
import { FadeIn } from "@/components/animations/fade-in"

export function FounderMessage() {
  return (
    <section className="relative overflow-hidden bg-blue-fimac text-white  py-20">
      <div className="absolute inset-0 opacity-40">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200 blur-xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-48 w-48 rounded-full bg-blue-500 blur-2xl" />
      </div>
      <div className="relative container mx-auto px-4 grid gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <FadeIn className="flex-1">
          <div className="pb-24 flex h-full flex-col justify-between space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-200">
                A Word from the Founder
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Mr. Louis J. Heessels</h2>
            </div>
            <blockquote className="text-lg leading-relaxed text-slate-100">
              &ldquo;The global hospitality landscape is a tapestry of unique stories, from the
              grandest resorts to the quaintest boutique hotels. For decades, I&apos;ve seen firsthand
              the passion and dedication that business owners pour into these establishments. Yet,
              when it comes to the pivotal moments of buying or selling, the market often lacks a
              dedicated, strategic partner. That&apos;s why I founded FIMAC. We&apos;re not just a platform;
              we are a consultancy built on trust, deep market insight, and a shared vision of
              success. Our mission is to bridge the gap between discerning investors and remarkable
              opportunities, ensuring every transaction is not just a deal, but a legacy. We are
              here to empower your next chapter in hospitality.&rdquo;
            </blockquote>
            <div className="text-sm tracking-wide text-blue-100">
              Founder &amp; Managing Partner, FIMAC
            </div>
          </div>
        </FadeIn>
        <FadeIn className="flex-1" delay={120}>
          <div className="group relative mx-auto max-w-sm overflow-hidden rounded-2xl  border border-white/20 bg-white/10 shadow-2xl transition-shadow duration-500 hover:shadow-3xl">
            <Image
              src={"/fimac-oner.jpg"}
              width={400}
              height={400}
              alt="Portrait of Mr. Louis J. Heessels, founder of FIMAC"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 90vw, 400px"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
