/**
 * ManageBuildingsPage.jsx — Admin: manage community buildings
 */
import { useState } from 'react'
import { Building2, Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

const DEMO_BUILDINGS = [
  { id: 'b1', name: 'Sunrise Apartments Block A', address: '12 Vidyanagar Main Road', city: 'Hubballi', total_units: 24, residents: 6 },
]

export default function ManageBuildingsPage() {
  const [buildings] = useState(DEMO_BUILDINGS)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Buildings"
        subtitle="Community buildings that group residents for aggregated statistics."
        actions={
          <div className="flex gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Building</Button>
          </div>
        }
      >
        {buildings.length === 0 ? (
          <EmptyState icon={Building2} title="No buildings yet" description="Add a building to group residents and enable community statistics."
            action={{ label: 'Add Building', onClick: () => setShowAdd(true) }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {buildings.map((b) => (
              <Card key={b.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center">
                    <Building2 size={18} className="text-forest" />
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={13} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
                <h3 className="font-semibold text-charcoal mb-1">{b.name}</h3>
                <p className="text-sm text-charcoal-300 mb-3">{b.address}, {b.city}</p>
                <div className="flex gap-3">
                  <div className="bg-charcoal-100/30 rounded-xl px-3 py-2 text-center flex-1">
                    <p className="text-lg font-bold text-charcoal">{b.total_units}</p>
                    <p className="text-xs text-charcoal-300">Total Units</p>
                  </div>
                  <div className="bg-forest-50 rounded-xl px-3 py-2 text-center flex-1">
                    <p className="text-lg font-bold text-forest">{b.residents}</p>
                    <p className="text-xs text-charcoal-300">Active</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Building">
          <div className="space-y-4">
            <div><label className="form-label">Building name</label><input className="form-input" placeholder="Sunrise Apartments Block A" /></div>
            <div><label className="form-label">Address</label><input className="form-input" placeholder="12 Green Park Road" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="form-label">City</label><input className="form-input" placeholder="Hubballi" /></div>
              <div><label className="form-label">Total units</label><input type="number" className="form-input" placeholder="24" /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowAdd(false)}>Save Building</Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

