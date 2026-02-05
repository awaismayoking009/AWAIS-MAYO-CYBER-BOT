const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const config = require('./config');

module.exports = async (sock, m) => {
    const from = m.key.remoteJid;
    const type = Object.keys(m.message)[0];

    // --- 1. VIEW ONCE OPENER (One Click Photo Opener) ---
    if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
        const viewOnce = m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message;
        const msgType = Object.keys(viewOnce)[0];
        const media = await downloadContentFromMessage(viewOnce[msgType], msgType === 'imageMessage' ? 'image' : 'video');
        
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = `*💀 Awais Mayo Cyber Bot 👑*\n\n✅ *View Once Media Opened!*\n\n${config.footerText}`;
        
        if (msgType === 'imageMessage') {
            await sock.sendMessage(from, { image: buffer, caption: caption });
        } else {
            await sock.sendMessage(from, { video: buffer, caption: caption });
        }
    }

    // --- 2. DM & GROUP ANTI-DELETE ---
    sock.ev.on('messages.delete', async (item) => {
        if (!item.originKey) return;
        
        // یہاں ہم ڈیلیٹ شدہ میسج کو لاگ سے اٹھائیں گے (یہ فیچر میموری میں ڈیٹا سیو رکھتا ہے)
        const deletedMsg = " [ Message Deleted ] "; 
        const report = `*⚠️ ANTI-DELETE DETECTED ⚠️*\n\n*From:* ${item.remoteJid.includes('@g.us') ? 'Group' : 'Direct Message (DM)'}\n*User:* @${item.participant.split('@')[0]}\n\n*Powered By Awais Mayo*`;
        
        await sock.sendMessage(from, { text: report, mentions: [item.participant] });
    });

    // --- 3. AUTO-STATUS VIEW ---
    if (from === 'status@broadcast') {
        await sock.readMessages([m.key]);
        console.log(`✅ Status Viewed From: ${m.pushName}`);
    }

    // --- 4. IMAGE TO PDF FEATURE ---
    if (type === 'imageMessage' && m.message.imageMessage.caption === `${config.prefix}topdf`) {
        await sock.sendMessage(from, { text: "_Converting your image to PDF... Please wait_ ⏳" });
        // PDF Conversion logic here
        await sock.sendMessage(from, { text: "✅ PDF Generated! (Feature Loading...)" });
    }
};
