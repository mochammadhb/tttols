import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Step 1: Fetch TikTok page
    const tiktokURL = `https://www.tiktok.com/@${username}`;
    const response = await fetch(tiktokURL);

    if (!response.ok) {
      throw new Error(`Failed to fetch TikTok page. Status: ${response.status}`);
    }

    const text = await response.text();

    // Step 2: Extract data from TikTok page
    const scriptRegex = /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/;
    const scriptMatch = text.match(scriptRegex);

    if (!scriptMatch) {
      throw new Error("Failed to extract TikTok data");
    }

    const scriptContent = scriptMatch[1];
    const data = JSON.parse(scriptContent);
    const uid = data.id;

    if (!uid) {
      throw new Error("UID not found");
    }

    // Step 3: Fetch creator info from API
    const apiFetchURL = `https://oec22-normal-alisg.tokopediax.com/api/showcase/v1/creator_info/get?creator_uid=${uid}&aid=1988`;
    const apiResponse = await fetch(apiFetchURL);

    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch creator info. Status: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    const creatorInfo = apiData.data.data.creator_info;

    // Step 4: Return creator info
    res.status(200).json({
      creator_name: creatorInfo.creator_name || "N/A",
      followers: creatorInfo.followers_info?.value || 0,
      total_products: creatorInfo.product_count_info?.value || 0,
      products_sold: creatorInfo.sold_count_info?.value || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
