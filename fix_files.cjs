const fs = require('fs');
const path = require('path');

// Fix frontend package.json
fs.writeFileSync('c:/Users/homid/MetaAdsDashboard/frontend/package.json', JSON.stringify({
    name: "meta-ads-dashboard",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
    dependencies: {
        axios: "^1.7.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
        "react-router-dom": "^6.23.0",
        recharts: "^2.12.0",
        "react-icons": "^5.2.0"
    },
    devDependencies: {
        "@types/react": "^18.3.0",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.0",
        vite: "^5.4.0"
    }
}, null, 2));
console.log('Fixed frontend/package.json');

// Fix backend package.json
fs.writeFileSync('c:/Users/homid/MetaAdsDashboard/backend/package.json', JSON.stringify({
    name: "meta-ads-dashboard-backend",
    version: "1.0.0",
    description: "Backend proxy for Meta Ads Dashboard",
    main: "src/index.js",
    scripts: { dev: "node --watch src/index.js", start: "node src/index.js" },
    dependencies: {
        axios: "^1.7.0",
        cors: "^2.8.5",
        dotenv: "^16.4.0",
        express: "^4.18.0"
    }
}, null, 2));
console.log('Fixed backend/package.json');

// Fix vite.config.js
fs.writeFileSync('c:/Users/homid/MetaAdsDashboard/frontend/vite.config.js',
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
`);
console.log('Fixed frontend/vite.config.js');

// Fix all other files that had first character stripped
const filesToFix = [
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/main.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/App.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/services/api.js', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/components/Sidebar.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/components/KpiCard.jsx', firstChar: 'f' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/components/DateFilter.jsx', firstChar: 'c' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/components/Charts.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/components/CampaignTable.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/pages/Dashboard.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/pages/CampaignDetail.jsx', firstChar: 'i' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/index.html', firstChar: '<' },
    { path: 'c:/Users/homid/MetaAdsDashboard/frontend/src/index.css', firstChar: '*' },
    { path: 'c:/Users/homid/MetaAdsDashboard/backend/src/index.js', firstChar: 'r' },
    { path: 'c:/Users/homid/MetaAdsDashboard/backend/src/routes/meta.js', firstChar: 'c' },
    { path: 'c:/Users/homid/MetaAdsDashboard/backend/src/services/metaApi.js', firstChar: 'c' },
    { path: 'c:/Users/homid/MetaAdsDashboard/backend/src/services/mockData.js', firstChar: '/' },
    { path: 'c:/Users/homid/MetaAdsDashboard/backend/.env', firstChar: 'M' },
];

filesToFix.forEach(({ path: filePath, firstChar }) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check if first char is missing by checking expected patterns
        const expectedStarts = {
            'i': ['import ', 'import{'],
            'f': ['function '],
            'c': ['const '],
            '<': ['<!DOCTYPE', '<html'],
            '*': ['*, *::'],
            'r': ['require('],
            '/': ['// Mock'],
            'M': ['META_'],
        };
        const possibleStarts = expectedStarts[firstChar] || [];
        const needsFix = possibleStarts.some(s => !content.startsWith(s) && content.startsWith(s.substring(1)));

        if (needsFix) {
            fs.writeFileSync(filePath, firstChar + content);
            console.log('Fixed: ' + path.basename(filePath));
        } else {
            console.log('OK: ' + path.basename(filePath));
        }
    } catch (e) {
        console.log('Error with ' + filePath + ': ' + e.message);
    }
});

console.log('\nAll files fixed!');
