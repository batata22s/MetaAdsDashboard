const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function testBilling() {
    console.log('--- Probing Billing & Transactions ---\n');

    // 1. All Payment Methods
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}/all_payment_methods`, {
            params: { access_token: TOKEN }
        });
        console.log('1. All Payment Methods:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('1. Error:', e.response?.data?.error?.message || e.message);
    }

    // 2. Transactions (recent)
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}/transactions`, {
            params: {
                fields: 'id,time,status,amount,charge_type,payment_option',
                limit: 10,
                access_token: TOKEN
            }
        });
        console.log('\n2. Recent Transactions:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('\n2. Error Transactions:', e.response?.data?.error?.message || e.message);
    }

    // 3. Ad Account Balance directly from another endpoint if possible
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: 'balance,amount_spent,min_billing_threshold,spend_cap',
                access_token: TOKEN
            }
        });
        console.log('\n3. Core Financials:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) { }

    // 4. Try to search for the specific value 21923 or 250000 in ANY field by getting everything we can
    // This is a last resort "wide" query
    try {
        const fields = [
            'funding_source_details', 'extended_credit_invoice_group', 'is_prepay_account',
            'tax_id_status', 'disable_reason', 'account_status'
        ];
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: { fields: fields.join(','), access_token: TOKEN }
        });
        console.log('\n4. Wide Account Probe:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) { }
}

testBilling().catch(console.error);
