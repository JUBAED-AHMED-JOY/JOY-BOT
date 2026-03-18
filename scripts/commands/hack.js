module.exports.config = {
  name: "hack", 
  version: "1.0.1", 
  permission: 0,
  credits: "Joy",
  description: "Canvas hack image with reply support",
  prefix: true,
  category: "Fun", 
  usages: "[tag/reply]", 
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  }
};

module.exports.wrapText = (ctx, name, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(name).width < maxWidth) return resolve([name]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = name.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
} 

module.exports.run = async function ({ args, Users, api, event }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");
  const { threadID, messageID, senderID, messageReply, type, mentions } = event;

  let pathImg = __dirname + `/cache/hack_${Date.now()}.png`;
  let pathAvt1 = __dirname + `/cache/avt_${Date.now()}.png`;

  // আইডি নির্ধারণ: রিপ্লাই থাকলে তার আইডি, না থাকলে মেনশন, না থাকলে নিজের আইডি
  let id;
  if (type == "message_reply") {
    id = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    id = Object.keys(mentions)[0];
  } else {
    id = senderID;
  }

  try {
    var name = await Users.getNameUser(id);
    var background = ["https://drive.google.com/uc?id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ"];
    var rd = background[Math.floor(Math.random() * background.length)];

    // প্রোফাইল পিকচার এবং ব্যাকগ্রাউন্ড ডাউনলোড
    let getAvtmot = (await axios.get(`https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    let getbackground = (await axios.get(`${rd}`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);

    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#1878F3";
    ctx.textAlign = "start";

    const lines = await this.wrapText(ctx, name, 1160);
    ctx.fillText(lines.join('\n'), 200, 497); // নাম বসানো
    
    ctx.drawImage(baseAvt1, 83, 437, 100, 101); // গোল বা চারকোনা অবতার বসানো

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    
    return api.sendMessage({ body: `এই যে আপনার হ্যাক রিপোর্ট!`, attachment: fs.createReadStream(pathImg) }, threadID, () => {
      if(fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      if(fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
    }, messageID);

  } catch (error) {
    console.log(error);
    return api.sendMessage("কিছু একটা ভুল হয়েছে, আবার চেষ্টা করো।", threadID, messageID);
  }
};
