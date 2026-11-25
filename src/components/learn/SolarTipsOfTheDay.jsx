/**
 * SolarTipsOfTheDay.jsx
 *
 * Interactive, visually engaging "Solar Tips of the Day" component.
 * Allows users to cycle through actionable tips on energy savings, panel maintenance,
 * appliance scheduling, and efficiency optimization.
 */

import { useState } from 'react'
import {
  Lightbulb, ChevronLeft, ChevronRight, Sun, Wrench, Zap, Leaf, Compass,
  Sparkles, CheckCircle2,
} from 'lucide-react'
import { SOLAR_TIPS_OF_THE_DAY } from '../../data/learnSolarContent'

const ICON_MAP = {
  Sun,
  Wrench,
  Zap,
  Leaf,
  Compass,
}

export default function SolarTipsOfTheDay() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentTip = SOLAR_TIPS_OF_THE_DAY[currentIndex]
  const IconComponent = ICON_MAP[currentTip.icon] || Lightbulb

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SOLAR_TIPS_OF_THE_DAY.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === SOLAR_TIPS_OF_THE_DAY.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#153B65] via-[#1D4ED8] to-[#2563EB] text-white p-6 shadow-card mb-8">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#87CEEB]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#87CEEB]/20 border border-[#87CEEB]/40 flex items-center justify-center text-[#87CEEB]">
              <Lightbulb size={18} />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#87CEEB]">
                Daily Community Advice
              </span>
              <h2 className="text-base font-bold text-white">Solar Tip of the Day</h2>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#DCEBFA] font-medium">
              {currentIndex + 1} of {SOLAR_TIPS_OF_THE_DAY.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous tip"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next tip"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Tip content card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <IconComponent size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-[#EAF6FF] border border-white/20">
                  {currentTip.category}
                </span>
                <span className="text-xs font-bold text-white">
                  {currentTip.title}
                </span>
              </div>
              <p className="text-sm text-[#F4FAFF] leading-relaxed mb-3">
                {currentTip.tip}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#87CEEB] bg-[#153B65]/50 px-3 py-1 rounded-lg border border-[#87CEEB]/30">
                <Sparkles size={12} className="text-[#87CEEB]" />
                <span>Estimated Impact: {currentTip.impact}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {SOLAR_TIPS_OF_THE_DAY.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === i ? 'w-6 bg-[#87CEEB]' : 'w-1.5 bg-white/30'
              }`}
              aria-label={`Go to tip ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

