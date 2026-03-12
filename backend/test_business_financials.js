const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BUSINESS_ID = '3944331125782785';
const BASE = 'https://graph.facebook.com/v21.0';

async function testBusinessFinancials() {
    console.log(`--- Probing Business Financials: ${BUSINESS_ID} ---\n`);

    const edges = [
        'ad_payment_details',
        'payment_methods',
        'extended_credits',
        'business_payment_methods',
        'client_ad_accounts',
        'owned_ad_accounts'
    ];

    for (const edge of edges) {
        try {
            console.log(`\nTesting: /${BUSINESS_ID}/${edge}`);
            const r = await axios.get(`${BASE}/${BUSINESS_ID}/${edge}`, {
                params: { access_token: TOKEN }
            });
            console.log(`[SUCCESS] /${edge}:`, JSON.stringify(r.data, null, 2));
            const str = JSON.stringify(r.data);
            if (str.includes('21923')) console.log('!!! FOUND 21923 !!!');
        } catch (e) {
            console.log(`[ERROR] /${edge}:`, e.response?.data?.error?.message || e.message);
        }
    }
}

testBusinessFinancials().catch(console.error);
