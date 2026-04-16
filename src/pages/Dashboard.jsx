import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { BookOpen, ShieldCheck, Lightbulb, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [stats, setStats] = useState({ journal: 0, principles: 0, concepts: 0, spiral: 0 });
  const [recentJournal, setRecentJournal] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dailyNote, setDailyNote] = useState(localStorage.getItem('mindos_daily') || '');
  const [actionQueue, setActionQueue] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [j, p, c, s] = await Promise.all([
        supabase.from('journal').select('*', { count: 'exact', head: true }),
        supabase.from('principles').select('*', { count: 'exact', head: true }),
        supabase.from('concepts').select('*', { count: 'exact', head: true }),
        supabase.from('spiral').select('*', { count: 'exact', head: true })
      ]);
      setStats({
        journal: j.count || 0,
        principles: p.count || 0,
        concepts: c.count || 0,
        spiral: s.count || 0
      });

      const { data: recentJ } = await supabase.from('journal').select('*').order('created_at', { ascending: false }).limit(7);
      if (recentJ) setRecentJournal(recentJ.reverse());

      const { data: queue } = await supabase.from('action_queue').select('*').eq('is_tested', false).order('created_at', { ascending: true });
      if (queue) setActionQueue(queue);

      const { data: lj } = await supabase.from('journal').select('id, created_at, situasi').order('created_at', { ascending: false }).limit(5);
      const { data: lp } = await supabase.from('principles').select('id, created_at, text').order('created_at', { ascending: false }).limit(5);
      const { data: lc } = await supabase.from('concepts').select('id, created_at, name').order('created_at', { ascending: false }).limit(5);
      const { data: ls } = await supabase.from('spiral').select('id, created_at, insight').order('created_at', { ascending: false }).limit(5);

      const allAct = [
        ...(lj || []).map(x => ({ type: 'journal', icon: BookOpen, color: 'var(--color-primary)', date: x.created_at, text: x.situasi?.slice(0,60)+'...' })),
        ...(lp || []).map(x => ({ type: 'principle', icon: ShieldCheck, color: 'var(--color-success)', date: x.created_at, text: x.text?.slice(0,60) })),
        ...(lc || []).map(x => ({ type: 'concept', icon: Lightbulb, color: 'var(--color-gold)', date: x.created_at, text: x.name })),
        ...(ls || []).map(x => ({ type: 'spiral', icon: TrendingUp, color: 'var(--color-orange)', date: x.created_at, text: x.insight?.slice(0,60)+'...' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setActivities(allAct);
    }
    fetchData();
  }, []);

  const saveDailyNote = () => {
    localStorage.setItem('mindos_daily', dailyNote);
    toast.success('Catatan harian berhasil disimpan');
  };

  const markTested = async (id) => {
    const { error } = await supabase.from('action_queue').update({ is_tested: true }).eq('id', id);
    if (!error) {
      toast.success('Aksi berhasil ditandai selesai! ✓');
      setActionQueue(prev => prev.filter(q => q.id !== id));
    } else {
      toast.error('Gagal memperbarui status');
    }
  };

  const chartData = {
    labels: recentJournal.length ? recentJournal.map((_,i) => `Entri ${i+1}`) : ['—'],
    datasets: [{
      label: 'Rata-rata Intensitas',
      data: recentJournal.length ? recentJournal.map(e => {
        const vals = Object.values(e.emotions || {});
        return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : 0;
      }) : [0],
      borderColor: '#4f98a3',
      backgroundColor: 'rgba(79, 152, 163, 0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#4f98a3'
    }]
  };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-label">Jurnal Pikiran</div><div className="kpi-value">{stats.journal}</div><div className="kpi-sub">Total entri</div></div>
        <div className="kpi-card"><div className="kpi-label">Prinsip Hidup</div><div className="kpi-value">{stats.principles}</div><div className="kpi-sub">Terdokumentasi</div></div>
        <div className="kpi-card"><div className="kpi-label">Konsep Dipelajari</div><div className="kpi-value">{stats.concepts}</div><div className="kpi-sub">Total konsep</div></div>
        <div className="kpi-card"><div className="kpi-label">Growth Insight</div><div className="kpi-value">{stats.spiral}</div><div className="kpi-sub">Log mingguan</div></div>
      </div>

      {actionQueue.length > 0 && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 90, background: 'var(--color-orange)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', border: '1px solid var(--color-orange)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Lightbulb style={{ color: '#fff', width: 22, height: 22 }} />
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 'var(--text-lg)' }}>Pending Action</span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--space-4)' }}>Hal yang harus kamu buktikan hari ini agar Zeigarnik Effect memudar:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '180px', overflowY: 'auto' }}>
            {actionQueue.map(q => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'space-between', background: 'var(--color-surface)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, flex: 1, minWidth: '180px', color: 'var(--color-text)' }}>{q.question}</span>
                <button className="btn btn-sm" style={{ background: 'var(--color-primary)', color: '#fff' }} onClick={() => markTested(q.id)}>Tandai Selesai ✓</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-title">Tren Emosi</div>
          <div className="card-subtitle">Rata-rata intensitas dari entri jurnal</div>
          <div style={{ height: '160px' }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Aktivitas Terkini</div>
          <div className="card-subtitle">5 entri terakhir di semua modul</div>
          <div>
            {!activities.length ? <div style={{ textAlign:'center', color:'var(--color-text-faint)', padding:'var(--space-8)' }}>Belum ada aktivitas</div> : activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'var(--space-3)', padding:'var(--space-3) 0', borderBottom:'1px solid var(--color-divider)' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:`color-mix(in srgb, ${a.color} 15%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon style={{ width:14, height:14, color:a.color }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'var(--text-sm)', color:'var(--color-text)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', wordBreak:'break-word' }}>{a.text}</p>
                    <p style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:2 }}>{new Date(a.date).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Catatan Hari Ini</div>
        <div className="card-subtitle">Mulai hari dengan satu refleksi kecil</div>
        <textarea className="form-input form-textarea" value={dailyNote} onChange={e => setDailyNote(e.target.value)} placeholder="Hari ini aku menyadari bahwa..." style={{ minHeight: '100px' }}></textarea>
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={saveDailyNote}>Simpan Catatan</button>
        </div>
      </div>
    </div>
  );
}
