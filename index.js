const { default: makeWASocket, useSingleFileAuthState, delay, downloadContentFromMessage, jidDecode } = require('@adiwajshing/baileys');
const { state, saveState } = useSingleFileAuthState('./session.json');
const config = require('./config');
const dl = require('./lib/downloader');
const fs = require('fs');

async function startAwaisBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: require('pino')({ level: 'silent' }),
        browser: ["Awais Mayo", "Safari", "3.0"]
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;
        const type = Object.keys(m.message)[0];
        const pushname = m.pushName || "User";

        // --- 🔓 VIEW ONCE OPENER (Auto) ---
        if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
            const viewOnce = m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message;
            const msgType = Object.keys(viewOnce)[0];
            const media = await downloadContentFromMessage(viewOnce[msgType], msgType === 'imageMessage' ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of media) { buffer = Buffer.concat([buffer, chunk]); }
            await sock.sendMessage(from, { [msgType === 'imageMessage' ? 'image' : 'video']: buffer, caption: "🔓 *𝙰𝚠𝚊𝚒𝚜 𝙼𝚊𝚢𝚘 𝙷𝚊𝚌𝚔𝚎𝚍: 𝚅𝚒𝚎𝚠 𝙾𝚗𝚌𝚎 𝙾𝚙𝚎𝚗𝚎𝚍*" }, { quoted: m });
        }

        // --- ⌨️ COMMANDS HANDLER ---
        const body = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type === 'imageMessage') ? m.message.imageMessage.caption : '';
        const isCmd = body.startsWith(config.prefix);
        const command = isCmd ? body.slice(config.prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);

        if (isCmd) {
            switch(command) {
                case 'menu':
                    const menu = `
╔═══ 💀 *${config.botName}* 💀 ══╗
║
║ 👤 *𝙾𝚆𝙽𝙴𝚁:* ${config.ownerName}
║ 🔋 *𝚁𝙰𝙼:* 𝟸𝟻% 𝚂𝚝𝚊𝚋𝚕𝚎 (𝙺𝚊𝚝𝚊𝚋𝚞𝚖𝚙)
║ 🛡️ *𝚂𝙴𝙲𝚄𝚁𝙸𝚃𝚈:* 𝙰𝚗𝚝𝚒-𝙱𝚊𝚗 𝙾𝚗
║
╠═══ 🔓 *𝚅𝙸𝙿 𝚃𝙾𝙾𝙻𝚂* ═══
║ ☠️ .𝚊𝚗𝚝𝚒𝚍𝚎𝚕𝚎𝚝𝚎 (𝙰𝚞𝚝𝚘 𝙳𝙼/𝙶𝚙)
║ 🔓 .𝚟𝚒𝚎𝚠𝚘𝚗𝚌𝚎 (𝙰𝚞𝚝𝚘 𝙾𝚙𝚎𝚗)
║ 📥 .𝚝𝚝 <𝚞𝚛𝚕> (𝚃𝚒𝚔𝚃𝚘𝚔)
║ 📥 .𝚏𝚋 <𝚞𝚛𝚕> (𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔)
║
╠═══ 📚 *𝙴𝙳𝚄𝙲𝙰𝚃𝙸𝙾𝙽 & 𝙼𝙴𝙳𝙸𝙰* ═══
║ 📖 .𝚠𝚒𝚔𝚒 <𝚜𝚎𝚊𝚛𝚌𝚑>
║ 📄 .𝚝𝚘𝚙𝚍𝚏 (𝚁𝚎𝚙𝚕𝚢 𝙸𝚖𝚊𝚐𝚎)
║ 🎭 .𝚜 (𝚂𝚝𝚒𝚌𝚔𝚎𝚛 𝙼𝚊𝚔𝚎𝚛)
║
╚═══════════════════════╝
${config.footer}`;
                    await sock.sendMessage(from, { image: { url: config.thumb }, caption: menu });
                    break;

                case 'tt':
                case 'tiktok':
                    if (!args[0]) return sock.sendMessage(from, { text: "⚠️ *𝚄𝚛𝚕 𝙳𝚘 𝙱𝚑𝚊𝚒!*" });
                    await sock.sendMessage(from, { text: "⏳ *𝙵𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚃𝚒𝚔𝚃𝚘𝚔 𝚅𝚒𝚍𝚎𝚘...*" });
                    const ttData = await dl.tiktok(args[0]);
                    await sock.sendMessage(from, { video: { url: ttData.video.noWatermark }, caption: "✅ *𝚃𝚒𝚔𝚃𝚘𝚔 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚍!*" });
                    break;

                case 'fb':
                    if (!args[0]) return sock.sendMessage(from, { text: "⚠️ *𝚄𝚛𝚕 𝙳𝚘 𝙱𝚑𝚊𝚒!*" });
                    await sock.sendMessage(from, { text: "⏳ *𝙵𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔 𝚅𝚒𝚍𝚎𝚘...*" });
                    const fbData = await dl.facebook(args[0]);
                    await sock.sendMessage(from, { video: { url: fbData.result.hd }, caption: "✅ *𝙵𝙱 𝚅𝚒𝚍𝚎𝚘 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚍!*" });
                    break;
            }
        }
    });

    // --- 🛡️ DM ANTI-DELETE RECOVERY ---
    sock.ev.on('messages.delete', async (item) => {
        const report = `🚫 *𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴 𝙳𝙴𝚃𝙴𝙲𝚃𝙴𝙳!* \nSomeone tried to delete a message in this chat. 💀`;
        await sock.sendMessage(item.remoteJid, { text: report });
    });
}

startAwaisBot();
