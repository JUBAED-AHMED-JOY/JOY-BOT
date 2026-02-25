const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "autoreact",
  version: "1.2",
  permission: 0,
  credits: "Jonell Magallanes",
  description: "Auto react based on the context of users",
  prefix: true,
  category: "No Prefix",
  usage: "Type ?autoreact on or ?autoreact off to enable or disable the feature.",
  cooldowns: 3,
};

const autoreactFilePath = path.join(__dirname, 'autoreact.txt');

module.exports.handleEvent = async function ({ api, event }) {
  if (event.body !== null && event.isGroup && (!event.attachments || event.attachments.length === 0)) {
    let autoreactStatus = 'off';
    if (fs.existsSync(autoreactFilePath)) {
      autoreactStatus = fs.readFileSync(autoreactFilePath, 'utf8').trim();
    }

    if (autoreactStatus === 'on') {
      axios.get(`https://ccprojectapis.ddns.net/api/message/emoji?text=${encodeURIComponent(event.body)}`)
        .then(response => {
          const emoji = response.data.emoji;
          api.setMessageReaction(emoji, event.messageID, () => { }, true);
        })
        .catch(error => {
          console.error('Error fetching auto reaction:', error);
        });
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const option = args[0]?.toLowerCase();

  if (option === 'on') {
    fs.writeFileSync(autoreactFilePath, 'on', 'utf8');
    api.sendMessage('Auto react has been enabled.', event.threadID);
  } else if (option === 'off') {
    fs.writeFileSync(autoreactFilePath, 'off', 'utf8');
    api.sendMessage('Auto react has been disabled.', event.threadID);
  } else {
    api.sendMessage('Invalid option. Use "?autoreact on" to enable or "?autoreact off" to disable auto reactions.', event.threadID);
  }
};
