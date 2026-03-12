const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;

async function testVersions() {
    const versions = ['v18.0', 'v19.0', 'v20.0', 'v21.0'];
    const fields = 'name,balance,amount_spent,prepaid_balances,is_prepay_account,funding_source_details';

    console.log('--- Testing across API Versions ---\n');

    for (const v of versions) {
        try {
            const r = await axios.get(`https://graph.facebook.com/${v}/${ACCOUNT}`, {
                params: {
                    fields: fields,
                    access_token: TOKEN
                }
            });
            console.log(`[${v}] Success:`, JSON.stringify(r.data, null, 2));
        } catch (e) {
            console.log(`[${v}] Error:`, e.response?.data?.error?.message || e.message);
        }
    }
}

testVersions().catch(console.error);
