const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BASE = 'https://graph.facebook.com/v21.0';

async function deepSearch() {
    console.log('--- Deep Search for Balance Values ---\n');

    // 1. Check /me with expanded fields
    try {
        const r = await axios.get(`${BASE}/me`, {
            params: {
                fields: 'name,id,businesses{name,id,extended_credit_info},adaccounts{name,id,balance,amount_spent,currency,is_prepay_account,funding_source_details}',
                access_token: TOKEN
            }
        });
        console.log('--- /me Query Results ---');
        console.log(JSON.stringify(r.data, null, 2));

        const str = JSON.stringify(r.data);
        if (str.includes('21923')) console.log('!!! FOUND 21923 IN /ME !!!');
        if (str.includes('250000')) console.log('!!! FOUND 250000 IN /ME !!!');

    } catch (e) {
        console.log('Error /me:', e.response?.data?.error?.message || e.message);
    }

    // 2. Check the specifically targeted account act_2222669441583363 again with every field conceivable
    const accountId = 'act_2222669441583363';
    try {
        const fields = [
            'name', 'balance', 'amount_spent', 'currency', 'spend_cap', 'is_prepay_account',
            'funding_source_details', 'extended_credit_invoice_group', 'tax_id_status',
            'adspaymentcycle', 'min_billing_threshold', 'all_payment_methods',
            'total_prepaid_balance', 'current_unbilled_spend'
        ];

        console.log(`\n--- Probing ${accountId} ---`);
        for (const f of fields) {
            try {
                const r = await axios.get(`${BASE}/${accountId}`, {
                    params: { fields: f, access_token: TOKEN }
                });
                console.log(`[OK] ${f}:`, JSON.stringify(r.data, null, 2));
                if (JSON.stringify(r.data).includes('21923')) console.log(`!!! FOUND 21923 IN ${f} !!!`);
            } catch (e2) {
                // Only log if not a standard "nonexisting" error
                if (!e2.response?.data?.error?.message.includes('nonexisting')) {
                    console.log(`[ERR] ${f}:`, e2.response?.data?.error?.message);
                }
            }
        }
    } catch (e) { }
}

deepSearch().catch(console.error);
