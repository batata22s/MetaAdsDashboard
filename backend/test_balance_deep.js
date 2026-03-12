const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function testExhaustive() {
    console.log('--- Exhaustive Probe with New Token ---\n');

    // 1. Get ALL default fields
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: { access_token: TOKEN }
        });
        console.log('1. Default Account Fields:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('1. Error:', e.response?.data?.error?.message || e.message);
    }

    // 2. Probe every field mentioned in docs for Brazilian/Prepaid accounts
    const probes = [
        'balance',
        'amount_spent',
        'currency',
        'spend_cap',
        'is_prepay_account',
        'funding_source_details',
        'extended_credit_invoice_group',
        'adspaymentcycle',
        'tax_id_status',
        'business',
        'owner',
        'funding_source'
    ];

    console.log('\n2. Probing specific fields...');
    for (const f of probes) {
        try {
            const r = await axios.get(`${BASE}/${ACCOUNT}`, {
                params: { fields: f, access_token: TOKEN }
            });
            console.log(`[SUCCESS] ${f}:`, JSON.stringify(r.data, null, 2));
        } catch (e) {
            if (!e.response?.data?.error?.message.includes('nonexisting field')) {
                console.log(`[ERROR] ${f}:`, e.response?.data?.error?.message);
            }
        }
    }

    // 3. Try to find the balance in associated objects
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: { fields: 'funding_source', access_token: TOKEN }
        });
        const fsId = r.data.funding_source;
        if (fsId) {
            console.log(`\n3. Probing Funding Source: ${fsId}`);
            const r2 = await axios.get(`${BASE}/${fsId}`, {
                params: { fields: 'amount,display_string,type,current_balance', access_token: TOKEN }
            });
            console.log('FS Data:', JSON.stringify(r2.data, null, 2));
        }
    } catch (e) { }

    // 4. List all accounts again just in case
    try {
        const r = await axios.get(`${BASE}/me/adaccounts`, {
            params: { fields: 'name,balance,amount_spent,is_prepay_account', access_token: TOKEN }
        });
        console.log('\n4. All accessible accounts:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) { }

    // 5. Try to find PIX specific info (often in transactions or credit)
    try {
        const r = await axios.get(`${BASE}/${ACCOUNT}/extended_credits`, {
            params: { access_token: TOKEN }
        });
        console.log('\n5. Extended Credits Connection:');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) { }
}

testExhaustive().catch(console.error);
