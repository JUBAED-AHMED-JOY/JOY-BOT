const fs = require("fs-extra");
const axios = require("axios");
const jimp = require("jimp");
const path = require("path");

module.exports = {
  config: {
    name: "toilet",
    version: "1.0.0",
    permission: 0,
    credits: "Joy Ahmed",
    description: "🪠 টয়লেটে পাঠাও কারোেেেেেেে",
    prefix: true,
    category: "fun",
    usages: "@mention",
    cooldowns: 5,
    dependencies: {
      "fs-extra": "",
      "axios": "",
      "canvas": "",
      "jimp": "",
      "node-superfetch": ""
    }
  },

  onLoad: async function () {
    const imgPath = path.join(__dirname, "cache", "toilet.png");
    if (!fs.existsSync(imgPath)) {
      fs.mkdirSync(path.dirname(imgPath), { recursive: true });
      const imgUrl = "https://drive.google.com/uc?id=13ZqFryD-YY-JTs34lcy6b_w36UCCk0EI&export=download";
      const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(res.data));
    }
  },

  run: async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions } = event;
    const tagUID = Object.keys(mentions)[0];

    if (!tagUID)
      return api.sendMessage("⚠️ একজনকে ট্যাগ করো!", threadID, messageID);

    const toiletImage = await makeToiletImage(senderID, tagUID);
    const amount = Math.floor(Math.random() * 101) * (Math.floor(Math.random() * 100000) + 100000);
    await Currencies.increaseMoney(senderID, amount);

    const message = 
`╭╼|━━━━━━━━━━━━━━|╾╮
➤ ⌨️ 𝙏𝙤𝙞𝙡𝙚𝙩 𝙀𝙙𝙞𝙩𝙞𝙤𝙣 ⌨️
➤ 😹 বেশি বাল পাকলামির কারণে তোমারে টয়লেটে ফেলে দিলাম!
➤ 💩 লে গু খা, ঠেলা বুঝ!
╰╼|━━━━━━━━━━━━━━|╾╯

🪪 𝘾𝙧𝙚𝙖𝙩𝙤𝙧 ━➤ 𝙅𝙤𝙮 𝘼𝙝𝙢𝙚𝙙`;

    return api.sendMessage({
      body: message,
      attachment: fs.createReadStream(toiletImage)
    }, threadID, () => fs.unlinkSync(toiletImage), messageID);
  }
};

async function makeToiletImage(uid1, uid2) {
  const imgPath = path.join(__dirname, "cache", "toilet.png");
  const pathAvt1 = path.join(__dirname, "cache", `avt_${uid1}.png`);
  const pathAvt2 = path.join(__dirname, "cache", `avt_${uid2}.png`);
  const pathImg = path.join(__dirname, "cache", `toilet_${uid1}_${uid2}.png`);

  const getAvatar = async (uid, pathSave) => {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(pathSave, Buffer.from(res.data, "utf-8"));
  };

  await getAvatar(uid1, pathAvt1);
  await getAvatar(uid2, pathAvt2);

  const baseImg = await jimp.read(imgPath);
  const avt1 = await jimp.read(await circle(pathAvt1));
  const avt2 = await jimp.read(await circle(pathAvt2));

  baseImg.resize(292, 345);
  avt1.resize(70, 70);
  avt2.resize(70, 70);

  baseImg.composite(avt1, 100, 200);
  baseImg.composite(avt2, 100, 200);

  const finalImg = await baseImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, finalImg);
  fs.unlinkSync(pathAvt1);
  fs.unlinkSync(pathAvt2);
  return pathImg;
}

async function circle(imagePath) {
  const img = await jimp.read(imagePath);
  img.circle();
  return await img.getBufferAsync("image/png");
}
