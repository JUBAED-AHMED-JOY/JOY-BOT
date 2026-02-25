module.exports.config = {
  'name': "fbcover",
  'version': "1.0.0",
  'permssion': 0,
  'credits': "Joy",
  'description': "use but can't change credit",
  'prefix': true,
  'category': "fbcover",
  'usages': "facebook cover photo make by",
  'cooldowns': 0x0,
  'dependencies': {
    'fs-extra': '',
    'request': '',
    'axios': ''
  }
};
module.exports.run = async function ({
  api: _0x16ce55,
  args: _0x817721,
  event: _0x14837d,
  permssion: _0xcdd390
}) {
  if (this.config.credits != "Joy") {
    return _0x16ce55.sendMessage("[ WARNING ] - Itz Joy Don't credits modules " + this.config.name + " was changed to " + this.config.credits + " bởi ADMINBOT " + global.config.CREDIT + " ✨ Stop now!!!", _0x14837d.threadID, _0x14837d.messageID);
  }
  const {
    threadID: _0x34d673,
    messageID: _0x118116,
    senderID: _0x1c0da4,
    body: _0x25be0b
  } = _0x14837d;
  if (!_0x817721[0]) {
    return _0x16ce55.sendMessage("আসসালামু আলাইকুম ❤️\n\n অনুগ্রহ করে টাইপ করুন /fbcover তারপর প্রাথমিক নাম লিখুন!!!", _0x34d673, _0x118116);
  } else {
    return _0x16ce55.sendMessage("আসসালামু আলাইকুম-!!🖤💫\n\n🌺আপনি প্রধান নাম চয়ন করেছেন: " + _0x817721.join(" ").toUpperCase() + "\n\n(এই বার্তার উত্তর দিন এবং আপনার দ্বিতীয় নাম নির্বাচন করুন)", _0x14837d.threadID, (_0x47c557, _0x416d87) => {
      return global.client.handleReply.push({
        'type': "tenphu",
        'name': "fbcover",
        'author': _0x1c0da4,
        'tenchinh': _0x817721.join(" ").toUpperCase(),
        'messageID': _0x416d87.messageID
      });
    }, _0x14837d.messageID);
  }
};
module.exports.handleReply = async function ({
  api: _0x19b024,
  event: _0x486714,
  args: _0x3462ad,
  handleReply: _0x1fc22d,
  client: _0x18bae6,
  __GLOBAL: _0x8c1605,
  Threads: _0x1ad1fd,
  Users: _0x40f076,
  Currencies: _0x567b41
}) {
  module.exports.circle = async _0x4e4b20 => {
    const _0x2ef512 = require("jimp");
    _0x4e4b20 = await _0x2ef512.read(_0x4e4b20);
    _0x4e4b20.circle();
    return await _0x4e4b20.getBufferAsync("image/png");
  };
  if (_0x1fc22d.author != _0x486714.senderID) {
    return;
  }
  const {
    threadID: _0x58eb76,
    messageID: _0x274e83,
    senderID: _0x5b8271,
    body: _0x418f11
  } = _0x486714;
  const {
    loadImage: _0x48e61b,
    createCanvas: _0x33aa0b
  } = require("canvas");
  const _0x2f04ce = require("fs-extra");
  const _0xa8a739 = require("axios");
  let _0x13a194 = __dirname + ("/cache/" + (_0x5b8271 + 20) + ".png");
  let _0x4af20d = __dirname + ("/cache/" + (_0x5b8271 + 30) + ".png");
  let _0x160ddd = __dirname + ("/cache/" + (_0x5b8271 + 40) + ".png");
  const _0x746464 = require("canvas");
  var _0x2bbe63 = _0x1fc22d.tenchinh;
  switch (_0x1fc22d.type) {
    case "tenphu":
      {
        var _0x2bbe63 = _0x1fc22d.tenchinh;
        _0x19b024.unsendMessage(_0x1fc22d.messageID);
        return _0x19b024.sendMessage("🌺আপনি উপ-নাম বেছে নিয়েছেন  : :" + _0x486714.body.toUpperCase() + "\n\n(এই বার্তার উত্তর আপনার ফোন নম্বর লিখুন)", _0x58eb76, function (_0x685086, _0x31f9c1) {
          return global.client.handleReply.push({
            'type': "sdt",
            'name': "fbcover",
            'author': _0x5b8271,
            'tenphu': _0x486714.body,
            'tenchinh': _0x2bbe63,
            'messageID': _0x31f9c1.messageID
          });
        }, _0x274e83);
      }
    case "sdt":
      {
        _0x19b024.unsendMessage(_0x1fc22d.messageID);
        return _0x19b024.sendMessage("🌺আপনি এইভাবে SDT নির্বাচন করেছেন: " + _0x486714.body.toUpperCase() + "\n\n(আপনার ইমেল লিখতে এই বার্তার উত্তর দিন)", _0x58eb76, function (_0x3617a9, _0x60b8ca) {
          return global.client.handleReply.push({
            'type': "email",
            'name': "fbcover",
            'author': _0x5b8271,
            'sdt': _0x486714.body,
            'tenchinh': _0x1fc22d.tenchinh,
            'tenphu': _0x1fc22d.tenphu,
            'messageID': _0x60b8ca.messageID
          });
        }, _0x274e83);
      }
    case "email":
      {
        _0x19b024.unsendMessage(_0x1fc22d.messageID);
        return _0x19b024.sendMessage("🌺 আপনি এই হিসাবে ইমেল নির্বাচন করেছেন:" + _0x486714.body.toUpperCase() + "\n\n(আপনার ঠিকানা লিখতে এই বার্তার উত্তর দিন)", _0x58eb76, function (_0x210eca, _0x525f0f) {
          return global.client.handleReply.push({
            'type': "color",
            'name': "fbcover",
            'author': _0x5b8271,
            'sdt': _0x1fc22d.sdt,
            'tenchinh': _0x1fc22d.tenchinh,
            'tenphu': _0x1fc22d.tenphu,
            'email': _0x486714.body,
            'messageID': _0x525f0f.messageID
          });
        }, _0x274e83);
      }
    case "color":
      {
        _0x19b024.unsendMessage(_0x1fc22d.messageID);
        return _0x19b024.sendMessage("🌺আপনি এই হিসাবে ঠিকানা নির্বাচন করেছেন: " + _0x486714.body.toUpperCase() + "\nআপনার কভারের ব্যাকগ্রাউন্ডের রঙ বাছাই করতে এই মেসেজ এর রিপ্লাই দিন (enter no as default color)", _0x58eb76, function (_0xb8fb15, _0x55f4f2) {
          return global.client.handleReply.push({
            'type': "create",
            'name': "fbcover",
            'author': _0x5b8271,
            'sdt': _0x1fc22d.sdt,
            'tenchinh': _0x1fc22d.tenchinh,
            'tenphu': _0x1fc22d.tenphu,
            'diachi': _0x486714.body,
            'email': _0x1fc22d.email,
            'messageID': _0x55f4f2.messageID
          });
        }, _0x274e83);
      }
    case "create":
      {
        var _0x2df4a1 = _0x486714.body;
        if (_0x2df4a1.toLowerCase() == 'no') {
          var _0x2df4a1 = "#ffffff";
        }
        var _0x3f24ba = _0x1fc22d.diachi.toUpperCase();
        var _0x6ac606 = _0x1fc22d.tenchinh.toUpperCase();
        var _0x1fea06 = _0x1fc22d.email.toUpperCase();
        var _0x1853b6 = _0x1fc22d.tenphu.toUpperCase();
        var _0xb3d99a = _0x1fc22d.sdt.toUpperCase();
        _0x19b024.unsendMessage(_0x1fc22d.messageID);
        _0x19b024.sendMessage("🖤 অনুগ্রহ করে অপেক্ষা করুন আপনার কভার তৈরি  হচ্ছে....!", _0x58eb76, (_0x283a73, _0x4528ba) => {
          setTimeout(() => {
            _0x19b024.unsendMessage(_0x4528ba.messageID);
          }, 1000);
        }, _0x274e83);
        let _0x221e9e = (await _0xa8a739.get(encodeURI("https://graph.facebook.com/" + _0x5b8271 + "/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"), {
          'responseType': "arraybuffer"
        })).data;
        let _0x878c0a = (await _0xa8a739.get(encodeURI("https://1.bp.blogspot.com/-ZyXHJE2S3ew/YSdA8Guah-I/AAAAAAAAwtQ/udZEj3sXhQkwh5Qn8jwfjRwesrGoY90cwCNcBGAsYHQ/s0/bg.jpg"), {
          'responseType': "arraybuffer"
        })).data;
        let _0x476ad2 = (await _0xa8a739.get(encodeURI("https://i.postimg.cc/HsghXQfh/20230105-163934.png"), {
          'responseType': "arraybuffer"
        })).data;
        _0x2f04ce.writeFileSync(_0x4af20d, Buffer.from(_0x221e9e, "utf-8"));
        _0x2f04ce.writeFileSync(_0x13a194, Buffer.from(_0x878c0a, "utf-8"));
        _0x2f04ce.writeFileSync(_0x160ddd, Buffer.from(_0x476ad2, "utf-8"));
        var _0x1002ef = await this.circle(_0x4af20d);
        if (!_0x2f04ce.existsSync(__dirname + "/cache/UTMAvoBold.ttf")) {
          let _0x5679d1 = (await _0xa8a739.get("https://drive.google.com/u/0/uc?id=1DuI-ou9OGEkII7n8odx-A7NIcYz0Xk9o&export=download", {
            'responseType': "arraybuffer"
          })).data;
          _0x2f04ce.writeFileSync(__dirname + "/cache/UTMAvoBold.ttf", Buffer.from(_0x5679d1, "utf-8"));
        }
        ;
        let _0x126fac = await _0x48e61b(_0x13a194);
        let _0x222b61 = await _0x48e61b(_0x1002ef);
        let _0x441ac2 = await _0x48e61b(_0x160ddd);
        let _0x46f678 = _0x33aa0b(_0x126fac.width, _0x126fac.height);
        let _0x5d359d = _0x46f678.getContext('2d');
        _0x5d359d.clearRect(0, 0, _0x46f678.width, _0x46f678.height);
        _0x5d359d.drawImage(_0x126fac, 0, 0, _0x46f678.width, _0x46f678.height);
        _0x746464.registerFont(__dirname + "/cache/UTMAvoBold.ttf", {
          'family': "UTMAvoBold"
        });
        _0x5d359d.strokeStyle = "rgba(255,255,255, 0.2)";
        _0x5d359d.lineWidth = 3;
        _0x5d359d.font = "100px UTMAvoBold";
        _0x5d359d.strokeText(_0x6ac606, 30, 100);
        _0x5d359d.strokeText(_0x6ac606, 130, 200);
        _0x5d359d.textAlign = "right";
        _0x5d359d.strokeText(_0x6ac606, _0x46f678.width - 30, _0x46f678.height - 30);
        _0x5d359d.strokeText(_0x6ac606, _0x46f678.width - 130, _0x46f678.height - 130);
        _0x5d359d.fillStyle = "#ffffff";
        _0x5d359d.font = "55px UTMAvoBold";
        _0x5d359d.fillText(_0x6ac606, 680, 270);
        _0x5d359d.font = "40px UTMAvoBold";
        _0x5d359d.fillStyle = "#fff";
        _0x5d359d.textAlign = "right";
        _0x5d359d.fillText(_0x1853b6, 680, 320);
        _0x5d359d.font = "23px UTMAvoBold";
        _0x5d359d.fillStyle = "#fff";
        _0x5d359d.textAlign = "start";
        _0x5d359d.fillText(_0xb3d99a, 1350, 252);
        _0x5d359d.fillText(_0x1fea06, 1350, 332);
        _0x5d359d.fillText(_0x3f24ba, 1350, 410);
        _0x5d359d.globalCompositeOperation = "destination-out";
        _0x5d359d.drawImage(_0x441ac2, 0, 0, _0x46f678.width, _0x46f678.height);
        _0x5d359d.globalCompositeOperation = "destination-over";
        _0x5d359d.fillStyle = _0x2df4a1;
        _0x5d359d.fillRect(0, 0, _0x46f678.width, _0x46f678.height);
        _0x5d359d.globalCompositeOperation = "source-over";
        _0x5d359d.drawImage(_0x222b61, 824, 180, 285, 285);
        const _0x2e9e90 = _0x46f678.toBuffer();
        _0x2f04ce.writeFileSync(_0x13a194, _0x2e9e90);
        return _0x19b024.sendMessage({
          'attachment': _0x2f04ce.createReadStream(_0x13a194)
        }, _0x58eb76, _0x274e83);
      }
  }
};
