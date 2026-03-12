const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BASE = 'https://graph.facebook.com/v21.0';

async function deepSearchBalance() {
    console.log('--- Deep Searching All Accounts for "21923" or "PIX" ---\n');

    try {
        const list = await axios.get(`${BASE}/me/adaccounts`, {
            params: { access_token: TOKEN }
        });

        for (const acc of list.data.data) {
            console.log(`\nChecking: ${acc.name} (${acc.id})`);
            try {
                const r = await axios.get(`${BASE}/${acc.id}`, {
                    params: {
                        fields: 'name,balance,amount_spent,spend_cap,is_prepay_account,funding_source_details,extended_credit_invoice_group,all_payment_methods,funding_source',
                        access_token: TOKEN
                    }
                });

                const dump = JSON.stringify(r.data);
                if (dump.includes('21923') || dump.includes('219.23') || dump.includes('PIX')) {
                    console.log('!!! MATCH FOUND !!!');
                    console.log(JSON.stringify(r.data, null, 2));
                } else {
                    console.log('No match.');
                }
            } catch (e) {
                // Quietly ignore specific field errors
            }
        }
    } catch (e) {
        console.log('Error:', e.response?.data?.error?.message || e.message);
    }
}

deepSearchBalance().catch(console.error);
