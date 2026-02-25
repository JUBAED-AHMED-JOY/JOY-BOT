const { exec } = require('child_process');

module.exports.config = {
    name: "shell",
    version: "1.0.0",
    permission: 2,
    description: "Execute shell commands",
    prefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 3,
    category: "Utility",
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const command = args.join(" ");

    if (!command) {
        return api.sendMessage("Please provide a shell command to execute.", threadID, messageID);
    }
        const teh = await api.sendMessage("Processing", threadID, messageID);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return api.editMessage(`Error: ${error.message}`, teh.messageID ,threadID, messageID);
        }
        if (stderr) {
            return api.editMessage(`Stderr: ${stderr}`, teh.messageID, threadID, messageID);
        }
        api.editMessage(`${stdout}`, teh.messageID, threadID, messageID);
    });
};
