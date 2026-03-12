const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function testFunding() {
    console.log('--- Probing All Funding Sources ---\n');

    try {
        // Try to list funding sources
        const r = await axios.get(`${BASE}/${ACCOUNT}/funding_sources`, {
            params: { access_token: TOKEN }
        });
        console.log('1. Funding Sources Edge:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('1. Error Edge:', e.response?.data?.error?.message || e.message);
    }

    try {
        // Try to get payment details specifically for Brazil PIX if relevant
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: 'all_payment_methods{id,display_string,type,current_balance}',
                access_token: TOKEN
            }
        });
        console.log('\n2. All Payment Methods (Field):');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('\n2. Error Field:', e.response?.data?.error?.message || e.message);
    }
}

testFunding().catch(console.error);
