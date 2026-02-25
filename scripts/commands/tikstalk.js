module.exports.config = {
  name: "tikstalk",
  version: "1.0.0",
  hasPermssion: "0",
  credits: "Jonell Magallanes", 
  description: "tiktok stalk",
  prefix: true,
  category: "tiktok",
  usage: "[tikstalk username]",
  cooldowns: 5,
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function ({ api, event, args }) {
  const tiktokusername = args[0];
  if (!tiktokusername) return api.sendMessage("Please provide a TikTok username.", event.threadID, event.messageID);
       const lods = await api.sendMessage(" Getting User From Tiktok.....", event.threadID, event.messageID);
  try {
    const res = await axios.get(`https://ccprojectapis.ddns.net/api/tikstalk?unique_id=${tiktokusername}`);
    const data = res.data;

    const filePath = path.resolve(__dirname, 'cache', `${data.username}_avatar.jpg`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: data.avatarLarger,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `𝗧𝗶𝗸𝘁𝗼𝗸 𝗦𝘁𝗮𝗹𝗸 𝗨𝘀𝗲𝗿\n━━━━━━━━━━━━━━━━━━\nID: ${data.id}\nNickname: ${data.nickname}\nUsername: ${data.username}\nSignature: ${data.signature}\nVideo Count: ${data.videoCount}\nFollowing Count: ${data.followingCount}\nFollower Count: ${data.followerCount}\nHeart Count: ${data.heartCount}\n━━━━━━━━━━━━━━━━━━\n`,
        attachment: fs.createReadStream(filePath),
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });
     api.unsendMessage(lods.messageID);
    writer.on('error', (err) => {
      console.error("Failed to write file:", err);
      api.sendMessage(error.message, event.threadID, event.messageID);
    });
  } catch (error) {
    console.error(error.message);
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
};
