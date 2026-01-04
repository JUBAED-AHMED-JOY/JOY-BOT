module.exports.config = {
  name: "sendfile",
  version: "1.0.1",
  permission: 2,
  credits: "Joy",
  description: "Send command file",
  prefix: true,
  category: "with prefix",
  usages: "file name",
  cooldowns: 5,
  dependencies: {
    "path": "",
    "fs-extra": "",
    "string-similarity": ""
  }
};

module.exports.run = async ({ args, api, event, Users }) => {

  const fs = require("fs-extra");
  const stringSimilarity = require("string-similarity");

  const file = args.join(" ");
  if (!file)
    return api.sendMessage("File name cannot be empty", event.threadID, event.messageID);

  if (!file.endsWith(".js"))
    return api.sendMessage("Only .js file allowed", event.threadID, event.messageID);

  // ===== Reply mode (send to user inbox) =====
  if (event.type === "message_reply") {
    const uid = event.messageReply.senderID;
    const name = (await Users.getData(uid)).name;

    if (!fs.existsSync(__dirname + "/" + file)) {
      let mdl = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));
      mdl = mdl.map(i => i.replace(".js", ""));

      const checker = stringSimilarity.findBestMatch(file.replace(".js",""), mdl);
      const search = checker.bestMatch.rating >= 0.5 ? checker.bestMatch.target : null;

      if (!search)
        return api.sendMessage("🔎 File not found: " + file, event.threadID, event.messageID);

      return api.sendMessage(
        `🔎 File not found: ${file}\n🔎 Similar file: ${search}.js\n» React to receive it`,
        event.threadID,
        (err, info) => {
          global.client.handleReaction.push({
            type: "user",
            name: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            file: search,
            uid,
            namee: name
          });
        },
        event.messageID
      );
    }

    fs.copyFileSync(__dirname + "/" + file, __dirname + "/" + file.replace(".js", ".txt"));
    return api.sendMessage(
      {
        body: `» File ${file} here you are`,
        attachment: fs.createReadStream(__dirname + "/" + file.replace(".js", ".txt"))
      },
      uid,
      () => fs.unlinkSync(__dirname + "/" + file.replace(".js", ".txt"))
    ).then(() =>
      api.sendMessage(`» Check your inbox ${name}`, event.threadID)
    );
  }

  // ===== Normal mode (send in thread) =====
  if (!fs.existsSync(__dirname + "/" + file)) {
    let mdl = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));
    mdl = mdl.map(i => i.replace(".js", ""));

    const checker = stringSimilarity.findBestMatch(file.replace(".js",""), mdl);
    const search = checker.bestMatch.rating >= 0.5 ? checker.bestMatch.target : null;

    if (!search)
      return api.sendMessage("🔎 File not found: " + file, event.threadID, event.messageID);

    return api.sendMessage(
      `🔎 File not found: ${file}\n🔎 Similar file: ${search}.js\n» React to receive it`,
      event.threadID,
      (err, info) => {
        global.client.handleReaction.push({
          type: "thread",
          name: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          file: search
        });
      },
      event.messageID
    );
  }

  fs.copyFileSync(__dirname + "/" + file, __dirname + "/" + file.replace(".js", ".txt"));
  return api.sendMessage(
    {
      body: `» File ${file} here you are`,
      attachment: fs.createReadStream(__dirname + "/" + file.replace(".js", ".txt"))
    },
    event.threadID,
    () => fs.unlinkSync(__dirname + "/" + file.replace(".js", ".txt")),
    event.messageID
  );
};

module.exports.handleReaction = ({ api, event, handleReaction }) => {
  if (event.userID !== handleReaction.author) return;

  const fs = require("fs-extra");
  const fileSend = handleReaction.file + ".js";

  fs.copyFileSync(__dirname + "/" + fileSend, __dirname + "/" + fileSend.replace(".js", ".txt"));
  api.unsendMessage(handleReaction.messageID);

  if (handleReaction.type === "user") {
    return api.sendMessage(
      {
        body: `» File ${handleReaction.file} here you are`,
        attachment: fs.createReadStream(__dirname + "/" + fileSend.replace(".js", ".txt"))
      },
      handleReaction.uid,
      () => fs.unlinkSync(__dirname + "/" + fileSend.replace(".js", ".txt"))
    );
  }

  if (handleReaction.type === "thread") {
    return api.sendMessage(
      {
        body: `» File ${handleReaction.file} here you are`,
        attachment: fs.createReadStream(__dirname + "/" + fileSend.replace(".js", ".txt"))
      },
      event.threadID,
      () => fs.unlinkSync(__dirname + "/" + fileSend.replace(".js", ".txt"))
    );
  }
};