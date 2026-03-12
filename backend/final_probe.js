const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = 'act_2222669441583363';
const BIZ = '3944331125782785';
const BASE = 'https://graph.facebook.com/v21.0';

async function lastStandProbe() {
    console.log('--- Final Deep Probe for R$ 219,23 ---');

    const probes = [
        // Edges on Account
        { label: 'Ad Credits', path: `${ACCOUNT}/ad_credits` },
        { label: 'Extended Credits (Acc)', path: `${ACCOUNT}/extended_credits` },
        { label: 'Transactions', path: `${ACCOUNT}/transactions`, params: { fields: 'id,time,status,amount,charge_type,payment_option' } },
        { label: 'Ad Funds', path: `${ACCOUNT}/adfunds` },
        { label: 'All Payment Methods', path: `${ACCOUNT}/all_payment_methods` },

        // Edges on Business
        { label: 'Extended Credits (Biz)', path: `${BIZ}/extended_credits`, params: { fields: 'id,credit_available,credit_limit,currency' } },
        { label: 'Payment Methods (Biz)', path: `${BIZ}/payment_methods` },
        { label: 'Business Projects', path: `${BIZ}/projects` }
    ];

    for (const p of probes) {
        try {
            console.log(`\nTesting ${p.label}...`);
            const r = await axios.get(`${BASE}/${p.path}`, {
                params: { ...p.params, access_token: TOKEN }
            });
            console.log(`[SUCCESS]`, JSON.stringify(r.data, null, 2));
            if (JSON.stringify(r.data).includes('21923')) console.log('!!! FOUND 219,23 !!!');
        } catch (e) {
            console.log(`[FAILED]`, e.response?.data?.error?.message || e.message);
        }
    }

    // One more look at core fields with nested expand
    try {
        console.log('\nTesting Nested Expand...');
        const r = await axios.get(`${BASE}/${ACCOUNT}`, {
            params: {
                fields: 'funding_source_details{id,display_string,type,current_balance,coupon_amount},extended_credit_invoice_group,is_prepay_account,balance,amount_spent,spend_cap',
                access_token: TOKEN
            }
        });
        console.log('[SUCCESS] Nested:', JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('[FAILED] Nested:', e.response?.data?.error?.message);
    }
}

lastStandProbe().catch(console.error);
