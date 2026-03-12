const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BUSINESS_ID = '3944331125782785';
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function testBusinessBilling() {
    console.log('--- Probing Business Billing ---\n');

    // 1. Business Payment Methods
    try {
        const r = await axios.get(`${BASE}/${BUSINESS_ID}/payment_methods`, {
            params: { access_token: TOKEN }
        });
        console.log('1. Business Payment Methods:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('1. Error:', e.response?.data?.error?.message || e.message);
    }

    // 2. Business Extended Credits
    try {
        const r = await axios.get(`${BASE}/${BUSINESS_ID}/extended_credits`, {
            params: { fields: 'credit_available,credit_limit,currency', access_token: TOKEN }
        });
        console.log('\n2. Business Extended Credits:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('\n2. Error:', e.response?.data?.error?.message || e.message);
    }

    // 3. One more try for AdAccount fields that might hide balance
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: 'adspaymentcycle,min_billing_threshold,spend_cap,amount_spent,balance,currency',
                access_token: TOKEN
            }
        });
        console.log('\n3. AdAccount Financial Check:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) { }
}

testBusinessBilling().catch(console.error);
