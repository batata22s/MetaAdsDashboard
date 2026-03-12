require('dotenv').config();
const axios = require('axios');
const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const accessToken = process.env.META_ACCESS_TOKEN;
const adAccountId = process.env.META_AD_ACCOUNT_ID;

async function test() {
  try {
    const res = await axios.get(`${META_BASE_URL}/${adAccountId}/ads`, {
      params: {
        fields: 'id,name,creative{name,body,image_url,thumbnail_url,object_story_spec}',
        access_token: accessToken,
        limit: 10
      }
    });

    res.data.data.forEach(ad => {
      const c = ad.creative;
      if (!c) return;
      const spec = c.object_story_spec || {};
      const hqImage =
        (spec.video_data && spec.video_data.image_url) ||
        (spec.link_data && spec.link_data.image_hash) ||
        c.image_url || c.thumbnail_url;

      console.log(`Ad: ${ad.name}`);
      console.log(`- Creative Image URL: ${c.image_url}`);
      console.log(`- Thumbnail URL: ${c.thumbnail_url}`);
      console.log(`- Video Data Image URL: ${spec.video_data?.image_url}`);
      console.log('-----------------------------------');
    });

  } catch (e) { console.error(e.response ? e.response.data : e.message); }
}
test();
