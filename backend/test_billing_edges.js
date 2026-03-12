const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function testBillingEdges() {
    console.log('--- Probing Billing & Activity Edges ---\n');

    const edges = [
        'activities',
        'funding_transactions',
        'ad_transactions',
        'payments',
        'ad_accounts',
        'promotions',
        'prepaid_pay_now_options'
    ];

    for (const edge of edges) {
        try {
            console.log(`\nTesting: /${ACCOUNT}/${edge}`);
            const r = await axios.get(`${BASE}/${ACCOUNT}/${edge}`, {
                params: { access_token: TOKEN }
            });
            console.log(`[SUCCESS] /${edge}:`, JSON.stringify(r.data, null, 2));
            const str = JSON.stringify(r.data);
            if (str.includes('21923')) console.log('!!! FOUND 21923 !!!');
            if (str.includes('250000')) console.log('!!! FOUND 250000 !!!');
        } catch (e) {
            console.log(`[ERROR] /${edge}:`, e.response?.data?.error?.message || e.message);
        }
    }

    // Try specialized fields in a single query
    try {
        const fields = [
            'all_payment_methods{id,display_string,type,current_balance}',
            'funding_source_details{id,display_string,type,coupon_amount,current_balance}',
            'extended_credit_invoice_group',
            'min_billing_threshold',
            'spend_cap',
            'amount_spent',
            'balance'
        ];
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: fields.join(','),
                access_token: TOKEN
            }
        });
        console.log('\n--- Complex Field Query ---');
        console.log(JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('Complex field query error:', e.response?.data?.error?.message);
    }
}

testBillingEdges().catch(console.error);
