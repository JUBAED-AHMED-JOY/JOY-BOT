const axios = require('axios');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "rnd",
  version: "6.9",
  permission: 0,
  prefix: true,
  credits: "Romeo",
  description: "Random video database operations",
  category: "user",
  usages: "[=] or [name] or [help] or [add] or [remove]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "request": "",
    "fs-extra": ""
  }
};



module.exports.run = async function({ api, event, args }) {
  
  if (args[0]?.toLowerCase() === 'help') {
    return api.sendMessage(
      `📝 Random Video Commands:\n\n` +
      `• ${global.config.PREFIX}rnd = - Get a random video\n` +
      `• ${global.config.PREFIX}rnd [name] - Get a random video by name\n` +
      `• ${global.config.PREFIX}rnd add [name] - Reply to a video to add it\n` +
      `• ${global.config.PREFIX}rnd remove [id/url] - Remove a video`,
      event.threadID,
      event.messageID
    );
  }

  try {
    
    const apis = await axios.get('https://raw.githubusercontent.com/romeoislamrasel/romeobot/main/api.json');
    const apiUrl = apis.data.api;

    
    if (args[0]?.toLowerCase() === 'add') {
      if (args.length !== 2) {
        return api.sendMessage(`Invalid number of arguments. Usage: Reply to a video then type ${global.config.PREFIX}rnd add [your name]`, event.threadID, event.messageID);
      }

      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage('Please reply to a video file.', event.threadID, event.messageID);
      }

      const videoAttachments = event.messageReply.attachments.filter(att => att.type === 'video');
      
      if (videoAttachments.length === 0) {
        return api.sendMessage('The reply must contain a video file.', event.threadID, event.messageID);
      }

      try {
        const uploadedVideos = await Promise.all(videoAttachments.map(async (video) => {
          try {
            const encodedUrl = encodeURIComponent(video.url.replace(/\s/g, ''));
            const imgurResult = await axios.get(`${apiUrl}/api/imgur?url=${encodedUrl}`);
            if (!imgurResult.data.url) {
              throw new Error('Failed to upload video to imgur');
            }
            return imgurResult.data.url;
          } catch (error) {
            console.error('Video upload error:', error);
            throw new Error(`Failed to upload video: ${error.message}`);
          }
        }));

        const name = args[1];
        const res = await axios.get(`${apiUrl}/api/random/add?name=${encodeURIComponent(name)}&url=${encodeURIComponent(uploadedVideos.join('\n'))}`);

        if (!res.data) {
          throw new Error('No response from server');
        }

        let messageBody = `📩 Message: ${res.data.msg || 'Videos added successfully'}\n📛 Name: ${name}\n\n📹 Videos Added:\n`;
        
        if (res.data.data && res.data.data.videos) {
          res.data.data.videos.forEach((video, index) => {
            messageBody += `\n${index + 1}. ID: ${video.id}\n   URL: ${video.url}\n`;
          });
        } else {
          messageBody += uploadedVideos.map((url, index) => `\n${index + 1}. URL: ${url}`).join('\n');
        }

        return api.sendMessage(messageBody, event.threadID, event.messageID);
      } catch (error) {
        console.error('Command error:', error);
        throw error;
      }
    }

    
    if (args[0]?.toLowerCase() === 'remove') {
      if (args.length < 2) {
        return api.sendMessage(`❌ Please provide an ID or URL. Usage: ${global.config.PREFIX}rnd remove [id/url]`, event.threadID, event.messageID);
      }
      
      try {
        const idOrUrl = args.slice(1).join(" ");
        const res = await axios.get(`${apiUrl}/api/random/remove?id=${encodeURIComponent(idOrUrl)}`);
        return api.sendMessage(res.data.msg || `✅ Video removed successfully\nID/URL: ${idOrUrl}`, event.threadID, event.messageID);
      } catch (error) {
        throw error;
      }
    }

   
    try {
      const name = args[0] === '=' ? '' : args.join(" ");
      const url = `${apiUrl}/api/random${name ? `?name=${encodeURIComponent(name)}` : ''}`;

      const res = await axios.get(url);
      const { data } = res.data;
      const { name: videoName, cp, length, url: videoUrl } = data;

      if (!videoUrl) {
        throw new Error("No video URL received from API");
      }

      const filePath = path.join(__dirname, "cache", "video.mp4");
      const file = fs.createWriteStream(filePath);

      return new Promise((resolve, reject) => {
        request(videoUrl)
          .pipe(file)
          .on("error", (err) => {
            console.error("Error downloading video:", err);
            reject(new Error("Failed to download video"));
          })
          .on("close", async () => {
            try {
              if (!fs.existsSync(filePath)) {
                throw new Error("Video file was not created");
              }

              const fileSize = fs.statSync(filePath).size;
              if (fileSize === 0) {
                throw new Error("Downloaded video file is empty");
              }

              let message = cp || "Random video";
              if (videoName) message += `\n\n📛 Name: ${videoName}`;
              message += `\n📹 Total Videos: ${length}`;

              await api.sendMessage({
                body: message,
                attachment: fs.createReadStream(filePath)
              }, event.threadID, event.messageID);
              
              resolve();
            } catch (err) {
              console.error("Error sending message:", err);
              reject(err);
            } finally {
              try {
                fs.unlinkSync(filePath);
              } catch (err) {
                console.error("Error cleaning up file:", err);
              }
            }
          });
      });
    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('Random command error:', error);
    return api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};
