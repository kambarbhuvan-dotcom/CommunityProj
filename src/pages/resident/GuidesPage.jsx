/**
 * GuidesPage.jsx — Learn Solar Educational Hub
 *
 * Implements:
 * - 9 Comprehensive Educational Categories
 * - Interactive "Solar Tips of the Day" section
 * - Search bar across titles, content, summaries, and tags
 * - Category filter tabs
 * - Attractive cards with icons, read times, badges, and summaries
 * - Seamless navigation to detailed article pages
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, BookOpen, Sun, Zap, Layers, Sparkles, Wrench, ShieldCheck,
  DollarSign, Building, HelpCircle, Clock, ArrowRight, X, Compass,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import SolarTipsOfTheDay from '../../components/learn/SolarTipsOfTheDay'
import { LEARN_SOLAR_TOPICS } from '../../data/learnSolarContent'

const ICON_MAP = {
  Sun,
  Zap,
  Layers,
  Sparkles,
  Wrench,
  ShieldCheck,
  DollarSign,
  Building,
  HelpCircle,
  Compass,
}

export default function GuidesPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Categories list
  const categories = useMemo(() => {
    const list = ['All']
    LEARN_SOLAR_TOPICS.forEach((t) => {
      if (!list.includes(t.category)) {
        list.push(t.category)
      }
    })
    return list
  }, [])

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return LEARN_SOLAR_TOPICS.filter((topic) => {
      const matchCat =
        selectedCategory === 'All' || topic.category === selectedCategory

      if (!search.trim()) return matchCat

      const q = search.toLowerCase()
      const matchTitle = topic.title.toLowerCase().includes(q)
      const matchSummary = topic.summary.toLowerCase().includes(q)
      const matchContent = topic.content.toLowerCase().includes(q)
      const matchTags = topic.tags.some((tag) => tag.toLowerCase().includes(q))

      return matchCat && (matchTitle || matchSummary || matchContent || matchTags)
    })
  }, [search, selectedCategory])

  return (
    <AppLayout>
      <PageWrapper
        title="Learn Solar — Educational Hub"
        subtitle="Empowering community residents with clear, verified knowledge on solar technology, savings, and government initiatives."
      >
        {/* ── Solar Tips of the Day Component ───────────────────────────── */}
        <SolarTipsOfTheDay />

        {/* ── Search & Filter Controls ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6 border border-[#DCEBFA]">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search solar guides, subsidies, maintenance, tariffs…"
                className="form-input pl-10 text-xs py-2.5 bg-[#F4FAFF] border-[#DCEBFA] text-[#153B65] focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#153B65]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Total count badge */}
            <div className="text-xs text-[#64748B] font-medium">
              Showing <strong className="text-[#153B65] font-semibold">{filteredTopics.length}</strong> of{' '}
              {LEARN_SOLAR_TOPICS.length} educational guides
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-[#DCEBFA] scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-[#F4FAFF] text-[#64748B] hover:bg-[#EAF6FF] hover:text-[#2563EB] border border-[#DCEBFA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Educational Topic Cards Grid ───────────────────────────────── */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#DCEBFA] shadow-card">
            <EmptyState
              icon={BookOpen}
              title="No educational articles found"
              description={`We couldn't find any guides matching "${search}". Try searching for terms like "subsidies", "maintenance", "installation", or clear your filter.`}
              action={{
                label: 'View All Guides',
                onClick: () => {
                  setSearch('')
                  setSelectedCategory('All')
                },
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredTopics.map((topic, index) => {
              const Icon = ICON_MAP[topic.icon] || BookOpen

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl shadow-card overflow-hidden border border-[#DCEBFA] hover:shadow-card-hover hover:border-[#87CEEB] hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
                >
                  {/* Decorative Card Header Banner */}
                  <div className={`h-24 bg-gradient-to-r ${topic.accentColor} p-4 flex items-center justify-between text-white relative overflow-hidden`}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-black text-white/25 select-none">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Category pill & read time */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EAF6FF] px-2.5 py-0.5 rounded-full border border-[#DCEBFA]">
                        {topic.category}
                      </span>
                      <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
                        <Clock size={12} /> {topic.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[#153B65] text-base mb-2 group-hover:text-[#2563EB] transition-colors leading-snug">
                      {topic.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4 flex-1">
                      {topic.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-[#64748B] bg-[#F4FAFF] px-2 py-0.5 rounded-md border border-[#DCEBFA]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={`/guides/${topic.slug}`}
                      className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#EAF6FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white text-xs font-semibold transition-all mt-auto border border-[#DCEBFA] hover:border-[#2563EB]"
                    >
                      <span>Read Detailed Guide</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </PageWrapper>
    </AppLayout>
  )
}
