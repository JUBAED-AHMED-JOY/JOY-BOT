module.exports.config = {
  name: "married3",
  version: "1.0.1",
  permission: 0,
  credits: "Joy Ahmed",
  description: "kiss/married styled image with mention",
  prefix: true,
  category: "kiss",
  usages: "married2 @tag",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'marriedv3.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://drive.google.com/uc?id=1K5otrnviH3mto7QHuhSZdBMKMx3Sk87j", path);
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let base = await jimp.read(__root + "/marriedv3.png");
  let pathImg = __root + `/married_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: 'arraybuffer' }
  )).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: 'arraybuffer' }
  )).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));

  // positions তোমার দেওয়া মতোই রাখলাম
  base.composite(circleOne.resize(90, 90), 250, 1)
      .composite(circleTwo.resize(90, 90), 350, 70);

  let raw = await base.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions)[0];

  if (!mention) {
    return api.sendMessage("❌ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙩𝙖𝙜 𝙤𝙣𝙚 𝙥𝙚𝙧𝙨𝙤𝙣!", threadID, messageID);
  }

  const tag = event.mentions[mention].replace("@", "");
  const one = senderID, two = mention;

  return makeImage({ one, two }).then(path => api.sendMessage({
    body: `╭╼|━━━━━━━━━━━━━━|╾╮
𝙆𝙞𝙨𝙨 𝙈𝙤𝙢𝙚𝙣𝙩 💋✨  
𝙏𝙬𝙤 𝙝𝙚𝙖𝙧𝙩𝙨, 𝙤𝙣𝙚 𝙛𝙧𝙖𝙢𝙚. ❤️

𝙐𝙨𝙚𝙧: @${tag}
𝘾𝙧𝙚𝙖𝙩𝙤𝙧: 𝙅𝙤𝙮 𝘼𝙝𝙢𝙚𝙙
╰╼|━━━━━━━━━━━━━━|╾╯`,
    mentions: [{ tag, id: mention }],
    attachment: fs.createReadStream(path)
  }, threadID, () => fs.unlinkSync(path), messageID));
};
