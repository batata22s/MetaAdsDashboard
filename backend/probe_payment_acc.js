const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const PAYMENT_ACC = '1934212207322471';
const BASE = 'https://graph.facebook.com/v21.0';

async function probePaymentAccount() {
    console.log(`--- Probing Payment Account: ${PAYMENT_ACC} ---\n`);

    try {
        const r = await axios.get(`${BASE}/${PAYMENT_ACC}`, {
            params: {
                fields: 'id,name,balance,amount_spent,currency,is_prepay_account,current_balance,spend_cap',
                access_token: TOKEN
            }
        });
        console.log('[SUCCESS] Payment Account Data:');
        console.log(JSON.stringify(r.data, null, 2));

        if (JSON.stringify(r.data).includes('21923')) console.log('!!! FOUND 21923 !!!');

    } catch (e) {
        console.log('[FAILED]:', e.response?.data?.error?.message || e.message);

        // Try to treat it as a different object type if act_ prefix is needed
        try {
            const r2 = await axios.get(`${BASE}/act_${PAYMENT_ACC}`, {
                params: { fields: 'name,balance,amount_spent', access_token: TOKEN }
            });
            console.log('[SUCCESS] As act_ account:');
            console.log(JSON.stringify(r2.data, null, 2));
        } catch (e2) { }
    }
}

probePaymentAccount().catch(console.error);
