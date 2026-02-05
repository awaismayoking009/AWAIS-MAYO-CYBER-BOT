const axios = require('axios');

async function tiktok(url) {
    try {
        // یہاں ہم ایک فری API استعمال کر رہے ہیں
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${url}`);
        return res.data;
    } catch (e) {
        return { status: false, msg: "Error downloading TikTok" };
    }
}

async function facebook(url) {
    try {
        const res = await axios.get(`https://api.vreden.my.id/api/fbdl?url=${url}`);
        return res.data;
    } catch (e) {
        return { status: false, msg: "Error downloading Facebook" };
    }
}

module.exports = { tiktok, facebook };
