/**
 * ManageAchievementsPage.jsx — Admin: create/edit/delete achievements
 */
import { useState } from 'react'
import { Plus, Pencil, Trash2, ShieldCheck, Trophy, Star, Sun, Zap, Leaf, Award } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { DEMO_ACHIEVEMENTS } from '../../data/demoData'
import { formatDate } from '../../utils/formatters'

const iconMap = { Trophy, Star, Sun, Zap, Leaf, Award }
const iconOptions = Object.keys(iconMap)

export default function ManageAchievementsPage() {
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', icon: 'Trophy', achieved_at: '', threshold_kwh: '' })

  const PreviewIcon = iconMap[form.icon] || Trophy

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Achievements"
        subtitle="Community milestones and solar accomplishments."
        actions={
          <div className="flex gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> New Achievement</Button>
          </div>
        }
      >
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40">
                  {['Icon', 'Title', 'Achieved', 'Threshold', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-300 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100/30">
                {DEMO_ACHIEVEMENTS.map((a) => {
                  const Icon = iconMap[a.icon] || Trophy
                  return (
                    <tr key={a.id} className="hover:bg-charcoal-100/10">
                      <td className="px-4 py-3">
                        <div className="w-7 h-7 rounded-lg bg-solar-100 flex items-center justify-center">
                          <Icon size={14} className="text-solar-600" />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-charcoal">{a.title}</td>
                      <td className="px-4 py-3 text-charcoal-300 whitespace-nowrap">{formatDate(a.achieved_at)}</td>
                      <td className="px-4 py-3 text-charcoal-300">{a.threshold_kwh ? `${a.threshold_kwh.toLocaleString()} kWh` : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Achievement" size="md">
          <div className="space-y-4">
            <div><label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="form-label">Description</label>
              <textarea rows={2} className="form-input resize-none" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Icon</label>
                <select className="form-input" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
                  {iconOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <div className="w-10 h-10 rounded-xl bg-solar-100 flex items-center justify-center">
                  <PreviewIcon size={18} className="text-solar-600" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="form-label">Achieved At</label>
                <input type="date" className="form-input" value={form.achieved_at}
                  onChange={(e) => setForm((f) => ({ ...f, achieved_at: e.target.value }))} /></div>
              <div><label className="form-label">Threshold (kWh) <span className="text-charcoal-200 font-normal">optional</span></label>
                <input type="number" className="form-input" value={form.threshold_kwh}
                  onChange={(e) => setForm((f) => ({ ...f, threshold_kwh: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowForm(false)}>Save Achievement</Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Achievement" size="sm">
          <p className="text-sm text-charcoal-300 mb-5">Delete &quot;{deleteTarget?.title}&quot;?</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => setDeleteTarget(null)}>Delete</Button>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

