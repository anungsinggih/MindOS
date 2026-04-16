import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, X, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Journal({ session }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    situasi: '', pikiran: '', buktiD: '', buktiE: '', alternatif: '', tindakan: '', tag: '', zeigarnik: '',
    emotions: { Cemas: 0, Frustrasi: 0, 'Putus asa': 0, Malu: 0, Marah: 0 }
  });

  const fetchData = async () => {
    const { data } = await supabase.from('journal').select('*').order('created_at', { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const saveEntry = async () => {
    if (!form.situasi.trim()) { toast.error('Isi situasi'); return; }
    if (!form.zeigarnik.trim()) { toast.error('Satu hal yang belum diuji wajib diisi (Zeigarnik)!'); return; }
    
    const payload = {
      situasi: form.situasi, pikiran: form.pikiran, buktiD: form.buktiD, buktiE: form.buktiE,
      alternatif: form.alternatif, tindakan: form.tindakan, tag: form.tag, emotions: form.emotions,
      user_id: session.user.id
    };

    if (editingId) {
      const { error } = await supabase.from('journal').update(payload).eq('id', editingId);
      if (error) { console.error(error); toast.error('Error: ' + error.message); return; }
      toast.success('Jurnal diperbarui');
    } else {
      payload.date = new Date().toISOString();
      const { error } = await supabase.from('journal').insert([payload]);
      if (error) { console.error(error); toast.error('Error: ' + error.message); return; }
      toast.success('Jurnal disimpan');
    }
    
    if (form.zeigarnik.trim()) {
      await supabase.from('action_queue').insert([{ question: form.zeigarnik, user_id: session.user.id }]);
    }
    
    setModalOpen(false);
    fetchData();
  };

  const deleteEntry = async (id, isViewModal = false) => {
    if (!window.confirm("Yakin ingin menghapus entri ini?")) return;
    const { error } = await supabase.from('journal').delete().eq('id', id);
    if (error) { toast.error("Gagal menghapus: " + error.message); return; }
    toast.success('Entri dihapus');
    if (isViewModal) setViewEntry(null);
    fetchData();
  };

  const startEdit = (entry) => {
    setViewEntry(null);
    setEditingId(entry.id);
    setForm({
      situasi: entry.situasi || '', pikiran: entry.pikiran || '', buktiD: entry.buktiD || '', 
      buktiE: entry.buktiE || '', alternatif: entry.alternatif || '', tindakan: entry.tindakan || '', 
      tag: entry.tag || '', zeigarnik: '', emotions: entry.emotions || { Cemas: 0, Frustrasi: 0, 'Putus asa': 0, Malu: 0, Marah: 0 }
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ situasi: '', pikiran: '', buktiD: '', buktiE: '', alternatif: '', tindakan: '', tag: '', zeigarnik: '', emotions: { Cemas: 0, Frustrasi: 0, 'Putus asa': 0, Malu: 0, Marah: 0 } });
  };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Jurnal Pikiran</h2>
          <p className="section-sub">Identifikasi, uji, dan restrukturisasi pikiran otomatismu</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Entri Baru
        </button>
      </div>

      {loading ? <p>Loading...</p> : !entries.length ? (
        <div className="empty-state">
          <BookOpen style={{ width: 48, height: 48, color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }} />
          <h3>Belum Ada Entri</h3>
          <p>Rekam pikiran otomatis pertamamu dan mulai proses restrukturisasi kognitif.</p>
        </div>
      ) : (
        <div>
          {entries.map(e => {
            const vals = Object.values(e.emotions || {});
            const avgEmo = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            const emoColor = avgEmo >= 7 ? 'var(--color-error)' : avgEmo >= 4 ? 'var(--color-warning)' : 'var(--color-success)';

            return (
              <div key={e.id} className="entry-item" onClick={() => setViewEntry(e)}>
                <div className="entry-meta">
                  <span className="entry-date">{new Date(e.created_at).toLocaleDateString()}</span>
                  {e.tag?.split(',').map((t, i) => t.trim() ? <span key={i} className="badge badge-primary" style={{marginLeft: 4}}>{t.trim()}</span> : null)}
                </div>
                <div className="entry-situation">{e.situasi}</div>
                <div className="entry-thought">"{e.pikiran}"</div>
                <div className="entry-footer">
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>Avg emosi: <span style={{ color: emoColor, fontWeight: 700 }}>{avgEmo.toFixed(1)}/10</span></span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>{e.tindakan ? '✓ Ada tindakan konkret' : '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Jurnal' : 'Jurnal Pikiran — Thought Record'}</h3>
              <button className="btn-ghost" style={{ border:'none', padding:0 }} onClick={() => setModalOpen(false)}><X width={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">A — Situasi</label><textarea className="form-input form-textarea" value={form.situasi} onChange={e => setForm({ ...form, situasi: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">B — Pikiran Otomatis</label><textarea className="form-input form-textarea" value={form.pikiran} onChange={e => setForm({ ...form, pikiran: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">C — Emosi</label>
                {Object.keys(form.emotions).map(emo => (
                  <div key={emo} className="emotion-row">
                    <span className="emotion-name">{emo}</span>
                    <input type="range" className="emotion-slider" min="0" max="10" value={form.emotions[emo]} onChange={e => setForm({ ...form, emotions: { ...form.emotions, [emo]: parseInt(e.target.value) } })} />
                    <span className="emotion-score">{form.emotions[emo]}</span>
                  </div>
                ))}
              </div>
              <div className="form-group"><label className="form-label">D — Bukti Mendukung</label><textarea className="form-input form-textarea" value={form.buktiD} onChange={e => setForm({ ...form, buktiD: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">E — Bukti Menentang</label><textarea className="form-input form-textarea" value={form.buktiE} onChange={e => setForm({ ...form, buktiE: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">F — Pikiran Alternatif</label><textarea className="form-input form-textarea" value={form.alternatif} onChange={e => setForm({ ...form, alternatif: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">H — Tindakan Konkret</label><input type="text" className="form-input" value={form.tindakan} onChange={e => setForm({ ...form, tindakan: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Tag Tema</label><input type="text" className="form-input" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} /></div>
              
              <div className="form-group" style={{ background: 'var(--color-primary-highlight)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-6)', border: '1px solid var(--color-primary)' }}>
                <label className="form-label" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pencil width={16} /> Z — Zeigarnik Hook <span style={{ color: 'var(--color-error)' }}>*Wajib</span>
                </label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>Tinggalkan satu pertanyaan/aksi menggantung dari jurnal ini untuk Action Queue (Zeigarnik Effect).</p>
                <textarea 
                  className="form-input form-textarea" 
                  required
                  placeholder="Satu hal yang belum aku uji dari diskusi ini adalah..." 
                  value={form.zeigarnik} 
                  onChange={e => setForm({ ...form, zeigarnik: e.target.value })} 
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-primary)' }} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveEntry}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {viewEntry && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setViewEntry(null) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Detail Jurnal</h3>
              <div style={{display:'flex',gap:'8px'}}>
                <button className="btn-ghost" style={{ border:'none', padding:4 }} onClick={() => startEdit(viewEntry)}><Pencil width={18} /></button>
                <button className="btn-ghost" style={{ border:'none', padding:4, color:'var(--color-error)' }} onClick={() => deleteEntry(viewEntry.id, true)}><Trash2 width={18} /></button>
                <button className="btn-ghost" style={{ border:'none', padding:4 }} onClick={() => setViewEntry(null)}><X width={20} /></button>
              </div>
            </div>
            <div className="modal-body">
              <div className="form-group"><div className="form-label">A — Situasi</div><div style={{ background: 'var(--color-surface-offset)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>{viewEntry.situasi}</div></div>
              <div className="form-group"><div className="form-label">B — Pikiran</div><div style={{ background: 'var(--color-error-highlight)', color: 'var(--color-error)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>{viewEntry.pikiran}</div></div>
              <div className="form-group"><div className="form-label">C — Emosi</div>
                {Object.entries(viewEntry.emotions || {}).map(([emo, val]) => (
                  <div key={emo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', padding: 'var(--space-1) 0' }}><span>{emo}</span><strong style={{ color: 'var(--color-primary)' }}>{val}/10</strong></div>
                ))}
              </div>
              <div className="form-group"><div className="form-label">D — Bukti Mendukung</div><div style={{ background: 'var(--color-surface-offset)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>{viewEntry.buktiD || '—'}</div></div>
              <div className="form-group"><div className="form-label">E — Bukti Menentang</div><div style={{ background: 'var(--color-success-highlight)', color: 'var(--color-success)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>{viewEntry.buktiE || '—'}</div></div>
              <div className="form-group"><div className="form-label">F — Pikiran Alternatif</div><div style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>{viewEntry.alternatif || '—'}</div></div>
              {viewEntry.tindakan && <div className="form-group"><div className="form-label">H — Tindakan</div><div style={{ background: 'var(--color-surface-offset)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>{viewEntry.tindakan}</div></div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewEntry(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
