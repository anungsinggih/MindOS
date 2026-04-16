import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Principles from './pages/Principles';
import Concepts from './pages/Concepts';
import Spiral from './pages/Spiral';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', maxWidth: '400px' } }} />
      <div className="app">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="main-content">
          <Topbar setSidebarOpen={setSidebarOpen} />
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/journal" element={<Journal session={session} />} />
            <Route path="/principles" element={<Principles session={session} />} />
            <Route path="/concepts" element={<Concepts session={session} />} />
            <Route path="/spiral" element={<Spiral session={session} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
