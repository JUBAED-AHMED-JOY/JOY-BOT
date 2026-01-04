const moment = require("moment");

module.exports.config = {
  name: "boyos",
  version: "1.0.1",
  permission: 0,
  credits: "JOY",
  description: "জন্ম তারিখ থেকে বয়স হিসাব করো",
  prefix: true,
  category: "utility",
  usages: "[DD/MM/YYYY]",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0]) {
      return api.sendMessage(
        "╭╼|━━━━━━━━━━━━━━|╾╮\n" +
        " জন্ম তারিখ লিখুন!\n উদাহরণ: boyos 05/07/2008\n" +
        "╰╼|━━━━━━━━━━━━━━|╾╯",
        event.threadID, event.messageID
      );
    }

    const dob = moment(args[0], "DD/MM/YYYY", true);
    if (!dob.isValid()) {
      return api.sendMessage(
        "╭╼|━━━━━━━━━━━━━━|╾╮\n" +
        " ভুল তারিখ ফরম্যাট!\n ফরম্যাট: DD/MM/YYYY\n" +
        "╰╼|━━━━━━━━━━━━━━|╾╯",
        event.threadID, event.messageID
      );
    }

    const today = moment();
    const years = today.diff(dob, "years");
    const months = today.diff(dob, "months") % 12;
    const days = today.diff(dob.add(years, "years").add(months, "months"), "days");

    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n` +
      ` আপনার বয়স: ${years} বছর, ${months} মাস, ${days} দিন\n` +
      `╰╼|━━━━━━━━━━━━━━|╾╯`,
      event.threadID, event.messageID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage("কিছু ভুল হয়েছে!", event.threadID, event.messageID);
  }
};
