import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lightbulb, Plus, X, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Concepts({ session }) {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: '', desc: '', problem: '', source: '', discipline: '' });

  const fetchData = async () => {
    const { data } = await supabase.from('concepts').select('*').order('created_at', { ascending: false });
    if (data) setConcepts(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const saveConcept = async () => {
    if (!form.name.trim()) { toast.error('Isi nama konsep'); return; }
    
    if (editingId) {
      const { error } = await supabase.from('concepts').update({
        name: form.name, desc: form.desc, problem: form.problem, source: form.source, discipline: form.discipline
      }).eq('id', editingId);
      if (error) { toast.error('Error: ' + error.message); return; }
      toast.success('Konsep diperbarui');
    } else {
      const { error } = await supabase.from('concepts').insert([{
        ...form, user_id: session.user.id
      }]);
      if (error) { toast.error('Error: ' + error.message); return; }
      toast.success('Konsep tersimpan');
    }
    setModalOpen(false);
    fetchData();
  };

  const deleteConcept = async (id) => {
    if (!window.confirm("Yakin ingin menghapus konsep ini?")) return;
    const { error } = await supabase.from('concepts').delete().eq('id', id);
    if (error) { toast.error("Gagal menghapus: " + error.message); return; }
    toast.success('Konsep dihapus');
    fetchData();
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name || '', desc: c.desc || '', problem: c.problem || '', source: c.source || '', discipline: c.discipline || '' });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', desc: '', problem: '', source: '', discipline: '' });
  };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Konsep & Ilmu</h2>
          <p className="section-sub">Setiap konsep baru memperluas toolkit bahasa berpikirmu</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Tambah Konsep
        </button>
      </div>

      {loading ? <p>Loading...</p> : !concepts.length ? (
        <div className="empty-state">
          <Lightbulb style={{ width: 48, height: 48, color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }} />
          <h3>Perpustakaan Kosong</h3>
          <p>Setiap konsep baru yang kamu pelajari memperluas toolkit bahasa berpikirmu.</p>
        </div>
      ) : (
        <div>
          {concepts.map(c => (
            <div key={c.id} className="concept-item">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <div className="concept-name">{c.name}</div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  {c.discipline && <span className="badge badge-primary">{c.discipline}</span>}
                  <button onClick={() => startEdit(c)} style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}><Pencil width={14}/></button>
                  <button onClick={() => deleteConcept(c.id)} style={{ color: 'var(--color-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 width={14}/></button>
                </div>
              </div>
              <div className="concept-desc">{c.desc}</div>
              {c.problem && <div style={{ marginBottom: 'var(--space-2)' }}><span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Relevansi ke hidupku:</span><p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.6 }}>{c.problem}</p></div>}
              {c.source && <span className="concept-link">📚 {c.source}</span>}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Konsep' : 'Tambah Konsep Baru'}</h3>
              <button className="btn-ghost" style={{ border:'none', padding:0 }} onClick={() => setModalOpen(false)}><X width={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nama Konsep</label><input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Penjelasan</label><textarea className="form-input form-textarea" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Masalah Hidupku yang Bisa Dijelaskan Konsep Ini</label><textarea className="form-input form-textarea" value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Sumber</label><input type="text" className="form-input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Disiplin Ilmu</label><input type="text" className="form-input" value={form.discipline} onChange={e => setForm({ ...form, discipline: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveConcept}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
