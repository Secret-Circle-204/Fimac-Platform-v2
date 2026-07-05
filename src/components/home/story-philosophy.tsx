import Image from "next/image"
import storyHero from "@/assets/low-angle.jpg"
import { FadeIn } from "@/components/animations/fade-in"

const sections = [
  {
    title: "Story",
    body:
      "The story of FIMAC began with a simple observation: the real estate market for hotels, motels, resorts, and boutique establishments was fragmented and underserved. Hospitality owners, often too focused on the daily operations of their business, struggled to find the right buyers or sellers. The industry needed a specialist, a consultant who understood not only the financial metrics but also the unique emotional and operational value of a hospitality asset. FIMAC was born from this need, founded by Mr. Louis J. Heessels, a seasoned financial and investment professional with a passion for the hospitality sector. Our journey is one of connecting people and properties, crafting a seamless, professional experience that elevates the standard for hospitality real estate transactions.",
  },
  {
    title: "Philosophy",
    body:
      "Our brand philosophy is rooted in partnership and precision. We believe that successful business transactions are built on a foundation of mutual trust and transparency. We are committed to providing a bespoke, concierge-level service that prioritizes the client's goals. FIMAC acts as a strategic advisor, guiding clients through every step of the process with unparalleled expertise and a steadfast commitment to their best interests.",
  },
]

export function StoryPhilosophy() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <FadeIn className="space-y-10">
          <p className="text-xs tracking-[0.4em] uppercase text-blue-900">Story &amp; Philosophy</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
            Built for hospitality visionaries and the assets they steward
          </h2>
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-2xl font-semibold text-slate-800">{section.title}</h3>
                <p className="text-base leading-relaxed text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn className="relative h-full min-h-[320px] overflow-hidden rounded-3xl shadow-xl" delay={120}>
          <Image
            src={storyHero}
            alt="Low angle architectural shot representing FIMAC's hospitality vision"
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </FadeIn>
      </div>
    </section>
  )
}
