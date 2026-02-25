const request = require("request");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "item",
  version: "1.1.0",
  permission: 0,
  credits: "Joy",
  prefix: true,
  description: "Get random item video",
  category: "media",
  usages: ".item",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const cacheDir = path.join(__dirname, "cache");
  const videoPath = path.join(cacheDir, "item.mp4");

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const titles = [
    "╔══❖•𝐉𝐎𝐘-𝐁𝐎𝐓•❖══╗\n\n【• 𝐈𝐓𝐄𝐌-𝐕𝐈𝐃𝐄𝐎 •】\n\n╚══❖•𝐉𝐎𝐘-𝐁𝐎𝐓•❖══╝"
  ];

  const links = [
    "https://drive.google.com/uc?id=1ABtEvo3Cvls7pkA4e937k9aNAL_YJc8Q",
  "https://drive.google.com/uc?id=1AFXbiWAIh90KQOqVYxHWHmv-3NKmJ76a",
 "https://drive.google.com/uc?id=1AB6SN7vCf7CD1sKiklfPHZOCzf3x8iLG",
  "https://drive.google.com/uc?id=1AC3BNRdKYOMAAS1lhu91PMkY27C0woVH",
  "https://drive.google.com/uc?id=1ACc1GddqGYPo80E4vStBvqVXA7FcdMlS",
 "https://drive.google.com/uc?id=1A67KkN-FThrW1O79ZxqioBnvvpaDVgfT", 
  "https://drive.google.com/uc?id=1A8YWpc7a1n-aDGSoQeGNO8gGphtj-HBl",
  "https://drive.google.com/uc?id=19NVG0_x17Qb_tJYThHyMZrGcgX8_qRnP",
  "https://drive.google.com/uc?id=18gkBs7elEWmTeUHvMgqy_gWf6ZVVqONq",
 "https://drive.google.com/uc?id=18Lt_98RjU5uIDkspY5jAHxbwiTlZyaNQ",
"https://drive.google.com/uc?id=19G2EutkttOP1ZSmG23BTOSujGxIfbygw",
"https://drive.google.com/uc?id=18TNgh_Ugm_uwtEmXdBWJg2d1SLwDmi3c",
"https://drive.google.com/uc?id=18SWKPzP3jF5DfzBPBDxJcG9_lrOOFeGC",
"https://drive.google.com/uc?id=18TNgh_Ugm_uwtEmXdBWJg2d1SLwDmi3c",
"https://drive.google.com/uc?id=18SWKPzP3jF5DfzBPBDxJcG9_lrOOFeGC",
"https://drive.google.com/uc?id=18nobAyvqctykCz3U_Tv9EUEUZjq5DnNI",
"https://drive.google.com/uc?id=18froJqfN9ZrUgIVEz1R9YtIN3nDK8vL6",
"https://drive.google.com/uc?id=18vxEJZUOCoXU8j8JArJ17HhIskAsET6k",
"https://drive.google.com/uc?id=18n_Feg-_zCMfK4uDwvxQ3lt1H89RZmb",
"https://drive.google.com/uc?id=18oFVY1-ZWs0yfPGJLF4jJ5nAXoPYd_pO",
"https://drive.google.com/uc?id=18SxwoBDUtCGWZ0fRSFxxYdx6U6uJWXHF",
"https://drive.google.com/uc?id=18drLPuiBW3ZsW4J2LS440Bl9r00TVmzh",
"https://drive.google.com/uc?id=18sdSMJRgluxho9cw8r-Ai27npW_suxEG",
"https://drive.google.com/uc?id=19Duy7-qBiQ8cvwFeX6Cq8osefjgprH_g",
"https://drive.google.com/uc?id=18rYsno0T-58YYnM6HEwgLXbZaccmLeMA",
"https://drive.google.com/uc?id=19E6TKZsUuyT4w3KBX_ed5siDeeph5n35",
 "https://drive.google.com/uc?id=1HGgOFPGZSTGGZTET6MfSl2Owli4TG-wp",
"https://drive.google.com/uc?id=1HADPS821qW-1cTL1Q6T2VJoffCwNjM5b",
"https://drive.google.com/uc?id=1H9SjXRlMt9jmEuzi_SyHtRZlUCs77t7B",
"https://drive.google.com/uc?id=1H7c2k7TkA6uqgSYGTqIUc6Ht0Jpp1S7Y",
"https://drive.google.com/uc?id=1C1oZaqRy6vnFqZ3WqE-2VckTyCYJtaAU",
"https://drive.google.com/uc?id=1DOmjR29SXuPxwvkuyv5-F7bBVx7l2dwv",
"https://drive.google.com/uc?id=1DYS_SqSSwNe1atpziS_eCketPnIrlwYe",
"https://drive.google.com/uc?id=1DAI-JTISHnIoI5-H-Ck6UwWjbfJJww7e",
"https://drive.google.com/uc?id=1FsEE4VMVBy0RnaxUmut33am06hYEymVz",
"https://drive.google.com/uc?id=1CAf8prxFpLtB4qjrGM9v9TYZP1dAofUZ",
"https://drive.google.com/uc?id=1FPRJQeoji3k2X46gpz_KGOPTBAcZLhRt",
"https://drive.google.com/uc?id=1DuW1yckRbOfik9RDrVRfilbXrR3jphTA",
"https://drive.google.com/uc?id=1DvTN_7n9GiJ8Wk0rsj6YWVHG6U47QvDX",
"https://drive.google.com/uc?id=1F0KiES7O9wCnjAM4VdMsYbRi7Q8k8WWX",
"https://drive.google.com/uc?id=1Cx9LmKAixw5mdkz9Qf-wbgLh4Dsi4Z2T",
"https://drive.google.com/uc?id=1EXWZGumaNXHUPoDwB6n_QDyU_1cFL_yf",
"https://drive.google.com/uc?id=1CEnE85IrqJpfVGlTGu7tW_v1ZiMdPClc",
"https://drive.google.com/uc?id=1FtWtvhMlbSVPLnX5VtcFPk_qya-clxOj",
"https://drive.google.com/uc?id=1CRIvmTR49slDdoMFYyeRpq4nJbHdZjgN",
"https://drive.google.com/uc?id=1Dpu6tQJtqh4m3ryNrZrrMS-VIgurRT2e",
"https://drive.google.com/uc?id=1DJnYv-9kUVL_dS6T0zSr3zayqmKaQ1SW",
"https://drive.google.com/uc?id=1DibRzN4F91AUTX62GSuEAbOiI-NKfabZ",
"https://drive.google.com/uc?id=1Cxfy_XR4oJnmdBsIDrUr4X7VhXTSmtlB",
"https://drive.google.com/uc?id=1FyJfxjMdrIXIqn_fUCufZV0qIqKxA7Ga",
"https://drive.google.com/uc?id=1FLhPMmnOvj9yut_-NtXpeu3R5b-r-cY8",
"https://drive.google.com/uc?id=1EptSvpC6AntcAjspjo7pk7oNmF42Qh54",
"https://drive.google.com/uc?id=1DSyBUQj5pMKg4PYi4ixLUqZURocNXAmE",
"https://drive.google.com/uc?id=1Do8762SJ4NfgkUdIXWWbo3ct2tQ4IVZV",
"https://drive.google.com/uc?id=1E7Z4EQcFR97JIAGhAuK-XVcQg5kG9S0a",
"https://drive.google.com/uc?id=1FjTSOcDCeYo6Lj9sqF0KQC-eF12cFQhS",
"https://drive.google.com/uc?id=1ELVUAV1btGqsyvSNDbydCxLsM9Ucp8gY",
"https://drive.google.com/uc?id=1DiMNtnNTVI4X5oh8tdygQQyliw7JXa-I",
"https://drive.google.com/uc?id=1FncUd80MQMYxVXghVbIL1lsMOoUOuiR1",
"https://drive.google.com/uc?id=1Cg5sE5wrIsn2WV0Cp-WziRk1dovDmM9p",
"https://drive.google.com/uc?id=1Fm4cuH-mD40sqkjnLcWtmRP8ZcN6zqe1",
"https://drive.google.com/uc?id=1DirRv-Fi_hOBihA7PFtdOf-Rx7thmHbw",
"https://drive.google.com/uc?id=1EdrSwlyw9d07NzYy1kUrs9ySs1BWLP6y",
"https://drive.google.com/uc?id=1Eq65duyYLdCTFKC_o0MF5b5x1wIfBF6-",
"https://drive.google.com/uc?id=1DbvsPoWHveTME7S-QslLxCzHe6zhy4gA",
"https://drive.google.com/uc?id=1FHBdIlFqmJuW1RhaIuFYvmLfDpYExBwg",
"https://drive.google.com/uc?id=1C1smR9uZiX3ayJTug-jHIkDJUFNNBTc6",
"https://drive.google.com/uc?id=1D9f6_LSxqppMxFKnQXRwDK5SHbXxjdQD",
"https://drive.google.com/uc?id=1E_2i8J0zNtLcbdf7wDNFb3cuPXnOgfQd",
"https://drive.google.com/uc?id=1FQRxN1me6QbxZ8Fatt8krjakfuWj_r6s",
"https://drive.google.com/uc?id=1DqrPn2VTihBgiYZMbr36vGGO67NFfD0i",
"https://drive.google.com/uc?id=1EL7yitHtC9G-igMdLXBmtbM5JW7MOgsC",
"https://drive.google.com/uc?id=1FbydnGj1WS1Y3AfdNPZCr5tzGYnhPE6F",
"https://drive.google.com/uc?id=1CfdNkxbUd0OsjflZ-EBRdxDiAbnd2lvT",
"https://drive.google.com/uc?id=1EubNoTyCK5nV7KlwKAXO41Y4e2iKz7Pp",
"https://drive.google.com/uc?id=1FaeTWSADWHI9fgesXJkInj5GKsav-h0O",
"https://drive.google.com/uc?id=1F8UyomD6tidvcPEIjHXmGjnyYX6tw_bx",
"https://drive.google.com/uc?id=1EnZfvl_m-cvLwwvTGQagvkIrigLK_uN9",
"https://drive.google.com/uc?id=1FyjIIIT3IHFFJ5DObn5k0YFi2sAQXd5R",
"https://drive.google.com/uc?id=1DcssZCzKIIq3Yq7mjbmLPfO45iOYJ7YU",
"https://drive.google.com/uc?id=1FrpagSnbfj9Pdlr_6CmQMXohMrYe2VFG",
"https://drive.google.com/uc?id=1FZq-xf6RzzKyhzmiggjmt60Uej0UKJbh",
"https://drive.google.com/uc?id=1FZq-xf6RzzKyhzmiggjmt60Uej0UKJbh",

  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  const videoURL = links[Math.floor(Math.random() * links.length)];

  api.sendMessage("🎬 Video loading...", threadID, messageID);

  request(encodeURI(videoURL))
    .pipe(fs.createWriteStream(videoPath))
    .on("close", () => {
      api.sendMessage(
        {
          body: title,
          attachment: fs.createReadStream(videoPath)
        },
        threadID,
        () => fs.unlinkSync(videoPath)
      );
    })
    .on("error", () => {
      api.sendMessage("❌ Video load করতে সমস্যা হয়েছে!", threadID);
    });
};