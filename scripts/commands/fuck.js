const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "fuck",
  version: "1.0.0",
  permission: 0,
  credits: "Joy",
  description: "Generates a 'fuck' meme with your avatar and mentioned user's avatar.",
  prefix: true,
  category: "fun",
  usages: "fuck @mention",
  cooldowns: 5,
};

module.exports.onLoad = async () => {
  const dir = __dirname + `/cache/canvas/`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const imgPath = path.join(dir, "fuckv2.png");
  if (!fs.existsSync(imgPath)) {
    const img = (await axios.get("https://drive.google.com/uc?id=1DEVtK3nSegoSjT4VsXMhnkEO3Sct9sgz", { responseType: "arraybuffer" })).data;
    fs.writeFileSync(imgPath, Buffer.from(img, "utf-8"));
  }
};

async function circle(image) {
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(dir, "fuckv2.png");
  const pathImg = path.join(dir, `fuck_${one}_${two}.png`);
  const avatarOnePath = path.join(dir, `avt_${one}.png`);
  const avatarTwoPath = path.join(dir, `avt_${two}.png`);

  const avatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(avatarOne, "utf-8"));

  const avatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarTwoPath, Buffer.from(avatarTwo, "utf-8"));

  const bg = await jimp.read(bgPath);
  const circOne = await jimp.read(await circle(avatarOnePath));
  const circTwo = await jimp.read(await circle(avatarTwoPath));

  bg.composite(circOne.resize(180, 180), 190, 200);
  bg.composite(circTwo.resize(180, 180), 390, 200);

  const finalImg = await bg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, finalImg);
  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);
  return pathImg;
}

module.exports.run = async function ({ api, event }) {
  const mention = Object.keys(event.mentions);
  const { threadID, messageID, senderID } = event;

  if (mention.length === 0) {
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n│  ⚠️ Mention 1 person!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }

  const one = senderID;
  const two = mention[0];

  try {
    const imgPath = await makeImage({ one, two });
    return api.sendMessage(
      {
        body:
          `╭╼|━━━━━━━━━━━━━━|╾╮\n` +
          `│  🥵 Fuck mode activated!\n` +
          `╰╼|━━━━━━━━━━━━━━|╾╯`,
        attachment: fs.createReadStream(imgPath),
        mentions: [{ id: two, tag: event.mentions[two] }]
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n│  ❌ Error generating image.\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }
};
