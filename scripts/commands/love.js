const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "love",
  version: "2.0.0",
  permission: 0,
  credits: "Joy Ahmed",
  description: "Make a romantic love frame with someone you mention",
  prefix: true,
  category: "Love",
  usages: "[tag]",
  cooldowns: 5
};

module.exports.onLoad = async () => {
  const cachePath = path.resolve(__dirname, "cache", "canvas");
  const bgPath = path.join(cachePath, "joy.png");

  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  if (!fs.existsSync(bgPath)) {
    const imageURL = "https://drive.google.com/uc?id=1BhOoXAXx33YVsENF0heQRDtg17Z8YgNV"; // Background image
    const res = await axios.get(imageURL, { responseType: "arraybuffer" });
    fs.writeFileSync(bgPath, Buffer.from(res.data));
  }
};

async function circle(imgPath) {
  const image = await jimp.read(imgPath);
  image.circle();
  return image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const cacheDir = path.resolve(__dirname, "cache", "canvas");
  const bg = await jimp.read(path.join(cacheDir, "joy.png"));

  const avt1Path = path.join(cacheDir, `avt_${one}.png`);
  const avt2Path = path.join(cacheDir, `avt_${two}.png`);
  const finalPath = path.join(cacheDir, `love_${one}_${two}.png`);

  const getAvt = async (uid, savePath) => {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(savePath, Buffer.from(res.data));
  };

  await getAvt(one, avt1Path);
  await getAvt(two, avt2Path);

  const circ1 = await jimp.read(await circle(avt1Path));
  const circ2 = await jimp.read(await circle(avt2Path));

  bg.composite(circ1.resize(196, 196), 98, 141);
  bg.composite(circ2.resize(193, 193), 427, 143);

  const buffer = await bg.getBufferAsync("image/png");
  fs.writeFileSync(finalPath, buffer);

  fs.unlinkSync(avt1Path);
  fs.unlinkSync(avt2Path);

  return finalPath;
}

module.exports.run = async function ({ event, api, args }) {
  const senderID = event.senderID;
  const mentions = event.mentions || {};
  const mentionIDs = Object.keys(mentions);

  if (!mentionIDs.length) {
    return api.sendMessage("🥰 যাকে মেনশন করে লাভ ফ্রেম বানাতে চাও, তাকে ট্যাগ করো!", event.threadID, event.messageID);
  }

  const taggedID = mentionIDs[0];
  const imgPath = await makeImage({ one: senderID, two: taggedID });

  const msgBox = `
╭╼|━━━━━━━━━━━━━━|╾╮
│ 💖 𝓛𝓸𝓿𝓮 𝓕𝓻𝓪𝓶𝓮 💖
│ 
│ 𝓛𝓸𝓿𝓮 𝓲𝓼 𝓷𝓸𝓽 𝓪𝓫𝓸𝓾𝓽 𝓹𝓸𝓼𝓼𝓮𝓼𝓼𝓲𝓷𝓰,
│ 𝓲𝓽'𝓼 𝓪𝓫𝓸𝓾𝓽 𝓪𝓹𝓹𝓻𝓮𝓬𝓲𝓪𝓽𝓲𝓷𝓰. 💞
│ 
│ 💌 “𝐓𝐨 𝐥𝐨𝐯𝐞 𝐚𝐧𝐝 𝐛𝐞 𝐥𝐨𝐯𝐞𝐝 𝐢𝐬 𝐭𝐡𝐞 𝐠𝐫𝐞𝐚𝐭𝐞𝐬𝐭 𝐟𝐞𝐞𝐥𝐢𝐧𝐠.” 💌
│ 
│ ✨ 𝓒𝓻𝓮𝓪𝓽𝓸𝓻: 𝒥❍𝓎 𝒜𝒽𝓂𝑒𝒹 ✨
╰╼|━━━━━━━━━━━━━━|╾╯
`;

  return api.sendMessage(
    {
      body: msgBox,
      attachment: fs.createReadStream(imgPath)
    },
    event.threadID,
    () => fs.unlinkSync(imgPath),
    event.messageID
  );
};
