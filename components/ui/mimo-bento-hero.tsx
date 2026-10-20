"use client"

import * as React from "react"
import { BentoCell, BentoGrid, ContainerScale, ContainerScroll } from "@/components/ui/hero-gallery-scroll-animation"
import { Button } from "@/components/ui/button"

interface BentoItem {
  title: string
  subtitle: string
  videoSrc: string
  posterSrc: string
}

const MIMO_BENTO_ITEMS: BentoItem[] = [
  {
    title: "Sonido Inmersivo",
    subtitle: "Parlantes y auriculares con fidelidad de estudio.",
    videoSrc: "/img/videos/Headphones_and_speaker_on_surface_20261019215844.mp4",
    posterSrc: "/img/videos/poster_sonido.jpg",
  },
  {
    title: "Smartphones",
    subtitle: "Potencia en tu bolsillo.",
    videoSrc: "/img/videos/Smartphone_on_glossy_pedestal_20261019215848.mp4",
    posterSrc: "/img/videos/poster_smartphone.jpg",
  },
  {
    title: "Smart TVs",
    subtitle: "Resolución 4K ultra nítida.",
    videoSrc: "/img/videos/TV_displaying_neon_city_skyline_20261019215836.mp4",
    posterSrc: "/img/videos/poster_tv.jpg",
  },
  {
    title: "Accesorios Pro",
    subtitle: "El complemento perfecto para tu setup.",
    videoSrc: "/img/videos/Mechanical_keyboard_and_gaming_20261019215851.mp4",
    posterSrc: "/img/videos/poster_accesorios.jpg",
  },
]

export function MimoBentoHero() {
  return (
    <ContainerScroll className="h-[300vh] bg-[#06080d] text-white">
      {/* Bento Grid con las 4 tarjetas de Mimo Store */}
      <BentoGrid
        variant="fourCells"
        className="sticky left-0 top-0 h-svh w-full max-w-6xl mx-auto p-4 md:p-8"
      >
        {MIMO_BENTO_ITEMS.map((item, index) => (
          <BentoCell
            key={index}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#080A10] shadow-2xl transition-all duration-300 hover:border-cyan-400/40"
          >
            {/* Video de fondo interactivo */}
            <video
              className="absolute inset-0 size-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
              loop
              muted
              playsInline
              preload="metadata"
              poster={item.posterSrc}
              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
              onMouseLeave={(e) => {
                e.currentTarget.pause()
                e.currentTarget.currentTime = 0
              }}
            >
              <source src={item.videoSrc} type="video/mp4" />
            </video>

            {/* Gradiente oscuro inferior para legibilidad */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06080e]/95 via-[#06080e]/40 to-transparent" />

            {/* Contenido textual de la tarjeta */}
            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                {item.title}
              </h3>
              <p className="mt-1 text-sm md:text-base text-white/80 drop-shadow">
                {item.subtitle}
              </p>
            </div>
          </BentoCell>
        ))}
      </BentoGrid>

      {/* Titular Flotante Central con escala y opacidad reactiva al Scroll */}
      <ContainerScale className="text-center px-4">
        <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
          Experiencia Mimo
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Tecnología de{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Otro Nivel
          </span>
        </h1>
        <p className="mx-auto my-6 max-w-xl text-sm md:text-lg text-white/70">
          Descubrí nuestra selección de productos diseñados para llevar tu vida
          digital al máximo.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            asChild
            className="rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 px-7 py-6 text-base font-bold text-black shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:opacity-90"
          >
            <a href="#products">Ver Catálogo</a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/20 bg-white/5 px-7 py-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10"
          >
            <a href="#setups">Explorar Setups</a>
          </Button>
        </div>
      </ContainerScale>
    </ContainerScroll>
  )
}
