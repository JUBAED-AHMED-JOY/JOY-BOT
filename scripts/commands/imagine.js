const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "imagine",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Jonell Magallanes",
  description: "Generates an AI Image based on prompt",
  prefix: false,
  category: "media",
  usages: "[prompt]",
  cooldowns: 9
};

module.exports.run = async function ({ api, event, args, actions }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) return api.sendMessage("Please provide a prompt for the image.", threadID, messageID);
      api.setMessageReaction("📝", messageID, () => {}, true);


  const imagePath = path.join(__dirname, 'cache', 'imagine.png');
  if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });

  try {
    const response = await axios.get(`https://ccprojectapis.ddns.net/api/flux?prompt=${encodeURIComponent(prompt)}`, {
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(imagePath, response.data);

      api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage({
      attachment: fs.createReadStream(imagePath)
    }, threadID, messageID);

  } catch (error) {
    console.error("Error generating image:", error);
    api.sendMessage(`❌ An error occurred: ${error.message}`, threadID, messageID);
  }
};
