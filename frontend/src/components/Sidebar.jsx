import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiTrendingUp, FiImage } from 'react-icons/fi';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/images/Favicon Dark.png" alt="Triadmarkets" style={{ width: 36, height: 36, filter: 'invert(1)' }} />
        <h1>
          Triadmarkets
          <span>Meta Ads</span>
        </h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
          <FiBarChart2 /> Visao Geral
        </NavLink>
        <NavLink to="/campaigns" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiTrendingUp /> Campanhas
        </NavLink>
        <NavLink to="/ads" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiImage /> Anuncios
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;