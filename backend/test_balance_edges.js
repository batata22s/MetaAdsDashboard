const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function testEdges() {
    console.log('--- Testing Advanced Edges with New Token ---\n');

    const edges = [
        'prepaid_balances',
        'transactions',
        'extended_credits',
        'funding_source_details',
        'adspaymentcycle',
        'assigned_users'
    ];

    for (const edge of edges) {
        try {
            console.log(`\nTesting edge: /${edge}`);
            const r = await axios.get(`${BASE}/${ACCOUNT}/${edge}`, {
                params: { access_token: TOKEN }
            });
            console.log(`[SUCCESS] /${edge}:`, JSON.stringify(r.data, null, 2));

            if (JSON.stringify(r.data).includes('21923') || JSON.stringify(r.data).includes('219.23')) {
                console.log(`!!! FOUND BALANCE VALUE IN EDGE /${edge} !!!`);
            }
        } catch (e) {
            console.log(`[ERROR] /${edge}:`, e.response?.data?.error?.message || e.message);
        }
    }

    // Also try to query transactions with specific fields that might show "Fundos"
    try {
        console.log('\n--- Deep Transaction Scan ---');
        const r = await axios.get(`${BASE}/${ACCOUNT}/transactions`, {
            params: {
                fields: 'id,time,status,amount,charge_type,payment_option,billing_start_time,billing_end_time,post_amount_balance',
                limit: 50,
                access_token: TOKEN
            }
        });
        console.log(`Found ${r.data.data?.length || 0} transactions.`);
        if (r.data.data) {
            r.data.data.forEach(t => {
                if (JSON.stringify(t).includes('21923')) {
                    console.log('!!! TRANSACTION MATCH !!!', JSON.stringify(t, null, 2));
                }
            });
        }
    } catch (e) {
        console.log('Transaction scan error:', e.response?.data?.error?.message);
    }
}

testEdges().catch(console.error);
