module.exports.config = {
    name: "ck",
    version: "1.2.0",
    permission: 0,
    credits: "Joy",
    prefix: true,
    description: "Reply or tag to get user info",
    category: "Media",
    usages: "[reply/tag/box/admin]",
    cooldowns: 4,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "request": ""
    }
};

module.exports.run = async ({ api, event, args }) => {
    const fs = require("fs-extra");
    const request = require("request");
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;

    // ১. আইডি নির্ধারণ লজিক (Priority: Reply > Mention > Sender)
    let id;
    if (type == "message_reply") {
        id = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
        id = Object.keys(mentions)[0];
    } else if (args[0] == "box") {
        return await getBoxInfo(api, event, args); // Box info এর জন্য আলাদা ফাংশন নিচে
    } else if (args[0] == "admin") {
        return await getAdminInfo(api, event); // Admin info এর জন্য আলাদা ফাংশন নিচে
    } else {
        id = senderID;
    }

    // ২. ইউজার ইনফরমেশন ফেচ করা
    try {
        let info = await api.getUserInfo(id);
        let user = info[id];
        let name = user.name;
        let gender = user.gender == 2 ? "পুরুষ" : user.gender == 1 ? "মহিলা" : "অজানা";
        let friend = user.isFriend ? "হ্যাঁ" : "না";
        let vanity = user.vanity || "নেই";

        let path = __dirname + `/cache/info_${id}.png`;
        let msg = `📝 নাম: ${name}\n🆔 UID: ${id}\n🔗 ইউজারনেম: ${vanity}\n🚻 লিঙ্গ: ${gender}\n🤝 বটের বন্ধু: ${friend}\n🌐 প্রোফাইল লিঙ্ক: fb.com/${id}`;
        
        let callback = () => api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);
        return request(encodeURI(`https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)).pipe(fs.createWriteStream(path)).on('close', callback);
    } catch (err) {
        return api.sendMessage("ইউজার আইডি পাওয়া যায়নি।", threadID, messageID);
    }
};

// --- আলাদা ফাংশনসমূহ কোড ক্লিন রাখার জন্য ---

async function getBoxInfo(api, event, args) {
    const fs = require("fs-extra");
    const request = require("request");
    let targetTID = args[1] || event.threadID;
    try {
        let threadInfo = await api.getThreadInfo(targetTID);
        let male = threadInfo.userInfo.filter(u => u.gender === "MALE").length;
        let female = threadInfo.userInfo.filter(u => u.gender === "FEMALE").length;
        let msg = `🏠 গ্রুপ: ${threadInfo.threadName}\n🆔 TID: ${targetTID}\n📊 মেম্বার: ${threadInfo.participantIDs.length}\n👦 ছেলে: ${male} | 👧 মেয়ে: ${female}`;
        
        if (!threadInfo.imageSrc) return api.sendMessage(msg, event.threadID);
        let path = __dirname + "/cache/box.png";
        return request(encodeURI(threadInfo.imageSrc)).pipe(fs.createWriteStream(path)).on('close', () => api.sendMessage({body: msg, attachment: fs.createReadStream(path)}, event.threadID, () => fs.unlinkSync(path)));
    } catch(e) { api.sendMessage("তথ্য মেলেনি।", event.threadID); }
}

async function getAdminInfo(api, event) {
    const fs = require("fs-extra");
    const request = require("request");
    let msg = `👤 এডমিন: Joy Ahmed\n🔗 লিঙ্ক: fb.com/100003661522127`;
    let path = __dirname + "/cache/admin.png";
    return request(encodeURI(`https://graph.facebook.com/100003661522127/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)).pipe(fs.createWriteStream(path)).on('close', () => api.sendMessage({body: msg, attachment: fs.createReadStream(path)}, event.threadID, () => fs.unlinkSync(path)));
}
