const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "kiss",
  version: "2.0.0",
  permission: 0,
  credits: "Joy Ahmed",
  description: "Send a kiss photo with tagged person",
  prefix: true,
  category: "Love",
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.onLoad = async () => {
  const dir = path.join(__dirname, "cache");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const imgPath = path.join(dir, "kiss_base.png");
  if (!fs.existsSync(imgPath)) {
    const imgURL = "https://drive.google.com/uc?id=1D6vq9cC_D1KU-xoQUAaus4UVj4EqCocB";
    const res = await axios.get(imgURL, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(res.data, "utf-8"));
  }
};

async function circle(imagePath) {
  const img = await jimp.read(imagePath);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.join(__dirname, "cache");
  const baseImg = await jimp.read(path.join(dir, "kiss_base.png"));
  const pathImg = path.join(dir, `kiss_${one}_${two}.png`);
  const avatarOnePath = path.join(dir, `avt_${one}.png`);
  const avatarTwoPath = path.join(dir, `avt_${two}.png`);

  const [av1, av2] = await Promise.all([
    axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' }),
    axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })
  ]);

  fs.writeFileSync(avatarOnePath, Buffer.from(av1.data, 'utf-8'));
  fs.writeFileSync(avatarTwoPath, Buffer.from(av2.data, 'utf-8'));

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  baseImg.resize(700, 440)
    .composite(circleOne.resize(200, 200), 390, 23)
    .composite(circleTwo.resize(180, 180), 140, 80);

  const finalBuffer = await baseImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, finalBuffer);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, mentions } = event;
  const mention = Object.keys(mentions);
  if (!mention[0]) return api.sendMessage("❌ ১ জনকে ট্যাগ করো কিস পাঠাতে!", threadID, messageID);

  const one = senderID, two = mention[0];
  const percent = Math.floor(Math.random() * 51) + 50;
  const bonus = Math.floor(Math.random() * 10 + 1);
  const reward = percent * bonus;

  await Currencies.increaseMoney(senderID, reward);

  const box = 
`╭╼|━━━━━━━━━━━━━━|╾╮
💋 কিস দিলাম ${mentions[two].replace("@", "")} কে!
🔗 লাভ লেভেল: ${percent}%
💸 রিওয়ার্ড: +${reward}$
╰╼|━━━━━━━━━━━━━━|╾╯`;

  return makeImage({ one, two }).then(path => {
    api.sendMessage({
      body: box,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  });
};
