const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;

async function testEdge() {
    try {
        const r = await axios.get(`https://graph.facebook.com/v21.0/${ACCOUNT}/extended_credits`, {
            params: { access_token: TOKEN }
        });
        console.log('--- extended_credits Edge ---\n');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('Error:', e.response?.data?.error?.message || e.message);
    }
}

testEdge().catch(console.error);
