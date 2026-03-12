const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = 'act_2222669441583363';
const BASE = 'https://graph.facebook.com/v21.0';

async function testCreditsField() {
    console.log('--- Testing Ad Credits Field ---\n');

    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: 'name,ad_credits,balance,amount_spent,is_prepay_account',
                access_token: TOKEN
            }
        });
        console.log('[SUCCESS]:');
        console.log(JSON.stringify(r.data, null, 2));

        if (JSON.stringify(r.data).includes('21923')) console.log('!!! FOUND 21923 !!!');

    } catch (e) {
        console.log('[FAILED]:', e.response?.data?.error?.message || e.message);
    }
}

testCreditsField().catch(console.error);
