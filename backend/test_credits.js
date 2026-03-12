const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BUSINESS_ID = '3944331125782785';
const BASE = 'https://graph.facebook.com/v21.0';

async function testCredits() {
    console.log('--- Probing Credits & Specific Connections ---\n');

    // 1. Ad Credits Edge
    try {
        console.log(`Testing: /${ACCOUNT}/ad_credits`);
        const r = await axios.get(`${BASE}/${ACCOUNT}/ad_credits`, {
            params: { access_token: TOKEN }
        });
        console.log(`[SUCCESS] /ad_credits:`, JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log(`[ERROR] /ad_credits:`, e.response?.data?.error?.message);
    }

    // 2. Extended Credits on Account
    try {
        console.log(`\nTesting: /${ACCOUNT}/extended_credits`);
        const r = await axios.get(`${BASE}/${ACCOUNT}/extended_credits`, {
            params: { access_token: TOKEN }
        });
        console.log(`[SUCCESS] /extended_credits:`, JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log(`[ERROR] /extended_credits:`, e.response?.data?.error?.message);
    }

    // 3. Extended Credits on Business (Corrected syntax)
    try {
        console.log(`\nTesting: /${BUSINESS_ID}/extended_credits`);
        const r = await axios.get(`${BASE}/${BUSINESS_ID}/extended_credits`, {
            params: {
                fields: 'id,credit_available,credit_limit,currency',
                access_token: TOKEN
            }
        });
        console.log(`[SUCCESS] Biz extended_credits:`, JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log(`[ERROR] Biz extended_credits:`, e.response?.data?.error?.message);
    }

    // 4. Try to find "Fundos" in the funding_source_details nested further
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: 'funding_source_details{id,display_string,type,coupon_amount,current_balance,coupon_currency}',
                access_token: TOKEN
            }
        });
        console.log('\n4. Nested FS Details:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) { }
}

testCredits().catch(console.error);
