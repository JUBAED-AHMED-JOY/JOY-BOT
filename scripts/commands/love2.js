const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "love2",
  version: "2.0.0",
  permission: 0,
  credits: "Joy Ahmed",
  description: "Create a love frame with mentioned person",
  prefix: true,
  category: "Love",
  usages: "[tag]",
  cooldowns: 5,
  dependencies: {
    axios: "",
    "fs-extra": "",
    path: "",
    jimp: ""
  }
};

module.exports.onLoad = async () => {
  const cachePath = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(cachePath, "joy2.png");

  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  if (!fs.existsSync(bgPath)) {
    const bgUrl = "https://drive.google.com/uc?id=1BnaLHRtYs4nykFSc5TE_5Fg1iuMqz4NO"; // Frame image
    const res = await axios.get(bgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(bgPath, Buffer.from(res.data));
  }
};

async function circle(imgPath) {
  const image = await jimp.read(imgPath);
  image.circle();
  return image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const cachePath = path.join(__dirname, "cache", "canvas");
  const bg = await jimp.read(path.join(cachePath, "joy2.png"));
  const avt1Path = path.join(cachePath, `avt_${one}.png`);
  const avt2Path = path.join(cachePath, `avt_${two}.png`);
  const finalPath = path.join(cachePath, `love_${one}_${two}.png`);

  const avt1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, {
    responseType: "arraybuffer"
  })).data;
  fs.writeFileSync(avt1Path, Buffer.from(avt1));

  const avt2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, {
    responseType: "arraybuffer"
  })).data;
  fs.writeFileSync(avt2Path, Buffer.from(avt2));

  const circ1 = await jimp.read(await circle(avt1Path));
  const circ2 = await jimp.read(await circle(avt2Path));

  bg.composite(circ1.resize(217, 217), 98, 143);
  bg.composite(circ2.resize(216, 216), 538, 144);

  const finalBuffer = await bg.getBufferAsync("image/png");
  fs.writeFileSync(finalPath, finalBuffer);

  fs.unlinkSync(avt1Path);
  fs.unlinkSync(avt2Path);

  return finalPath;
}

module.exports.run = async function ({ api, event }) {
  const { senderID, mentions, threadID, messageID } = event;
  const mentionIDs = Object.keys(mentions);

  if (!mentionIDs.length) {
    return api.sendMessage("🥰 𝓙𝓪𝓻 𝓼𝓪𝓽𝓱𝓮 𝓵𝓸𝓿𝓮 𝓯𝓻𝓪𝓶𝓮 𝓫𝓪𝓷𝓪𝓽𝓮 𝓬𝓱𝓪𝓲𝓼𝓸, 𝓽𝓪𝓴𝓮 𝓶𝓮𝓷𝓽𝓲𝓸𝓷 𝓴𝓸𝓻𝓸!", threadID, messageID);
  }

  const targetID = mentionIDs[0];
  const imgPath = await makeImage({ one: senderID, two: targetID });

  const msg = `
╭╼|━━━━━━━━━━━━━━|╾╮
│ 💖 𝓛𝓸𝓿𝓮 𝓕𝓻𝓪𝓶𝓮 💖
│ 
│ ❝ 𝒯𝒽𝒶𝓀 𝑒𝓀 𝓉𝓊𝓂𝒾 𝒿𝒶𝓇 𝓈𝒶𝓉𝒽𝑒 𝓁𝑜𝓋𝑒 𝒻𝓇𝒶𝓂𝑒 𝒽𝑜𝓀!
│ 𝒥𝑒𝓉𝒶 𝓉𝓊𝓂𝒾 𝓂𝑜𝓃𝑒𝓇 𝓂𝒶𝓉𝑜𝓃 𝒷𝒶𝓃𝒶𝓉𝑒 𝓅𝒶𝓇𝑜 ❞
│ 
│ ✨ 𝒞𝓇𝑒𝒶𝓉𝑜𝓇: 𝒥❍𝓎 𝒜𝒽𝓂𝑒𝒹 ✨
╰╼|━━━━━━━━━━━━━━|╾╯
`;

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(imgPath)
  }, threadID, () => fs.unlinkSync(imgPath), messageID);
};
