import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Plus, X, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Principles({ session }) {
  const [principles, setPrinciples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ text: '', source: '', status: 'untested', notes: '' });

  const fetchData = async () => {
    const { data } = await supabase.from('principles').select('*').order('created_at', { ascending: false });
    if (data) setPrinciples(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const savePrinciple = async () => {
    if (!form.text.trim()) { toast.error('Isi teks prinsip'); return; }
    
    if (editingId) {
      const { error } = await supabase.from('principles').update({
        text: form.text, source: form.source, status: form.status, notes: form.notes
      }).eq('id', editingId);
      if (error) { toast.error('Error: ' + error.message); return; }
      toast.success('Prinsip diperbarui');
    } else {
      const { error } = await supabase.from('principles').insert([{
        ...form, user_id: session.user.id
      }]);
      if (error) { toast.error('Error: ' + error.message); return; }
      toast.success('Prinsip tersimpan');
    }
    setModalOpen(false);
    fetchData();
  };

  const deletePrinciple = async (id) => {
    if (!window.confirm("Yakin ingin menghapus prinsip ini?")) return;
    const { error } = await supabase.from('principles').delete().eq('id', id);
    if (error) { toast.error("Gagal menghapus: " + error.message); return; }
    toast.success('Prinsip dihapus');
    fetchData();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ text: p.text || '', source: p.source || '', status: p.status || 'untested', notes: p.notes || '' });
    setModalOpen(true);
  };

  const toggleStatus = async (p) => {
    const cycle = { untested: 'tested', tested: 'shattered', shattered: 'untested' };
    await supabase.from('principles').update({ status: cycle[p.status] }).eq('id', p.id);
    fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ text: '', source: '', status: 'untested', notes: '' });
  };

  const displayedP = filter === 'all' ? principles : principles.filter(p => p.status === filter);
  const statusBadge = { tested: 'badge-success', untested: 'badge-warning', shattered: 'badge-error' };
  const statusLabel = { tested: '✓ Sudah Diuji', untested: '⚠ Belum Diuji', shattered: '✗ Pernah Hancur' };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Prinsip Hidup</h2>
          <p className="section-sub">Dokumentasikan, lacak sumber, dan uji prinsip yang kamu pegang</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Tambah Prinsip
        </button>
      </div>

      <div className="tabs">
        <div className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Semua</div>
        <div className={`tab ${filter === 'tested' ? 'active' : ''}`} onClick={() => setFilter('tested')}>✓ Sudah Diuji</div>
        <div className={`tab ${filter === 'untested' ? 'active' : ''}`} onClick={() => setFilter('untested')}>⚠ Belum Diuji</div>
        <div className={`tab ${filter === 'shattered' ? 'active' : ''}`} onClick={() => setFilter('shattered')}>✗ Pernah Hancur</div>
      </div>

      {loading ? <p>Loading...</p> : !displayedP.length ? (
        <div className="empty-state">
          <ShieldCheck style={{ width: 48, height: 48, color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }} />
          <h3>Belum Ada Prinsip</h3>
          <p>Mulai inventarisasi prinsip-prinsip yang kamu pegang dan lacak dari mana asalnya.</p>
        </div>
      ) : (
        <div>
          {displayedP.map(p => (
            <div key={p.id} className="principle-item">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div className="principle-text">{p.text}</div>
                <div style={{display:'flex', gap: 8}}>
                  <button onClick={() => startEdit(p)} style={{color:'var(--color-text-muted)', background:'transparent', border:'none', cursor:'pointer'}}><Pencil width={14} /></button>
                  <button onClick={() => deletePrinciple(p.id)} style={{color:'var(--color-error)', background:'transparent', border:'none', cursor:'pointer'}}><Trash2 width={14} /></button>
                </div>
              </div>
              <div className="principle-source"><LinkIcon style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />Sumber: {p.source || '—'}</div>
              {p.notes && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface-offset)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>{p.notes}</div>}
              <div className="principle-actions">
                <span className={`badge ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(p)} style={{ marginLeft: 'auto' }}>Ganti Status</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Prinsip' : 'Tambah Prinsip Hidup'}</h3>
              <button className="btn-ghost" style={{ border:'none', padding:0 }} onClick={() => setModalOpen(false)}><X width={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Prinsip</label><textarea className="form-input form-textarea" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} style={{ minHeight: 60 }} /></div>
              <div className="form-group"><label className="form-label">Dari Mana Asalnya?</label><input type="text" className="form-input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="untested">⚠ Belum Diuji</option>
                  <option value="tested">✓ Sudah Diuji</option>
                  <option value="shattered">✗ Pernah Hancur</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Catatan</label><textarea className="form-input form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 60 }} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={savePrinciple}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
