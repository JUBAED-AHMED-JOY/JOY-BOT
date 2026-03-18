module.exports.config = {
  name: "murgi",
  version: "1.2.0",
  permission: 2,
  credits: "JOY",
  prefix: true,
  description: "Reply or tag someone to roast with full list",
  category: "prefix",
  usages: "[tag/reply]",
  cooldowns: 5
};

module.exports.run = async function({ api, args, event }) {
  const { threadID, messageID, type, messageReply, mentions } = event;

  let targetID, name;

  
  if (type == "message_reply") {
    targetID = messageReply.senderID;
    name = "ওই মাদারচোদ"; 
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    name = mentions[targetID].replace("@", "");
  } else {
    return api.sendMessage("কাউকে তো মেনশন কর বা রিপ্লাই দে", threadID, messageID);
  }

  var arraytag = [{ id: targetID, tag: name }];
  var a = function(msg) { api.sendMessage(msg, threadID); };

  a("চুদা লো শুরু করলাম...");

  

  setTimeout(() => { a({ body: "খাংকির পোলা তর মারে চুদি 🥰। " + name, mentions: arraytag }) }, 3000);
  setTimeout(() => { a({ body: "খাংকির পোলা তর কচি বোন রে চুদি 😍.. " + name, mentions: arraytag }) }, 5000);
  setTimeout(() => { a({ body: "মাদারচোদ তর আম্মু পম পম খাংকির পো 🐰 " + name, mentions: arraytag }) }, 7000);
  setTimeout(() => { a({ body: "খাংকির পোলা তর কচি ভুদায় ভুদায় কামর দিমু 💔! " + name, mentions: arraytag }) }, 9000);
  setTimeout(() => { a({ body: "খাংকি মাগির পোলা কথা ক কম কম তর আম্মু রে চুদে বানামু আইটেম বোম " + name, mentions: arraytag }) }, 12000);
  setTimeout(() => { a({ body: "depression থেকেও তর মাইরে চু*** দি 🤬 " + name, mentions: arraytag }) }, 15000);
  setTimeout(() => { a({ body: "তর আম্মু রে আচার এর লোভ দেখি চুদি মাগির পোলা🤬 " + name, mentions: arraytag }) }, 17000);
  setTimeout(() => { a({ body: "বান্দির পোলা তর কচি বোনের ভুদা ফাক কর থুতু দিয়ে ভুদায় দন ডুকামু 🤟 " + name, mentions: arraytag }) }, 20000);
  setTimeout(() => { a({ body: "বান্দি মাগির পোলা তর আম্মু রে চুদি তর দুলা ভাই এর কান্দে ফেলে 🤝 " + name, mentions: arraytag }) }, 23000);
  setTimeout(() => { a({ body: "উফফফ খাদ্দামা মাগির পোলা তর আম্মুর কালা ভুদায় আমার মাল আউট তর কচি বোন রে উপ্তা করে এবার চুদবো 💉। " + name, mentions: arraytag }) }, 25000);
  setTimeout(() => { a({ body: "অনলাইনে গালি বাজ হয়ে গেছত মাগির পোলা এমন চুদা দিমু লাইফ টাইম মনে রাখভি জয় তর বাপ মাগির ছেলে 😘। " + name, mentions: arraytag }) }, 28500);
  setTimeout(() => { a({ body: "বাতিজা শুন তর আম্মু রে চুদলে রাগ করবি না তো আচ্ছা জা রাগ করিস না তর আম্মুর কালা ভুদায় আর চুদলাম না তো বোন এর জামা টা খুলে দে ✋ " + name, mentions: arraytag }) }, 31000);
  setTimeout(() => { a({ body: "হাই মাদারচোদ তর তর ব্যাশা জাতের আম্মু টা রে আদর করে করে চুদি " + name, mentions: arraytag }) }, 36000);
  setTimeout(() => { a("~ চুদা কি আরো খাবি মাগির পোল 🤖") }, 39000);
  setTimeout(() => { a({ body: "খাংকির পোলা 🥰। " + name, mentions: arraytag }) }, 42000);
  setTimeout(() => { a({ body: "মাদারচোদ😍.. " + name, mentions: arraytag }) }, 48000);
  setTimeout(() => { a({ body: "ব্যাস্যার পোলা 🐰 " + name, mentions: arraytag }) }, 51000);
  setTimeout(() => { a({ body: "ব্যাশ্যা মাগির পোলা 💔! " + name, mentions: arraytag }) }, 54000);
  setTimeout(() => { a({ body: "পতিতা মাগির পোলা " + name, mentions: arraytag }) }, 57000);
  setTimeout(() => { a({ body: "তর মারে চুদি " + name, mentions: arraytag }) }, 63000);
  setTimeout(() => { a({ body: "নাট বল্টু মাগির পোলা🤟 " + name, mentions: arraytag }) }, 66000);
  setTimeout(() => { a({ body: "তর বোন রে পায়জামা খুলে চুদি 🤣 " + name, mentions: arraytag }) }, 69000);
  setTimeout(() => { a({ body: "উম্মম্মা তর বোন এরকচি ভুদায়💉। " + name, mentions: arraytag }) }, 72000);
  setTimeout(() => { a({ body: "DNA টেষ্ট করা দেখবি আমার চুদা তেই তর জন্ম। " + name, mentions: arraytag }) }, 75000);
  setTimeout(() => { a({ body: "কামলা মাগির পোলা ✋ " + name, mentions: arraytag }) }, 81000);
  setTimeout(() => { a({ body: "বাস্ট্রাড এর বাচ্ছা বস্তির পোলা " + name, mentions: arraytag }) }, 87000);
  setTimeout(() => { a("~ আমার জারজ শন্তান🤖") }, 93000);
  setTimeout(() => { a({ body: "Welcome মাগির পোলা 🥰। " + name, mentions: arraytag }) }, 99000);
  setTimeout(() => { a({ body: "তর কচি বোন এর পম পম😍.. " + name, mentions: arraytag }) }, 105000);
  setTimeout(() => { a({ body: "ব্যাস্যার পোলা কথা শুন তর আম্মু রে চুদি গামছা পেচিয়ে🐰 " + name, mentions: arraytag }) }, 111000);
  setTimeout(() => { a({ body: "Hi জয় এর জারজ মাগির পোলা 💔! " + name, mentions: arraytag }) }, 114000);
  setTimeout(() => { a({ body: "২০ টাকা এ পতিতা মাগির পোলা " + name, mentions: arraytag }) }, 120000);
  setTimeout(() => { a({ body: "বস্তির ছেলে অনলাইনের কিং " + name, mentions: arraytag }) }, 132000);
  setTimeout(() => { a({ body: "টুকাই মাগির পোলা🤟 " + name, mentions: arraytag }) }, 138000);
  setTimeout(() => { a({ body: "তর আম্মু রে পায়জামা খুলে চুদি 🤣 " + name, mentions: arraytag }) }, 144000);
  setTimeout(() => { a({ body: "হিজলা মাগির পোলা ✋ " + name, mentions: arraytag }) }, 162000);
  setTimeout(() => { a({ body: "বস্তিরন্দালাল এর বাচ্ছা বস্তির পোলা " + name, mentions: arraytag }) }, 168000);
  setTimeout(() => { a("~ আমার জারজ শন্তান জা ভাগ🤖") }, 171000);
  setTimeout(() => { a({ body: "তোর বাপে তোর নানা। 🤬 " + name, mentions: arraytag }) }, 175000);
  setTimeout(() => { a({ body: "বস্তির ছেলে তোর বইনরে মুসলমানি দিমু। " + name, mentions: arraytag }) }, 180000);
  setTimeout(() => { a({ body: "তোর মুখে হাইগ্যা দিমু। 🤣 " + name, mentions: arraytag }) }, 185000);
  setTimeout(() => { a({ body: "তর আম্মুর হোগা দিয়া ট্রেন ভইরা দিমু।। " + name, mentions: arraytag }) }, 190000);
  setTimeout(() => { a({ body: "কুত্তার বাচ্ছা তর বৌন ভোদায় মাগুর মাছ চাষ করুম।😍.. " + name, mentions: arraytag }) }, 195000);
  setTimeout(() => { a({ body: "তর মায়ের ভোদা বোম্বাই মরিচ দিয়া চুদামু।💔! " + name, mentions: arraytag }) }, 200000);
  setTimeout(() => { a({ body: "জং ধরা লোহা দিয়া পাকিস্তানের মানচিত্র বানাই্য়া তোদের পিছন দিয়া ঢুকামু।🤬 " + name, mentions: arraytag }) }, 205000);
  setTimeout(() => { a({ body: "তর মায়ের ভুদাতে পোকা। " + name, mentions: arraytag }) }, 210000);
  setTimeout(() => { a({ body: "তর মার ভোদায় পাব্লিক টয়লেট।🤟 " + name, mentions: arraytag }) }, 215000);
  setTimeout(() => { a("~ আমার পুত। জা ভাগ🤖") }, 220000);
};
