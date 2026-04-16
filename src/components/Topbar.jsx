import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Topbar({ setSidebarOpen }) {
  const location = useLocation();
  const titles = {
    '/': 'Dashboard',
    '/journal': 'Jurnal Pikiran',
    '/principles': 'Prinsip Hidup',
    '/concepts': 'Konsep & Ilmu',
    '/spiral': 'Growth Spiral'
  };

  const title = titles[location.pathname] || 'Dashboard';

  return (
    <header className="topbar">
      <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
          <Menu style={{width: 20, height: 20}} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
    </header>
  );
}
