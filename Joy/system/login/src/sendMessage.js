"use strict";

var utils = require("../utils");
var log = require("npmlog");
var form;

module.exports = function (http, api, ctx) {
  var handleSticker = (msg) => msg.sticker ? form.sticker_id = msg.sticker : null;

  function uploadAttachment(attachment) {
    var cb;
    var uploads = [];
    var rt = new Promise(function (resolve, reject) {
      cb = (error, files) => files ? resolve(files) : reject(error);
    });

    attachment.map(function (stream) {
      if (!utils.isReadableStream(stream)) 
        return cb("Attachment should be a readable stream and not " + utils.getType(stream));

      var httpPro = http
        .postFormData('https://upload.facebook.com/ajax/mercury/upload.php', ctx.jar, {
          upload_1024: stream,
          voice_clip: 'true'
        })
        .then(utils.parseAndCheckLogin(ctx, http))
        .then(function (res) {
          if (res.error) 
            throw res;

          return res.payload.metadata[0];
        })
        .catch(cb);

      return uploads.push(httpPro);
    });

    Promise
      .all(uploads)
      .then(res => cb(null, res))
      .catch(cb);

    return rt;
  }
  
  function handleLocation(msg) {
    if (!msg.location) return;
    if (msg.location.latitude == null || msg.location.longitude == null)
      throw 'location property needs both latitude and longitude';

    form["location_attachment[coordinates][latitude]"] = msg.location.latitude;
    form["location_attachment[coordinates][longitude]"] = msg.location.longitude;
    form["location_attachment[is_current_location]"] = !!msg.location.current;
  }

  function handleEmoji(msg) {
    if (msg.emojiSize != null && msg.emoji == null)
      throw 'emoji property is empty';
    if (!msg.emoji) return;
    !msg.emojiSize ? msg.emojiSize = "medium" : null;
    if (!['small', 'medium', 'large'].includes(msg.emojiSize))
      throw 'emojiSize property is invalid';
    if (form.body != '')
      throw 'body must be empty';
    form.body = msg.emoji;
    form["tags[0]"] = "hot_emoji_size:" + msg.emojiSize;
  }

  function handleMention(msg) {
    if (!msg.mentions) return;
    msg.mentions.map(function (mention, i) {
      var { tag, id } = mention;

      if (typeof tag != 'string')
        throw 'Mention tag must be string';
      if (!id)
        throw 'ID must be string';
      var offset = msg.body.indexOf(tag, mention.fromIndex || 0);
      if (offset < 0)
        throw 'Mention for "' + tag + '" not found in message string.';
      form["profile_xmd[" + i + "][offset]"] = offset;
      form["profile_xmd[" + i + "][length]"] = tag.length;
      form["profile_xmd[" + i + "][id]"] = id;
      form["profile_xmd[" + i + "][type]"] = "p";
    });
  }

  function handleAttachment(msg) {
    var cb;
    var rt = new Promise(function (resolve, reject) {
      cb = error => error ? reject(error) : resolve();
    });

    if (!msg.attachment) cb();
    
    form.image_ids = [];
    form.gif_ids = [];
    form.file_ids = [];
    form.video_ids = [];
    form.audio_ids = [];

    if (!Array.isArray(msg.attachment)) msg.attachment = [msg.attachment];

    uploadAttachment(msg.attachment)
      .then(function (files) {
        files.map(function (file) {
          var key = Object.keys(file);
          var type = key[0]; // image_id, file_id, etc
          form[type + "s"].push(file[type]);
        });
        return cb();
      })
      .catch(cb);

    return rt;
  }

  function handleUrl(msg) {
    var cb;
    var rt = new Promise(function (resolve, reject) {
      cb = error => error ? reject(error) : resolve();
    });

    if (!msg.url) cb();

    form["shareable_attachment[share_type]"] = 100;

    http
      .post('https://www.facebook.com/message_share_attachment/fromURI/', ctx.jar, {
        image_height: 960,
        image_width: 960,
        uri: msg.url
      })
      .then(utils.parseAndCheckLogin(ctx, http))
      .then(function (res) {
        if (res.error) 
          throw res;
        if (!res.payload)
          throw { error: 'Invalid url', res };
        form["shareable_attachment[share_params]"] = res.payload.share_data.share_params;
        return cb();
      })
      .catch(cb);
    
    return rt;
  }

  function sendContent(threadID, isSingleUser, messageAndOTID) {
    var cb;
    var rt = new Promise(function (resolve, reject) {
      cb = (error, event) => event ? resolve(event) : resolve(error);
    });
    
    if (Array.isArray(threadID)) {
      threadID.map((id, i) => {
        return form["specific_to_list[" + i + "]"] = "fbid:" + id;
      });
      form["specific_to_list[" + threadID.length + "]"] = "fbid:" + ctx.userID;
      form["client_thread_id"] = "root:" + messageAndOTID;
    } else if (isSingleUser) {
      form["specific_to_list[0]"] = "fbid:" + threadID;
      form["specific_to_list[1]"] = "fbid:" + ctx.userID;
      form.other_user_fbid = threadID;
    } else form.thread_fbid = threadID;

    if (ctx.globalOptions.pageID) {
      form.author = "fbid:" + ctx.globalOptions.pageID;
      form["specific_to_list[1]"] = "fbid:" + ctx.globalOptions.pageID;
      form["creator_info[creatorID]"] = ctx.userID;
      form["creator_info[creatorType]"] = "direct_admin";
      form["creator_info[labelType]"] = "sent_message";
      form["creator_info[pageID]"] = ctx.globalOptions.pageID;
      form.request_user_id = ctx.globalOptions.pageID;
      form["creator_info[profileURI]"] =
        "https://www.facebook.com/profile.php?id=" + ctx.userID;
    }

    http
      .post("https://www.facebook.com/messaging/send/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, http))
      .then(function (res) {
        form = null;
        if (!res)
          throw { error: 'Send Message Fail' }
        if (res.error)
          throw res;

        var event = res.payload.actions.reduce(function (p, v) {
          return {
            threadID: v.thread_fbid || v.other_user_fbid,
            messageID: v.message_id,
            timestamp: v.timestamp
          }
        }, null);
        return cb(null, event);
      })
      .catch(function (error) {
        if (error.error === 1545012)
          log.warn("sendMessage", "Got error 1545012. This might mean that you're not part of the conversation " + threadID);
        else log.error("sendMessage", error);
        if (utils.getType(error) == "Object" && error.error === "Not logged in.") ctx.loggedIn = false;
        return cb(error);
      });

    return rt;
  }
  
  return function sendMessage(msg, threadID, callback, messageID, isGroup = null) {
    var cb;
    typeof isGroup != 'boolean' ? isGroup = null : isGroup;
    var rtPromise = new Promise(function (resolve, reject) {
      cb = (error, event) => event ? resolve(event) : reject(error);
    });

    if (typeof threadID == 'function') {
      var error = 'Pass a threadID as a second argument.';
      log.error('sendMessage', error);
      return threadID(error);
    }
    if (typeof callback == 'string') {
      messageID = callback;
      callback = null;
    }
    if (typeof callback == 'function') cb = callback;
    if (typeof messageID != 'string') messageID = null;

    var typeMsg = utils.getType(msg);
    var typeTID = utils.getType(threadID);

    if (typeMsg == 'String' || typeMsg == 'Array') msg = { body: msg }
    else if (typeMsg != 'Object' || Object.keys(msg).length < 1) {
      var error = "Message should be of type string or object or array and not " + typeMsg;
      log.error('sendMessage', error);
      return cb(error);
    }
    if (!['Array', 'String', 'Number'].includes(typeTID)) {
      var error = 'ThreadID should be of type number, string, or array and not ' + typeTID;
      log.error('sendMessage', error);
      return cb(error);
    }

    var messageAndOTID = utils.generateOfflineThreadingID();

    form = {
      client: "mercury",
      action_type: "ma-type:user-generated-message",
      author: "fbid:" + ctx.userID,
      timestamp: Date.now(),
      timestamp_absolute: "Today",
      timestamp_relative: utils.generateTimestampRelative(),
      timestamp_time_passed: "0",
      is_unread: false,
      is_cleared: false,
      is_forward: false,
      is_filtered_content: false,
      is_filtered_content_bh: false,
      is_filtered_content_account: false,
      is_filtered_content_quasar: false,
      is_filtered_content_invalid_app: false,
      is_spoof_warning: false,
      source: "source:chat:web",
      "source_tags[0]": "source:chat",
      body: msg.body ? typeof msg.body == 'object' ? JSON.stringify(msg.body, null, 2) : String(msg.body) : "",
      html_body: false,
      ui_push_phase: "V3",
      status: "0",
      offline_threading_id: messageAndOTID,
      message_id: messageAndOTID,
      threading_id: utils.generateThreadingID(ctx.clientID),
      "ephemeral_ttl_mode:": "0",
      manual_retry_cnt: "0",
      has_attachment: !!(msg.attachment || msg.url || msg.sticker),
      signatureID: utils.getSignatureID(),
      replied_to_message_id: messageID
    }

    try {
      handleLocation(msg);
      handleSticker(msg);
      handleEmoji(msg);
      handleMention(msg);
    } catch (e) {
      log.error('sendMessage', e);
      return cb(e);
    }

    handleAttachment(msg)
      .then(_ => handleUrl(msg))
      .then(_ => {
        isGroup = Array.isArray(threadID) ? false : typeof isGroup == 'boolean' ? !isGroup : threadID.toString().length < 16;
        return sendContent(threadID, isGroup, messageAndOTID);
      })
      .then(event => cb(null, event))
      .catch(function (error) {
        log.error('sendMessage', error);
        return cb(error);
      });
    
    return rtPromise;
  }
}