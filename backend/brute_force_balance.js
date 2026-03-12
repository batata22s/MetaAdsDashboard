const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;
const BASE = 'https://graph.facebook.com/v21.0';

async function test() {
    const fields = [
        'adspaymentcycle', 'all_payment_methods', 'amount_spent', 'attribution_spec',
        'balance', 'business', 'business_city', 'business_country_code', 'business_name',
        'business_state', 'business_zip', 'can_create_brand_lift_test', 'capabilities',
        'created_time', 'currency', 'disable_reason', 'end_advertiser', 'end_advertiser_name',
        'extended_credit_invoice_group', 'failed_delivery_checks', 'fb_entity', 'funding_source',
        'funding_source_details', 'has_migrated_permissions', 'has_page_authorized_ad_account',
        'id', 'io_number', 'is_notifications_enabled', 'is_personal', 'is_prepay_account',
        'is_tax_id_required', 'line_of_biz_id', 'media_agency', 'min_billing_threshold',
        'min_campaign_group_spend_cap', 'name', 'offsite_ads_enabled', 'owner',
        'owner_business', 'page_id', 'partner', 'rf_spec', 'spend_cap', 'tax_id',
        'tax_id_status', 'tax_id_type', 'timezone_id', 'timezone_name', 'timezone_offset_hours_utc',
        'user_role', 'vertical_id', 'prepaid_pay_now_options'
    ];

    console.log('--- Brute-forcing AdAccount fields ---\n');

    // Try in batches of 20 to avoid URL length issues
    for (let i = 0; i < fields.length; i += 20) {
        const batch = fields.slice(i, i + 20);
        try {
            const r = await axios.get(`${BASE}/${ACCOUNT}`, {
                params: {
                    fields: batch.join(','),
                    access_token: TOKEN
                }
            });
            console.log(`Batch ${i / 20 + 1} Success:`);
            const data = r.data;
            console.log(JSON.stringify(data, null, 2));

            // Scan for the values 21923 (Balance) or 250000 (Pending)
            const str = JSON.stringify(data);
            if (str.includes('21923')) console.log('!!! FOUND 21923 (Balance) !!!');
            if (str.includes('250000')) console.log('!!! FOUND 250000 (Pending) !!!');
        } catch (e) {
            console.log(`Batch ${i / 20 + 1} Error:`, e.response?.data?.error?.message || e.message);
            // If batch fails, try one by one in this batch
            for (const f of batch) {
                try {
                    const r1 = await axios.get(`${BASE}/${ACCOUNT}`, {
                        params: { fields: f, access_token: TOKEN }
                    });
                    console.log(`[OK] ${f}:`, JSON.stringify(r1.data, null, 2));
                    if (JSON.stringify(r1.data).includes('21923')) console.log(`!!! FOUND 21923 IN ${f} !!!`);
                } catch (e1) {
                    // Ignore "nonexisting field" errors
                    if (!e1.response?.data?.error?.message.includes('nonexisting field')) {
                        console.log(`[ERR] ${f}:`, e1.response?.data?.error?.message);
                    }
                }
            }
        }
    }

    // Try specialized edges
    const edges = ['adspaymentcycle', 'transactions', 'insights', 'promotions', 'adfunds'];
    console.log('\n--- Checking edges ---\n');
    for (const edge of edges) {
        try {
            const r = await axios.get(`${BASE}/${ACCOUNT}/${edge}`, {
                params: { access_token: TOKEN }
            });
            console.log(`Edge ${edge} Success:`, r.data.data?.length, 'items found');
            if (JSON.stringify(r.data).includes('21923')) console.log(`!!! FOUND 21923 IN EDGE ${edge} !!!`);
        } catch (e) {
            console.log(`Edge ${edge} Error:`, e.response?.data?.error?.message);
        }
    }
}

test().catch(console.error);
