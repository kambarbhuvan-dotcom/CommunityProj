/**
 * AnnouncementsPage.jsx — Community Notices & Solar Project Broadcasts
 */

import { useState, useEffect } from 'react'
import { Pin, Bell, Sparkles, Calendar } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton'
import { getAllAnnouncements } from '../../services/adminService'
import { formatDate } from '../../utils/formatters'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getAllAnnouncements()
        setAnnouncements(list)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pinned = announcements.filter((a) => a.is_pinned)
  const rest = announcements.filter((a) => !a.is_pinned)

  function AnnouncementCard({ a }) {
    return (
      <div className={`bg-white rounded-2xl shadow-card p-5 transition-all hover:shadow-card-hover hover:border-[#87CEEB] ${
        a.is_pinned ? 'border-l-4 border-l-[#0EA5E9] border-y border-r border-[#DCEBFA]' : 'border border-[#DCEBFA]'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#153B65] text-base">{a.title}</h3>
            {a.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]">
                {a.category}
              </span>
            )}
          </div>
          {a.is_pinned && (
            <span className="inline-flex items-center gap-1 text-xs text-[#0EA5E9] font-semibold shrink-0">
              <Pin size={13} /> Pinned
            </span>
          )}
        </div>

        <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line mb-3">
          {a.summary || a.body || a.description}
        </p>

        {a.highlight && (
          <p className="text-xs text-[#2563EB] font-medium bg-[#EAF6FF] border border-[#DCEBFA] px-2.5 py-1 rounded-lg inline-block mb-3">
            ★ {a.highlight}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-[#64748B] pt-2 border-t border-[#DCEBFA]">
          <Calendar size={12} />
          <span>{formatDate(a.published_at || a.event_date || a.date)}</span>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <PageWrapper
        title="Community Announcements"
        subtitle="Notices, upcoming clean energy drives, and policy updates from your solar project administrators."
      >
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-charcoal-100/40 p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <SkeletonText lines={2} />
                <div className="pt-2 border-t border-charcoal-100/30 flex items-center gap-2">
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No announcements right now"
            description="Check back soon for clean energy events, seasonal maintenance notices, and community achievements."
          />
        ) : (
          <div className="space-y-6">
            {pinned.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pin size={15} className="text-solar-500" />
                  <h2 className="text-xs font-bold text-charcoal-300 uppercase tracking-wider">
                    Pinned Notices
                  </h2>
                </div>
                <div className="space-y-3">
                  {pinned.map((a) => (
                    <AnnouncementCard key={a.id} a={a} />
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h2 className="text-xs font-bold text-charcoal-300 uppercase tracking-wider mb-3">
                    Recent Updates
                  </h2>
                )}
                <div className="space-y-3">
                  {rest.map((a) => (
                    <AnnouncementCard key={a.id} a={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </AppLayout>
  )
}
