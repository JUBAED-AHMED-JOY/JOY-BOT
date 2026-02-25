const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "hugv2",
  version: "3.1.1",
  permission: 0,
  credits: "Joy",
  description: "Send a warm hug 🥰",
  prefix: true,
  category: "image",
  usages: "[@mention]",
  cooldowns: 5
};

module.exports.onLoad = async () => {
  const dir = __dirname + `/cache/canvas/`;
  const imgPath = path.join(dir, "hugv2.png");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(imgPath)) {
    const imgData = (await axios.get("https://drive.google.com/uc?id=1DM0wekaYPqJVSbrijNxX1bgqUwShT0PJ", { responseType: "arraybuffer" })).data;
    fs.writeFileSync(imgPath, imgData);
  }
};

async function circle(image) {
  const img = await jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.resolve(__dirname, "cache/canvas");
  const baseImg = await jimp.read(path.join(dir, "hugv2.png"));
  const pathImg = path.join(dir, `hugv2_${one}_${two}.png`);
  const avatarOnePath = path.join(dir, `avt_${one}.png`);
  const avatarTwoPath = path.join(dir, `avt_${two}.png`);

  const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(getAvatarOne, "utf-8"));

  const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarTwoPath, Buffer.from(getAvatarTwo, "utf-8"));

  const avatar1 = await jimp.read(await circle(avatarOnePath));
  const avatar2 = await jimp.read(await circle(avatarTwoPath));

  baseImg.composite(avatar1.resize(100, 100), 370, 40);
  baseImg.composite(avatar2.resize(100, 100), 330, 150);

  const finalBuffer = await baseImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, finalBuffer);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

module.exports.run = async function ({ event, api, args }) {
  const mention = Object.keys(event.mentions);
  const { senderID, threadID, messageID } = event;

  if (!mention[0]) {
    return api.sendMessage(
      "╭╼|━━━━━━━━━━━━━━|╾╮\n𝙿𝚕𝚎𝚊𝚜𝚎 𝚖𝚎𝚗𝚝𝚒𝚘𝚗 𝚘𝚗𝚎 𝚞𝚜𝚎𝚛 𝚝𝚘 𝚑𝚞𝚐 🥺\n╰╼|━━━━━━━━━━━━━━|╾╯",
      threadID,
      messageID
    );
  }

  const one = senderID;
  const two = mention[0];

  const imgPath = await makeImage({ one, two });

  return api.sendMessage(
    {
      body:
        "╭╼|━━━━━━━━━━━━━━|╾╮\n" +
        `🤗 𝙷𝚞𝚐𝚐𝚐 𝚏𝚛𝚘𝚖 <@${one}> 𝚝𝚘 <@${two}> 💞\n` +
        "╰╼|━━━━━━━━━━━━━━|╾╯",
      attachment: fs.createReadStream(imgPath),
      mentions: [
        { tag: `<@${one}>`, id: one },
        { tag: `<@${two}>`, id: two }
      ]
    },
    threadID,
    () => fs.unlinkSync(imgPath),
    messageID
  );
};
