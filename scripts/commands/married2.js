module.exports.config = {
  name: "married2", 
  version: "1.0.1", 
  permission: 0,
  credits: "Joy Ahmed",
  description: "Marriage style image with mention",
  prefix: true,
  category: "married", 
  usages: "user", 
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
  const path = resolve(__dirname, 'cache/canvas', 'marriedv02.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://drive.google.com/uc?id=1JwbtAELjXsnojVEKhxjtAzHMu3H-1PRm", path);
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"]; 
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let base_img = await jimp.read(__root + "/marriedv02.png");
  let pathImg = __root + `/married_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;
  
  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
  
  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
  
  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  base_img.composite(circleOne.resize(100, 100), 55, 48).composite(circleTwo.resize(100, 100), 190, 40);
  
  let raw = await base_img.getBufferAsync("image/png");
  
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
  var mention = Object.keys(event.mentions)[0];
  let tag = event.mentions[mention]?.replace("@", "");
  
  if (!mention) return api.sendMessage("❌ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙩𝙖𝙜 𝙤𝙣𝙚 𝙪𝙨𝙚𝙧!", threadID, messageID);
  else {
    var one = senderID, two = mention;
    return makeImage({ one, two }).then(path => api.sendMessage({
      body: `╭╼|━━━━━━━━━━━━━━|╾╮
𝙈𝙖𝙧𝙧𝙞𝙖𝙜𝙚 𝙈𝙤𝙢𝙚𝙣𝙩 💍✨  
𝙏𝙤𝙙𝙖𝙮 𝙬𝙚 𝙬𝙞𝙩𝙣𝙚𝙨𝙨 𝙩𝙝𝙚 𝙗𝙚𝙖𝙪𝙩𝙞𝙛𝙪𝙡 𝙪𝙣𝙞𝙤𝙣  
𝙤𝙛 𝙩𝙬𝙤 𝙝𝙚𝙖𝙧𝙩𝙨 ❤️  

𝙐𝙨𝙚𝙧: @${tag} 💞  
𝘾𝙧𝙚𝙖𝙩𝙤𝙧: 𝙅𝙤𝙮 𝘼𝙝𝙢𝙚𝙙
╰╼|━━━━━━━━━━━━━━|╾╯`,
      mentions: [{
        tag: tag,
        id: mention
      }],
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID));
  }
};
