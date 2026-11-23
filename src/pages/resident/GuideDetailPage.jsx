/**
 * GuideDetailPage.jsx — Detailed Solar Educational Article Page
 *
 * Implements:
 * - Sticky reading progress indicator (progress bar + percentage indicator)
 * - Clean typography and beginner-friendly formatting
 * - Markdown table rendering
 * - Advisory/alert callouts for Government Schemes & verified references
 * - Official reference links with verified badges
 * - Related articles navigation and back-to-top feature
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, BookOpen, ExternalLink, ShieldCheck,
  CheckCircle2, Share2, ArrowUp, Tag, AlertTriangle,
  Sun, Zap, Layers, Sparkles, Wrench, DollarSign, Building, HelpCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
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
}

export default function GuideDetailPage() {
  const { slug } = useParams()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  // Find matching guide
  const guide = useMemo(() => {
    return LEARN_SOLAR_TOPICS.find((g) => g.slug === slug)
  }, [slug])

  // Related topics in other categories
  const relatedTopics = useMemo(() => {
    if (!guide) return []
    return LEARN_SOLAR_TOPICS.filter((g) => g.slug !== slug).slice(0, 3)
  }, [guide, slug])

  // Reading progress scroll tracker
  useEffect(() => {
    const mainEl = document.querySelector('main')
    const target = mainEl || window

    const handleScroll = () => {
      if (mainEl) {
        const totalHeight = mainEl.scrollHeight - mainEl.clientHeight
        if (totalHeight > 0) {
          const currentProgress = (mainEl.scrollTop / totalHeight) * 100
          setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
        }
      } else {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight
        if (totalHeight > 0) {
          const currentProgress = (window.scrollY / totalHeight) * 100
          setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
        }
      }
    }

    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => target.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top on slug change
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setScrollProgress(0)
  }, [slug])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const scrollToTop = () => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!guide) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <BookOpen size={48} className="text-charcoal-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-charcoal mb-2">Educational Guide Not Found</h2>
          <p className="text-sm text-charcoal-300 mb-6">
            The solar guide you are looking for may have been moved or updated.
          </p>
          <Link to="/guides">
            <Button variant="primary">← Back to Learn Solar Hub</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const IconComponent = ICON_MAP[guide.icon] || BookOpen

  // ─── Custom Markdown Renderer for rich tables, headings, callouts ─────────
  const renderFormattedContent = (content) => {
    if (!content) return null

    const lines = content.trim().split('\n')
    const elements = []
    let inTable = false
    let tableRows = []

    const flushTable = (key) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0]
        const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[-:]+$/)))

        elements.push(
          <div key={`table-${key}`} className="my-6 overflow-x-auto rounded-xl border border-[#DCEBFA] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EAF6FF] border-b border-[#DCEBFA]">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-4 py-3 font-semibold text-[#153B65]">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCEBFA] bg-white">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F4FAFF]">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-[#64748B]">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
      }
      inTable = false
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())
        tableRows.push(cells)
        return
      } else if (inTable) {
        flushTable(index)
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={`spacer-${index}`} className="h-3" />)
        return
      }

      // Headings
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-[#153B65] mt-8 mb-3 flex items-center gap-2">
            <span className="w-2 h-5 rounded-full bg-[#2563EB]" />
            {trimmed.slice(3)}
          </h2>
        )
        return
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-base font-bold text-[#153B65] mt-5 mb-2">
            {trimmed.slice(4)}
          </h3>
        )
        return
      }

      // Blockquote / Advisory box
      if (trimmed.startsWith('> ')) {
        elements.push(
          <div key={`quote-${index}`} className="my-5 p-4 rounded-xl bg-[#EAF6FF] border-l-4 border-[#0EA5E9] text-xs text-[#153B65] leading-relaxed shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[#0EA5E9] mb-1">
              <AlertTriangle size={15} className="text-[#0EA5E9]" />
              <span>Official Verification Advisory</span>
            </div>
            {trimmed.slice(2)}
          </div>
        )
        return
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.slice(2)
        elements.push(
          <li key={`li-${index}`} className="flex items-start gap-2.5 text-xs text-[#64748B] my-1 leading-relaxed pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
            <span>{parseInlineFormatting(itemText)}</span>
          </li>
        )
        return
      }

      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        const parts = trimmed.match(/^(\d+\.)\s(.*)/)
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-2 text-xs text-[#64748B] my-1.5 leading-relaxed">
            <span className="font-bold text-[#2563EB] shrink-0">{parts[1]}</span>
            <span>{parseInlineFormatting(parts[2])}</span>
          </div>
        )
        return
      }

      // Normal paragraph
      elements.push(
        <p key={`p-${index}`} className="text-xs text-[#64748B] leading-relaxed mb-3">
          {parseInlineFormatting(trimmed)}
        </p>
      )
    })

    if (inTable) {
      flushTable('end')
    }

    return elements
  }

  // Parse markdown bold, links, code
  const parseInlineFormatting = (text) => {
    // Check links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const boldRegex = /\*\*([^*]+)\*\*/g

    // Simple replacement
    const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.includes('](')) {
        const match = /\[([^\]]+)\]\(([^)]+)\)/.exec(part)
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2563EB] underline hover:text-[#1D4ED8] inline-flex items-center gap-0.5"
            >
              {match[1]} <ExternalLink size={10} className="inline" />
            </a>
          )
        }
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#153B65]">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <AppLayout>
      {/* ── Sticky Reading Progress Indicator Bar at Top ───────────────── */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-[#DCEBFA] z-50">
        <div
          className="h-full bg-[#2563EB] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto pb-12">
        {/* Top navigation row */}
        <div className="flex items-center justify-between gap-4 mb-6 pt-2">
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Learn Solar Hub
          </Link>

          <div className="flex items-center gap-3">
            {/* Reading progress badge */}
            <span className="text-xs font-medium text-[#2563EB] bg-[#EAF6FF] px-2.5 py-1 rounded-full border border-[#DCEBFA]">
              {Math.round(scrollProgress)}% read
            </span>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-[#DCEBFA] hover:bg-[#EAF6FF] text-[#64748B] hover:text-[#2563EB] transition-colors text-xs flex items-center gap-1"
              title="Copy guide link"
            >
              {copied ? <CheckCircle2 size={14} className="text-[#22C55E]" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* ── Article Header Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 border border-[#DCEBFA] mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-bold text-[#2563EB] bg-[#EAF6FF] px-3 py-1 rounded-full border border-[#DCEBFA]">
              {guide.category}
            </span>
            <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
              <Clock size={13} /> {guide.readTime}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#153B65] leading-tight mb-3">
            {guide.title}
          </h1>

          <p className="text-sm text-[#64748B] leading-relaxed mb-5">
            {guide.summary}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[#DCEBFA]">
            <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
              <Tag size={12} /> Topics:
            </span>
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-[#64748B] bg-[#F4FAFF] px-2.5 py-0.5 rounded-md border border-[#DCEBFA]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Dedicated Government Solar Schemes Verification Box ──────── */}
        {guide.slug === 'government-solar-schemes-india' && (
          <div className="bg-[#EAF6FF] border border-[#DCEBFA] rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#153B65] mb-1">
                  Official Verification & Citizen Guidance Notice
                </h3>
                <p className="text-xs text-[#153B65]/80 leading-relaxed mb-3">
                  Under guidelines issued by the Ministry of New and Renewable Energy (MNRE),
                  central subsidies under <strong>PM Surya Ghar: Muft Bijli Yojana</strong> are disbursed
                  strictly through the official national portal via Direct Benefit Transfer (DBT).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <a
                    href="https://pmsuryaghar.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#DCEBFA] text-[#2563EB] font-semibold hover:bg-[#F4FAFF] transition-colors"
                  >
                    <span>pmsuryaghar.gov.in</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://mnre.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#DCEBFA] text-[#2563EB] font-semibold hover:bg-[#F4FAFF] transition-colors"
                  >
                    <span>mnre.gov.in</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://solarrooftop.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#DCEBFA] text-[#2563EB] font-semibold hover:bg-[#F4FAFF] transition-colors"
                  >
                    <span>solarrooftop.gov.in</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Detailed Article Body Content ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 border border-[#DCEBFA] mb-8">
          <article className="prose-clean">
            {renderFormattedContent(guide.content)}
          </article>
        </div>

        {/* ── Related Topics / Continue Learning Section ────────────────── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-heading text-base text-[#153B65]">Continue Learning</h3>
            <Link to="/guides" className="text-xs text-[#2563EB] font-semibold hover:underline">
              Browse All 9 Guides →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedTopics.map((item) => (
              <Link
                key={item.id}
                to={`/guides/${item.slug}`}
                className="bg-white rounded-xl p-4 border border-[#DCEBFA] shadow-sm hover:shadow-card hover:border-[#87CEEB] hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EAF6FF] px-2 py-0.5 rounded-full border border-[#DCEBFA]">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#153B65] mt-2 mb-1 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DCEBFA] text-[11px] text-[#2563EB] font-semibold">
                  <span>Read Article</span>
                  <ArrowLeft size={12} className="rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back to top floating button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DCEBFA] text-xs font-medium text-[#153B65] hover:bg-[#EAF6FF] hover:text-[#2563EB] transition-colors shadow-sm"
          >
            <ArrowUp size={14} /> Back to top
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
