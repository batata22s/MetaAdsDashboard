const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = 'act_2222669441583363';
const BASE = 'https://graph.facebook.com/v21.0';

async function probeObscureEdges() {
    console.log('--- Probing Obscure Financial Edges ---\n');

    const probes = [
        { label: 'Payment Orders', path: `${ACCOUNT}/payment_orders` },
        { label: 'Ads Payment Cycle', path: `${ACCOUNT}/adspaymentcycle` },
        { label: 'Funding Transactions', path: `${ACCOUNT}/funding_transactions` },
        { label: 'Ad Transactions', path: `${ACCOUNT}/ad_transactions` },
        { label: 'Ad Credits (v20.0)', path: `v20.0/${ACCOUNT}/ad_credits` },
        { label: 'Prepaid Balances (v20.0)', path: `v20.0/${ACCOUNT}/prepaid_balances` }
    ];

    for (const p of probes) {
        try {
            console.log(`\nTesting ${p.label}...`);
            const r = await axios.get(`https://graph.facebook.com/${p.path.startsWith('v') ? p.path : 'v21.0/' + p.path}`, {
                params: { access_token: TOKEN }
            });
            console.log(`[SUCCESS]`, JSON.stringify(r.data, null, 2));
            const str = JSON.stringify(r.data);
            if (str.includes('21923')) console.log('!!! FOUND 219,23 !!!');
            if (str.includes('250000')) console.log('!!! FOUND 2.500,00 (Pending PIX) !!!');
        } catch (e) {
            console.log(`[FAILED]`, e.response?.data?.error?.message || e.message);
        }
    }
}

probeObscureEdges().catch(console.error);
