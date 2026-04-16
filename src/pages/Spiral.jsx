import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Zap, Plus, X, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Spiral({ session }) {
  const [spiral, setSpiral] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ insight: '', delta: '' });

  const fetchData = async () => {
    const { data } = await supabase.from('spiral').select('*').order('created_at', { ascending: false });
    if (data) setSpiral(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const saveSpiralEntry = async () => {
    if (!form.insight.trim()) { toast.error('Isi insight terlebih dahulu'); return; }
    
    if (editingId) {
      const { error } = await supabase.from('spiral').update({
        insight: form.insight, delta: form.delta
      }).eq('id', editingId);
      if (error) { toast.error('Error: ' + error.message); return; }
      toast.success('Insight diperbarui');
    } else {
      const { error } = await supabase.from('spiral').insert([{
        ...form, user_id: session.user.id, date: new Date().toISOString()
      }]);
      if (error) { toast.error('Error: ' + error.message); return; }
      toast.success('Insight dicatat');
    }
    setModalOpen(false);
    fetchData();
  };

  const deleteSpiralEntry = async (id) => {
    if (!window.confirm("Yakin ingin menghapus insight spiral ini?")) return;
    const { error } = await supabase.from('spiral').delete().eq('id', id);
    if (error) { toast.error("Gagal menghapus: " + error.message); return; }
    toast.success('Insight dihapus');
    fetchData();
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({ insight: s.insight || '', delta: s.delta || '' });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ insight: '', delta: '' });
  };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Growth Spiral</h2>
          <p className="section-sub">Bukti bahwa kamu tidak looping — kamu spiraling upward</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Log Insight
        </button>
      </div>

      {loading ? <p>Loading...</p> : !spiral.length ? (
        <div className="empty-state">
          <TrendingUp style={{ width: 48, height: 48, color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }} />
          <h3>Spiral Masih Kosong</h3>
          <p>Catat satu insight setiap minggu — ini yang akan membuktikan bahwa kamu tidak looping.</p>
        </div>
      ) : (
        <div>
          {spiral.map((s, i) => (
            <div key={s.id} className="spiral-item">
              <div className="spiral-dot"><Zap style={{ width: 16, height: 16 }} /></div>
              <div className="spiral-content">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 'var(--space-1)'}}>
                  <div className="spiral-date" style={{marginBottom: 0}}>{new Date(s.created_at).toLocaleDateString()} · Insight #{spiral.length - i}</div>
                  <div style={{display:'flex', gap: 8}}>
                    <button onClick={() => startEdit(s)} style={{color:'var(--color-text-muted)', background:'transparent', border:'none', cursor:'pointer'}}><Pencil width={14} /></button>
                    <button onClick={() => deleteSpiralEntry(s.id)} style={{color:'var(--color-error)', background:'transparent', border:'none', cursor:'pointer'}}><Trash2 width={14} /></button>
                  </div>
                </div>
                <div className="spiral-insight">{s.insight}</div>
                {s.delta && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-2)', paddingLeft: 'var(--space-1)' }}>↳ {s.delta}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Growth Insight' : 'Log Growth Insight'}</h3>
              <button className="btn-ghost" style={{ border:'none', padding:0 }} onClick={() => setModalOpen(false)}><X width={20} /></button>
            </div>
            <div className="modal-body">
              {!editingId && (
                <div style={{ background: 'var(--color-primary-highlight)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-5)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontStyle: 'italic' }}>"Minggu ini aku memahami bahwa..."</p>
                </div>
              )}
              <div className="form-group"><label className="form-label">Insight Minggu Ini</label><textarea className="form-input form-textarea" value={form.insight} onChange={e => setForm({ ...form, insight: e.target.value })} style={{ minHeight: 120 }} /></div>
              <div className="form-group"><label className="form-label">Apa yang Berubah dari Cara Berpikirku?</label><textarea className="form-input form-textarea" value={form.delta} onChange={e => setForm({ ...form, delta: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveSpiralEntry}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
