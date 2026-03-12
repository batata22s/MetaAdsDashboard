const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BASE = 'https://graph.facebook.com/v21.0';

async function scanAllAccounts() {
    console.log('--- Scanning All Ad Accounts for Balance 219.23 ---\n');

    try {
        const list = await axios.get(`${BASE}/me/adaccounts`, {
            params: { access_token: TOKEN }
        });

        for (const acc of list.data.data) {
            console.log(`\nChecking Account: ${acc.name} (${acc.id})`);
            try {
                const fields = [
                    'balance', 'amount_spent', 'spend_cap', 'currency',
                    'is_prepay_account', 'funding_source_details', 'extended_credit_invoice_group'
                ];
                const r = await axios.get(`${BASE}/${acc.id}`, {
                    params: { fields: fields.join(','), access_token: TOKEN }
                });

                console.log(JSON.stringify(r.data, null, 2));
                const str = JSON.stringify(r.data);
                if (str.includes('21923')) console.log('!!! FOUND 21923 IN THIS ACCOUNT !!!');
                if (str.includes('250000')) console.log('!!! FOUND 250000 IN THIS ACCOUNT !!!');

            } catch (e) {
                console.log(`Error checking ${acc.id}:`, e.response?.data?.error?.message);
            }
        }
    } catch (e) {
        console.log('Error listing accounts:', e.response?.data?.error?.message);
    }
}

scanAllAccounts().catch(console.error);
