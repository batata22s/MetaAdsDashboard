const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BASE = 'https://graph.facebook.com/v21.0';

async function test() {
    console.log('--- Listing all accessible Business Accounts ---\n');
    try {
        const r = await axios.get(`${BASE}/me/businesses`, {
            params: {
                fields: 'name,id,extended_credit_info',
                access_token: TOKEN
            }
        });
        console.log(JSON.stringify(r.data, null, 2));

        // Scan for 21923 in all business data
        if (JSON.stringify(r.data).includes('21923')) {
            console.log('!!! FOUND 21923 in Businesses !!!');
        }
    } catch (e) {
        console.log('Error:', e.response?.data?.error?.message || e.message);
    }
}

test().catch(console.error);
