const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const PAYMENT_ACC = '1934212207322471';
const BASE = 'https://graph.facebook.com/v21.0';

async function deepProbe() {
    console.log('--- Deep Probe Stage 2 ---\n');

    // 1. Try Payment Account as act_ account
    try {
        console.log(`Testing: act_${PAYMENT_ACC}`);
        const r = await axios.get(`${BASE}/act_${PAYMENT_ACC}`, {
            params: { fields: 'name,balance,amount_spent,spend_cap,is_prepay_account', access_token: TOKEN }
        });
        console.log('[SUCCESS] act_ account data:', JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('[FAILED] act_ account:', e.response?.data?.error?.message);
    }

    // 2. Check /me for payment methods
    try {
        console.log('\nTesting: /me?fields=all_payment_methods');
        const r = await axios.get(`${BASE}/me`, {
            params: { fields: 'all_payment_methods{id,display_string,type,current_balance}', access_token: TOKEN }
        });
        console.log('[SUCCESS] /me payment methods:', JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('[FAILED] /me payment methods:', e.response?.data?.error?.message);
    }

    // 3. Try specifically for current_balance on the Ad Account
    const ACC_ID = 'act_2222669441583363';
    try {
        console.log(`\nTesting: /${ACC_ID}?fields=current_unbilled_spend,min_billing_threshold`);
        const r = await axios.get(`${BASE}/${ACC_ID}`, {
            params: { fields: 'current_unbilled_spend,min_billing_threshold', access_token: TOKEN }
        });
        console.log('[SUCCESS] Unbilled/Threshold:', JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('[FAILED] Unbilled/Threshold:', e.response?.data?.error?.message);
    }
}

deepProbe().catch(console.error);
