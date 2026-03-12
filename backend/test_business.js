const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BUSINESS_ID = '3944331125782785';
const BASE = 'https://graph.facebook.com/v21.0';

async function testBusiness() {
    console.log(`--- Probing Business: ${BUSINESS_ID} ---\n`);

    try {
        const r = await axios.get(`${BASE}/${BUSINESS_ID}`, {
            params: {
                fields: 'name,extended_credit_info,payment_account_id,primary_ad_account',
                access_token: TOKEN
            }
        });
        console.log('Business Details:');
        console.log(JSON.stringify(r.data, null, 2));

        if (r.data.extended_credit_info) {
            console.log('\n--- Probing Extended Credits ---');
            // Often there is an edge for extended_credits
            const ec = await axios.get(`${BASE}/${BUSINESS_ID}/extended_credits`, {
                params: { fields: 'credit_available,credit_limit,currency,id,partition_settings', access_token: TOKEN }
            });
            console.log(JSON.stringify(ec.data, null, 2));
        }
    } catch (e) {
        console.log('Error:', e.response?.data?.error?.message || e.message);
    }
}

testBusiness().catch(console.error);
