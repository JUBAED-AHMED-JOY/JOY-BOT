const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "fingering",
  prefix: "true",
  version: "1.0.0",
  permission: 0,
  credits: "Joy",
  description: "A fun image attack between two users!",
  category: "fun",
  usages: "[@mention]",
  cooldowns: 5,
};

module.exports.onLoad = async () => {
  const dir = path.join(__dirname, "cache", "canvas");
  const imgPath = path.join(dir, "fingering.png");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(imgPath)) {
    const res = await axios.get("https://drive.google.com/uc?id=1D95B_wc1jup4IFBB-_54OBB0sg2IXeZS", { responseType: "arraybuffer" }); // Clean action-based image
    fs.writeFileSync(imgPath, res.data);
  }
};

async function circle(image) {
  const img = await jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.join(__dirname, "cache", "canvas");
  const bg = await jimp.read(path.join(dir, "fingering.png"));
  const outPath = path.join(dir, `duoattack_${one}_${two}.png`);
  const onePath = path.join(dir, `avt_${one}.png`);
  const twoPath = path.join(dir, `avt_${two}.png`);

  const avt1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  const avt2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;

  fs.writeFileSync(onePath, Buffer.from(avt1, "utf-8"));
  fs.writeFileSync(twoPath, Buffer.from(avt2, "utf-8"));

  const circleOne = await jimp.read(await circle(onePath));
  const circleTwo = await jimp.read(await circle(twoPath));

  bg
    .composite(circleOne.resize(180, 180), 320, 90)
    .composite(circleTwo.resize(180, 180), 100, 230);

  const final = await bg.getBufferAsync("image/png");
  fs.writeFileSync(outPath, final);
  fs.unlinkSync(onePath);
  fs.unlinkSync(twoPath);

  return outPath;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, mentions } = event;
  const mention = Object.keys(mentions);
  if (!mention.length) {
    return api.sendMessage("⚠️ একজনকে মেনশন করুন যাতে সে আপনার 'fingering' এর শিকার হতে পারে!", threadID, messageID);
  }

  const one = senderID;
  const two = mention[0];

  try {
    const img = await makeImage({ one, two });
    const msg = {
      body: `╭╼|━━━━━━━━━━━━━━|╾╮\n┃ 🔥 fingering Initiated!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      attachment: fs.createReadStream(img),
    };
    api.sendMessage(msg, threadID, () => fs.unlinkSync(img), messageID);
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ ছবিটি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
  }
};
