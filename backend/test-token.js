const axios = require('axios');
require('dotenv').config();

async function test() {
    try {
        const res = await axios.get(`https://graph.facebook.com/v21.0/${process.env.META_AD_ACCOUNT_ID}/insights`, {
            params: {
                access_token: process.env.META_ACCESS_TOKEN,
                date_preset: 'today'
            }
        });
        console.log('SUCCESS:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('ERROR:', e.response?.data || e.message);
    }
}
test();
