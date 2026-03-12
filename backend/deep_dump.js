const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BASE = 'https://graph.facebook.com/v21.0';

async function deepDump() {
    console.log('--- Deep Dump /me Search ---\n');

    try {
        const r = await axios.get(`${BASE}/me`, {
            params: {
                fields: 'id,name,businesses{id,name,extended_credit_info,payment_account_id},adaccounts{id,name,balance,amount_spent,currency,is_prepay_account,funding_source_details}',
                access_token: TOKEN
            }
        });

        console.log('[SUCCESS] Dump /me:');
        console.log(JSON.stringify(r.data, null, 2));

        const dump = JSON.stringify(r.data);
        if (dump.includes('21923')) console.log('!!! FOUND 21923 IN RAW DUMP !!!');
        if (dump.includes('250000')) console.log('!!! FOUND 250000 IN RAW DUMP !!!');

    } catch (e) {
        console.log('[FAILED] Dump /me:', e.response?.data?.error?.message || e.message);
    }
}

deepDump().catch(console.error);
