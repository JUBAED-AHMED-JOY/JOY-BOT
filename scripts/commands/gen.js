const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_JSON_URL = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json";

module.exports.config = {
  name: "gen",
  version: "2.1.0",
  hasPermission: 0,
  credits: "Joy Ahmed",
  description: "Anime image generate koro prompt diye",
  prefix: true,
  category: "media",
  usages: "[prompt]",
  cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(
      "🎨 Anime Image Generator\n\n"
      + "❌ Prompt dao!\n\n"
      + "📌 Usage:\n"
      + ".gen girl with sword\n"
      + ".gen cute boy in forest\n"
      + ".gen dragon flying at sunset",
      threadID,
      messageID
    );
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  // Step 1: GitHub api.json theke base URL fetch koro
  let animeApiBase;
  try {
    const jsonRes = await axios.get(API_JSON_URL, { timeout: 10000 });
    animeApiBase = jsonRes.data?.anime;
    if (!animeApiBase) throw new Error("'anime' key nai api.json e");
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "❌ API config load hoy ni!\nError: " + err.message,
      threadID,
      messageID
    );
  }

  // Step 2: Anime API call koro
  const animePrompt = "anime " + prompt;
  let imageUrl;
  try {
    const base = animeApiBase.replace(/\/+$/, "");
    const fullUrl = base + "/api/anime?prompt=" + encodeURIComponent(animePrompt);

    const apiRes = await axios.get(fullUrl, { timeout: 30000 });
    const data = apiRes.data;

    imageUrl = data?.image || data?.url || data?.img || data?.result || null;

    if (typeof data === "string" && data.startsWith("http")) imageUrl = data;
    if (!imageUrl) throw new Error("Image URL pawa jay ni");
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "❌ Anime API theke response pawa jay ni!\nError: " + err.message,
      threadID,
      messageID
    );
  }

  // Step 3: Image download koro
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, "gen_" + Date.now() + ".png");

  try {
    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    fs.writeFileSync(cachePath, imgRes.data);
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "❌ Image download hoy ni!\nError: " + err.message,
      threadID,
      messageID
    );
  }

  // Step 4: Messenger e send koro
  try {
    api.setMessageReaction("✅", messageID, () => {}, true);

    api.sendMessage(
      {
        body: "🎨 Anime Image Generated!\n\n📝 Prompt: " + animePrompt + "\n⚡ Powered by Joy Ahmed",
        attachment: fs.createReadStream(cachePath)
      },
      threadID,
      (err) => {
        try { fs.unlinkSync(cachePath); } catch (_) {}
        if (err) console.error("[gen] sendMessage error:", err.message);
      }
    );
  } catch (err) {
    try { fs.unlinkSync(cachePath); } catch (_) {}
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(
      "❌ Image send hoy ni!\nError: " + err.message,
      threadID,
      messageID
    );
  }
};
