const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BASE = 'https://graph.facebook.com/v21.0';

async function test() {
    console.log('--- Listing all accessible Ad Accounts ---\n');
    try {
        const r = await axios.get(`${BASE}/me/adaccounts`, {
            params: {
                fields: 'name,account_id,balance,amount_spent,currency,is_prepay_account,funding_source_details',
                access_token: TOKEN
            }
        });
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('Error:', e.response?.data?.error?.message || e.message);
    }
}

test().catch(console.error);
