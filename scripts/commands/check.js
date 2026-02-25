const axios = require('axios');

module.exports.config = {
    name: "check",
    version: "1.0.0",
    hasPermission: 0,
    description: "Get detailed information from the URL checker API",
    prefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 3,
    category: "Utility",
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
        return api.sendMessage("Please provide a URL to check.", threadID, messageID);
    }

    const url = args[0];
             const checking = await api.sendMessage("Checking.....", event.threadID, event.messageID);
    try {
        const response = await axios.get(`https://joncll.serv00.net/checker.php?url=${url}`);
        const data = response.data;

        const statusCode = data.status_code;
        const headers = data.headers;
        const ipAddress = data.ip_address;

        let emoji;
        if (statusCode === "200") {
            emoji = "🟢";
        } else if (statusCode.startsWith("4") || statusCode.startsWith("5")) {
            emoji = "🔴";
        } else {
            emoji = "🟠";
        }

        const message = `
            ${emoji} Status Code: ${statusCode}
           🌐 IP Address: ${ipAddress}
           📭 Headers:
            ${Object.entries(headers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
        `;

        api.editMessage(message, checking.messageID, threadID, messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage(error.message, threadID, messageID);
    }
};
