const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const BUSINESS_ID = '3944331125782785';
const BASE = 'https://graph.facebook.com/v21.0';

async function testBizDeep() {
    console.log(`--- Deep Probe of Business: ${BUSINESS_ID} ---\n`);

    try {
        const r = await axios.get(`${BASE}/${BUSINESS_ID}`, {
            params: {
                fields: 'name,id,payment_account_id,primary_ad_account,extended_credit_info',
                access_token: TOKEN
            }
        });
        console.log('Business Fields:', JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('Error Fields:', e.response?.data?.error?.message);
    }

    // Try to list ad accounts from the business perspective again with more details
    try {
        const r = await axios.get(`${BASE}/${BUSINESS_ID}/adaccounts`, {
            params: {
                fields: 'name,account_id,balance,amount_spent,is_prepay_account,spend_cap',
                access_token: TOKEN
            }
        });
        console.log('\nBusiness AdAccounts:', JSON.stringify(r.data, null, 2));
    } catch (e) {
        console.log('Error Biz AdAccounts:', e.response?.data?.error?.message);
    }
}

testBizDeep().catch(console.error);
