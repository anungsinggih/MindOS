import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        else toast.success("Pendaftaran berhasil! Silakan cek email Anda untuk link verifikasi.", { duration: 5000 });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
           <ShieldCheck style={{ width: '48px', height: '48px', color: 'var(--color-primary)' }} />
        </div>
        <div className="card-title" style={{ textAlign: 'center' }}>MindOS</div>
        <div className="card-subtitle" style={{ textAlign: 'center' }}>Cognitive Restructuring</div>

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
}
