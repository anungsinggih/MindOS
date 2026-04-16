import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShieldCheck, Lightbulb, TrendingUp, Moon, Sun, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const navs = [
    { section: 'Utama' },
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/journal', label: 'Jurnal Pikiran', icon: BookOpen },
    { section: 'Perpustakaan' },
    { path: '/principles', label: 'Prinsip Hidup', icon: ShieldCheck },
    { path: '/concepts', label: 'Konsep & Ilmu', icon: Lightbulb },
    { section: 'Progress' },
    { path: '/spiral', label: 'Growth Spiral', icon: TrendingUp },
  ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <svg className="logo-icon" viewBox="0 0 32 32" fill="none" aria-label="MindOS Logo">
          <circle cx="16" cy="16" r="14" stroke="var(--color-primary)" strokeWidth="2"/>
          <circle cx="16" cy="10" r="3.5" fill="var(--color-primary)"/>
          <path d="M8 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="10" cy="18" r="2" fill="var(--color-primary)" opacity="0.4"/>
          <circle cx="22" cy="18" r="2" fill="var(--color-primary)" opacity="0.4"/>
        </svg>
        <div>
          <div className="logo-text">MindOS</div>
          <div className="logo-tagline">Cognitive Restructuring</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navs.map((n, i) => {
          if (n.section) return <div key={i} className="nav-section-label">{n.section}</div>;
          const Icon = n.icon;
          const isActive = location.pathname === n.path;
          return (
            <Link key={i} to={n.path} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <Icon style={{width: 18, height: 18}} /> {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={() => supabase.auth.signOut()} title="Logout" style={{marginRight: 'auto'}}>
          <LogOut style={{width: 16, height: 16}} />
        </button>
        <span style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)'}}>v1.0</span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Ganti tema">
          {theme === 'dark' ? <Moon style={{width: 16, height: 16}} /> : <Sun style={{width: 16, height: 16}} />}
        </button>
      </div>
    </aside>
  );
}
