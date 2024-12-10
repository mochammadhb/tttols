// api/fetchTikTok.js

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Fetch HTML dari TikTok
    const response = await fetch(`https://www.tiktok.com/@${username}`);
    const html = await response.text();

    // Parsing HTML untuk mendapatkan JSON data
    const scriptContent = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__1"[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptContent || !scriptContent[1]) {
      return res.status(404).json({ error: 'TikTok data not found' });
    }

    const jsonData = JSON.parse(scriptContent[1]);
    const uid = jsonData.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo.user;
    if (!uid) {
      return res.status(404).json({ error: 'UID not found in TikTok data' });
    }

    // Fetch data dari Tokopedia menggunakan UID
    const apiResponse = await fetch(`https://oec22-normal-alisg.tokopediax.com/api/showcase/v1/creator_info/get?creator_uid=${uid.id}&aid=1988`);
    const apiData = await apiResponse.json();

    if (apiData?.data?.data?.creator_info) {
      return res.status(200).json(apiData.data.data.creator_info);
    } else {
      return res.status(404).json({ error: 'Creator info not available' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
