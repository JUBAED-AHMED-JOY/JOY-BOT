const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "married",
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
  const dir = __dirname + `/cache/canvas/`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const imgPath = path.join(dir, "married.png");
  if (!fs.existsSync(imgPath)) {
    const img = (await axios.get("https://drive.google.com/uc?id=1DOWNaJxyr5Xp2AsmyH5XVtI1qWS9xuLB", { responseType: "arraybuffer" })).data;
    fs.writeFileSync(imgPath, Buffer.from(img, "utf-8"));
  }
};

async function circle(imagePath) {
  const img = await jimp.read(imagePath);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const bgPath = path.join(__dirname, "cache/canvas/married.png");
  const canvas = await jimp.read(bgPath);

  const avatarOnePath = path.join(__dirname, `cache/canvas/avt_${one}.png`);
  const avatarTwoPath = path.join(__dirname, `cache/canvas/avt_${two}.png`);
  const finalPath = path.join(__dirname, `cache/canvas/married_${one}_${two}.png`);

  const avatarOneData = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(avatarOneData, "utf-8"));

  const avatarTwoData = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarTwoPath, Buffer.from(avatarTwoData, "utf-8"));

  const avatarOne = await jimp.read(await circle(avatarOnePath));
  const avatarTwo = await jimp.read(await circle(avatarTwoPath));

  canvas
    .composite(avatarOne.resize(150, 150), 280, 45)
    .composite(avatarTwo.resize(150, 150), 130, 90);

  const finalImage = await canvas.getBufferAsync("image/png");
  fs.writeFileSync(finalPath, finalImage);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return finalPath;
}

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID, mentions } = event;
  const mention = Object.keys(mentions);

  if (mention.length === 0)
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮
⚠️ দয়া করে ১ জন কে মেনশন করো।
╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );

  const one = senderID;
  const two = mention[0];

  try {
    const imagePath = await makeImage({ one, two });
    return api.sendMessage(
      {
        body: `╭╼|━━━━━━━━━━━━━━|╾╮
💍 অভিনন্দন! তোমরা বিয়ে করেছো 🥰
╰╼|━━━━━━━━━━━━━━|╾╯`,
        attachment: fs.createReadStream(imagePath)
      },
      threadID,
      () => fs.unlinkSync(imagePath),
      messageID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮
❌ ইমেজ তৈরি করতে সমস্যা হয়েছে।
╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }
};
