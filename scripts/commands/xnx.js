const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "xnx",
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
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = resolve(__dirname, "cache", "canvas");
  const pathImg = resolve(dirMaterial, "Xnx.png");
  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(pathImg)) await downloadFile("https://drive.google.com/uc?id=1DPUFsT7-FMFx1tgmV8_zqAuZmTUHdmU8", pathImg);
};

async function circle(image) {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let baseImage = await jimp.read(__root + "/Xnx.png");
  let pathImg = __root + `/xnx_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  try {
    let getAvatarOne = (await axios.get(
      `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, "utf-8"));

    let getAvatarTwo = (await axios.get(
      `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, "utf-8"));
  } catch (e) {
    throw new Error("Failed to download avatars.");
  }

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));

  baseImage
    .resize(500, 500)
    .composite(circleOne.resize(100, 100), 360, 28)
    .composite(circleTwo.resize(70, 70), 131, 165);

  let raw = await baseImage.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

module.exports.run = async function ({ event, api }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID, mentions } = event;

  if (!mentions || Object.keys(mentions).length === 0)
    return api.sendMessage("❗ Please mention 1 person.", threadID, messageID);

  const mentionID = Object.keys(mentions)[0];
  const mentionName = mentions[mentionID].replace("@", "");

  try {
    const imagePath = await makeImage({ one: senderID, two: mentionID });
    return api.sendMessage(
      {
        body: `╭╼|━━━━━━━━━━━━━━|╾╮\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        mentions: [
          {
            tag: mentionName,
            id: mentionID,
          },
        ],
        attachment: fs.createReadStream(imagePath),
      },
      threadID,
      () => fs.unlinkSync(imagePath),
      messageID
    );
  } catch (error) {
    return api.sendMessage(`⚠️ Error: ${error.message}`, threadID, messageID);
  }
};
