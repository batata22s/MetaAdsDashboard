import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiTrendingUp, FiImage, FiAward, FiGlobe } from 'react-icons/fi';

function Sidebar() {
  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div className="sidebar-logo">
        <img src="/images/Favicon_Light.png" alt="Triadmarkets" style={{ width: 64, height: 64, marginRight: 8 }} />
        <h1>
          Triadmarkets
          <span style={{ fontSize: '12px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Omnichannel</span>
        </h1>
      </div>
      <nav className="sidebar-nav" style={{ paddingBottom: '30px' }}>

        <div style={{ padding: '0 24px', fontSize: '10px', textTransform: 'uppercase', color: '#8A8C99', marginTop: '20px', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
          Workspace
        </div>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
          <FiGlobe /> Visão Global
        </NavLink>

        <div style={{ padding: '0 24px', fontSize: '10px', textTransform: 'uppercase', color: '#8A8C99', marginTop: '24px', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
          Meta Ads
        </div>
        <NavLink to="/meta/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiBarChart2 /> Dashboard
        </NavLink>
        <NavLink to="/meta/ranking" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiAward /> Top Ranking
        </NavLink>
        <NavLink to="/meta/campaigns" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiTrendingUp /> Campanhas
        </NavLink>
        <NavLink to="/meta/ads" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiImage /> Anúncios
        </NavLink>

        <div style={{ padding: '0 24px', fontSize: '10px', textTransform: 'uppercase', color: '#8A8C99', marginTop: '24px', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
          X (Twitter) Ads
        </div>
        <NavLink to="/x/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiBarChart2 /> Dashboard
        </NavLink>
        <NavLink to="/x/ranking" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiAward /> Ranking
        </NavLink>
        <NavLink to="/x/ads" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiImage /> Anúncios
        </NavLink>

      </nav>
    </aside>
  );
}

export default Sidebar;