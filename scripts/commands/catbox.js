module.exports.config = {
    name: "catbox",
    version: "1.2.0",
    permission: 0,
    credits: "Joy",
    description: "Upload replied image/video to Catbox",
    prefix: true,
    category: "tools",
    usages: "/catbox (reply image/video)",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "axios": "",
        "form-data": ""
    }
};

module.exports.run = async function({ api, event }) {
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const FormData = require("form-data");

    const { threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
        return api.sendMessage("❌ Reply to an image or video to upload it to Catbox.", threadID, messageID);

    // Get the first attachment
    const attachment = messageReply.attachments[0];
    const fileUrl = attachment.url;
    const fileName = path.basename(fileUrl);
    const tempFile = path.resolve(__dirname, fileName);

    try {
        // Download the file
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        await fs.writeFile(tempFile, response.data);

        // Prepare FormData
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("userhash", "");
        form.append("fileToUpload", fs.createReadStream(tempFile));

        // Upload to Catbox
        const res = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity
        });

        // Delete temp file
        await fs.unlink(tempFile);

        return api.sendMessage(`✅ File uploaded successfully:\n${res.data}`, threadID, messageID);

    } catch (err) {
        console.error(err.response?.data || err.message || err);
        if (fs.existsSync(tempFile)) await fs.unlink(tempFile);
        return api.sendMessage("❌ Error uploading file to Catbox.", threadID, messageID);
    }
};