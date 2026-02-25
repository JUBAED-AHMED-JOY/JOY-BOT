module.exports.config = {
 name: "tid",
 version: "1.0.0",
    hasPermssion: 0,
    description: "get thread id",
    credits: "jonell magallanes",
    prefix: true,
    hide: true,
    category: "System",
    cooldowns: 0,
  };
module.exports.run = async function ({ api, event }) { 
    const tid = event.threadID;
    api.sendMessage(tid, event.threadID);
    };


