module.exports.config = {
    name: "bangla",
    version: "1.0.3",
    permission: 0,
    credits: "Joy Ahmed",
    prefix: true,
    description: "Translate any text or replied message into your desired language stylishly!",
    category: "utility",
    usages: "[text] or reply to a message [-> language]",
    cooldowns: 5,
    dependencies: {
        "request": ""
    }
};

module.exports.run = async ({ api, event, args }) => {
    const request = global.nodemodule["request"];
    var content = args.join(" ");
    
    if (content.length == 0 && event.type != "message_reply") {
        return api.sendMessage("✨ 𝗣𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐬𝐨𝐦𝐞 𝐭𝐞𝐱𝐭 𝐨𝐫 𝐫𝐞𝐩𝐥🇾 𝐭𝐨 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐭𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐞! 🚀", event.threadID, event.messageID);
    }
    
    var translateThis = content.slice(0, content.indexOf(" ->"));
    var lang = content.substring(content.indexOf(" -> ") + 4);
    
    if (event.type == "message_reply") {
        translateThis = event.messageReply.body;
        if (content.indexOf("-> ") !== -1) lang = content.substring(content.indexOf("-> ") + 3);
        else lang = 'bn';
    }
    else if (content.indexOf(" -> ") == -1) {
        translateThis = content.slice(0, content.length);
        lang = 'bn';
    }
    
    return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), (err, response, body) => {
        if (err) return api.sendMessage("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐭𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐧𝐠!", event.threadID, event.messageID);
        
        try {
            var retrieve = JSON.parse(body);
            var text = '';
            retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
            var fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];
            
            // Messenger Update Anujayi Choto Line Box
            var stylishMessage = 
                `─── 🌐 𝗧𝗥𝗔𝗡𝗦𝗟𝗔𝗧𝗜𝗢𝗡 ───\n` +
                `📝 ${text}\n` +
                `─────────────────\n` +
                `🔍 ${fromLang.toUpperCase()} ➔ ${lang.toUpperCase()} | 💻 Joy Ahmed`;

            api.sendMessage(stylishMessage, event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage("⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐩𝐚𝐫𝐬𝐞 𝐭𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧 𝐝𝐚𝐭𝐚!", event.threadID, event.messageID);
        }
    });
};
