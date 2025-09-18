import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SmallLabel({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
}

/**
 * Inline modal for creating a new NGO
 * props:
 *  - onCreate({ id, name, type }) -> called after created successfully
 *  - onClose()
 */
function AddNgoModal({ open, onClose, onCreate, defaultType }) {
  const [name, setName] = useState('')
  const [type, setType] = useState(defaultType || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=> { if (!open) { setName(''); setType(defaultType||''); setError(null) } }, [open, defaultType])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-3">Add new NGO</h3>

        <SmallLabel>NGO / Organization Name</SmallLabel>
        <input className="w-full rounded border p-2 mb-3" value={name} onChange={e=>setName(e.target.value)} />

        <SmallLabel>Type</SmallLabel>
        <select className="w-full rounded border p-2 mb-4" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">Select type</option>
          <option value="CSR">Corporate (CSR)</option>
          <option value="NGO">NGO</option>
          <option value="COMMUNITY">Religious/Community</option>
          <option value="EDU">Educational</option>
          <option value="OTHER">Other</option>
        </select>

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <div className="flex justify-end space-x-2">
          <button className="px-3 py-2 rounded border" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            onClick={async ()=>{
              if (!name.trim()) { setError('Name is required'); return }
              setLoading(true); setError(null)
              try {
                const res = await fetch('/api/ngos', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ name: name.trim(), type })
                })
                if (!res.ok) {
                  const txt = await res.text().catch(()=>res.statusText)
                  throw new Error(txt || 'Failed to create NGO')
                }
                const created = await res.json()
                onCreate(created)
                onClose()
              } catch (err) {
                console.error(err)
                setError(err.message || 'Failed to create NGO')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create NGO'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NGORequestForm(){
  const navigate = useNavigate()
  const [villages, setVillages] = useState([])
  const [ngos, setNgos] = useState([])
  const [supportTypes, setSupportTypes] = useState([])
  const [scales, setScales] = useState([])

  const [form, setForm] = useState({
    ngoId: '',           // existing NGO selected (or empty)
    ngoName: '',         // used when creating new NGO inline (optional here)
    ngoType: '',         // type (if creating new NGO or chosen NGO has type)
    contactPerson: '',
    designation: '',
    contactPhone: '',
    supportTypeId: '',
    scaleId: '',
    villageId: '',
    remarks: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(()=>{
    // fetch lists in parallel
    Promise.all([
      fetch('/api/villages').then(r=>r.json()),
      fetch('/api/ngos').then(r=>r.json()),
      fetch('/api/support-types').then(r=>r.json()),
      fetch('/api/scales').then(r=>r.json())
    ]).then(([v, n, s, sc]) => {
      setVillages(v || [])
      setNgos(n || [])
      setSupportTypes(s || [])
      setScales(sc || [])
    }).catch(e => {
      console.error('Failed to load form options', e)
      setError('Failed to load form options. Please try again.')
    })
  },[])

  function update(k, v){ setForm(prev => ({ ...prev, [k]: v })) }

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)

    // basic validation
    if (!form.villageId) return setError('Please select a village.')
    if (!form.supportTypeId) return setError('Please choose a type of support.')
    if (!form.scaleId) return setError('Please indicate scale of involvement.')
    if (!form.contactPerson) return setError('Please provide a contact person.')
    if (!form.contactPhone) return setError('Please provide contact phone.')

    setLoading(true)
    try {
      const payload = {
        ngoId: form.ngoId || null,
        ngoName: form.ngoId ? undefined : (form.ngoName || undefined),
        ngoType: form.ngoType || undefined,
        contactPerson: form.contactPerson,
        designation: form.designation,
        contactPhone: form.contactPhone,
        supportTypeId: form.supportTypeId,
        scaleId: form.scaleId,
        villageId: form.villageId,
        remarks: form.remarks
      }

      const res = await fetch('/api/ngo-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const text = await res.text().catch(()=>res.statusText)
        throw new Error(text || `HTTP ${res.status}`)
      }

      const data = await res.json()
      // success
      alert('Request submitted — ID: ' + (data.id || 'unknown') + '. It will be reviewed by DC.')
      navigate('/') // or to a success page
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to submit request.')
    } finally {
      setLoading(false)
    }
  }

  // when user chooses an existing NGO set its type in form
  useEffect(()=>{
    if (form.ngoId) {
      const sel = ngos.find(n => n.id === form.ngoId)
      if (sel) {
        update('ngoType', sel.type || '')
        update('ngoName', sel.name || '')
      }
    }
  }, [form.ngoId, ngos])

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Interest Form for Adoption of Village</h1>

      {/* <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-gray-800 leading-relaxed">
          The recent floods have significantly impacted several villages in our district,
          causing extensive damage to homes, infrastructure, and livelihoods. In this time of need,
          the District Administration of Amritsar is launching this initiative to facilitate the
          adoption of affected villages by organisations, NGOs, corporations and individuals.
        </p>
      </div> */}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NGO selection + add new */}
        <div>
          <SmallLabel>NGO (select existing or add new)</SmallLabel>
          <div className="flex gap-2 items-center">
            <select className="flex-1 border rounded p-2" value={form.ngoId} onChange={e => update('ngoId', e.target.value)}>
              <option value="">-- Select an NGO (or add new) --</option>
              {ngos.map(n => <option key={n.id} value={n.id}>{n.name} {n.type ? `(${n.type})` : ''}</option>)}
            </select>

            <button type="button" className="px-3 py-2 rounded border" onClick={()=> setModalOpen(true)}>Add NGO</button>
          </div>
        </div>


        {/* Contact details */}
        <div>
          <SmallLabel>Name of the concerned person</SmallLabel>
          <input className="w-full border rounded p-2" value={form.contactPerson} onChange={e=>update('contactPerson', e.target.value)} />
        </div>

        <div>
          <SmallLabel>Designation of the concerned person</SmallLabel>
          <input className="w-full border rounded p-2" value={form.designation} onChange={e=>update('designation', e.target.value)} />
        </div>

        <div>
          <SmallLabel>Contact details of the concerned person</SmallLabel>
          <input className="w-full border rounded p-2" value={form.contactPhone} onChange={e=>update('contactPhone', e.target.value)} placeholder="Phone / WhatsApp" />
        </div>

        {/* Type of support (from DB) */}
        <div>
          <SmallLabel>Please indicate the type of support you are interested in</SmallLabel>
          <select className="w-full border rounded p-2" value={form.supportTypeId} onChange={e=>update('supportTypeId', e.target.value)}>
            <option value="">Select support type</option>
            {supportTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {/* Scale of involvement (from DB) */}
        <div>
          <SmallLabel>Please indicate the scale of your potential involvement</SmallLabel>
          <select className="w-full border rounded p-2" value={form.scaleId} onChange={e=>update('scaleId', e.target.value)}>
            <option value="">Select scale</option>
            {scales.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {/* Village dropdown */}
        <div>
          <SmallLabel>Village</SmallLabel>
          <select className="w-full border rounded p-2" value={form.villageId} onChange={e=>update('villageId', e.target.value)}>
            <option value="">Choose a village</option>
            {villages.map(v => <option key={v.id} value={v.id}>{v.name} {v.district ? `— ${v.district}` : ''}</option>)}
          </select>
        </div>

        <div>
          <SmallLabel>Any other remarks</SmallLabel>
          <textarea className="w-full border rounded p-2" rows={4} value={form.remarks} onChange={e=>update('remarks', e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className="px-3 py-2 border rounded" onClick={()=>{ /* reset */ setForm({
            ngoId: '', ngoName:'', ngoType:'', contactPerson:'', designation:'', contactPhone:'', supportTypeId:'', scaleId:'', villageId:'', remarks:''
          })}}>Clear</button>
        </div>
      </form>

      <AddNgoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(createdNgo) => {
          // append to local list and set selected
          setNgos(prev => [createdNgo, ...prev])
          setForm(prev => ({ ...prev, ngoId: createdNgo.id, ngoName: createdNgo.name, ngoType: createdNgo.type }))
        }}
        defaultType={form.ngoType}
      />
    </div>
  )
}
