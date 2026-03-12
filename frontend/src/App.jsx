import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import AdsPage from './pages/AdsPage';
import Ranking from './pages/Ranking';
import HomePage from './pages/HomePage';
import XAdsDashboard from './pages/x/XAdsDashboard';
import XAdsRanking from './pages/x/XAdsRanking';
import XAdsPage from './pages/x/XAdsPage';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Meta Routes */}
            <Route path="/meta/dashboard" element={<Dashboard />} />
            <Route path="/meta/ranking" element={<Ranking />} />
            <Route path="/meta/campaigns" element={<Campaigns />} />
            <Route path="/meta/campaign/:id" element={<CampaignDetail />} />
            <Route path="/meta/ads" element={<AdsPage />} />

            {/* X Routes */}
            <Route path="/x/dashboard" element={<XAdsDashboard />} />
            <Route path="/x/ranking" element={<XAdsRanking />} />
            <Route path="/x/ads" element={<XAdsPage />} />

            {/* Legacy redirect for bookmarks */}
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/ads" element={<AdsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;