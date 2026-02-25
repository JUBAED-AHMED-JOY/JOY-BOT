const axios = require('axios');
const path = require('path');

module.exports.config = {
    name: "shoti",
    version: "1.0.0",
    hasPermission: 0,
    description: "random video from Shoti API By Lib API",
    prefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 10,
    category: "Media",
};

module.exports.run = async function ({ api, event }) {
    try {
        const sending = await api.sendMessage("⏱️ | Sending Shoti Video Please Wait....", event.threadID, event.messageID);

        const response = await axios.get('https://ccprojectapis.ddns.net/api/shoti-v2');
        const data = response.data;

        if (data.status === true) {
            const { videoDownloadLink, title, tiktokUrl } = data;

            const videoStream = await axios({
                url: videoDownloadLink,
                method: 'GET',
                responseType: 'stream'
            });

            api.unsendMessage(sending.messageID);

            const message = `✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗦𝗵𝗼𝘁𝗶\n━━━━━━━━━━━━━━━━━━\nTitle: ${title}\nTikTok URL: ${tiktokUrl}\n`;

            api.sendMessage({
                body: message,
                attachment: videoStream.data  
            }, event.threadID, event.messageID);

        } else {
            api.sendMessage("Failed to retrieve video. Please try again later.", event.threadID, event.messageID);
        }

    } catch (error) {
        console.error('Error fetching video:', error);
        api.sendMessage(error.message, event.threadID, event.messageID);
    }
};
