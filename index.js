const { default: makeWASocket, useSingleFileAuthState, delay, downloadContentFromMessage } = require('@adiwajshing/baileys');
const { state, saveState } = useSingleFileAuthState('./session.json');
const config = require('./config');
const fs = require('fs');

async function startAwaisBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: require('pino')({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveState);

    // --- 🛡️ ANTI-DELETE & VIEW ONCE LOGIC ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;
        const type = Object.keys(m.message)[0];

        // 🔓 VIEW ONCE OPENER
        if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
            const viewOnce = m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message;
            const msgType = Object.keys(viewOnce)[0];
            const media = await downloadContentFromMessage(viewOnce[msgType], msgType === 'imageMessage' ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of media) { buffer = Buffer.concat([buffer, chunk]); }
            await sock.sendMessage(from, { [msgType === 'imageMessage' ? 'image' : 'video']: buffer, caption: "🔓 *𝚅𝚒𝚎𝚠 𝙾𝚗𝚌𝚎 𝙼𝚎𝚍𝚒𝚊 𝙾𝚙𝚎𝚗𝚎𝚍 𝙱𝚢 𝙰𝚠𝚊𝚒𝚜 𝙼𝚊𝚢𝚘*" });
        }

        // ⌨️ COMMANDS & DESIGN
        const body = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : '';
        if (body.startsWith(config.prefix)) {
            const cmd = body.slice(1).trim().split(' ')[0].toLowerCase();
            const args = body.trim().split(' ').slice(1);

            // 📜 HACKING STYLE MENU
            if (cmd === 'menu') {
                const menu = `
╔═══ 💀 *${config.botName}* 💀 ══╗
║
║ 👤 *𝙾𝚆𝙽𝙴𝚁:* ${config.ownerName}
║ 🛠️ *𝙿𝚁𝙴𝙵𝙸𝚇:* ${config.prefix}
║ 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* 𝙾𝚗𝚕𝚒𝚗𝚎 (𝟸𝟻% 𝙲𝙿𝚄)
║
╠═══ 🔓 *𝚅𝙸𝙿 𝙵𝙴𝙰𝚃𝚄𝚁𝙴𝚂* ═══
║ ☠️ 𝙰𝚗𝚝𝚒-𝙳𝚎𝚕𝚎𝚝𝚎 (𝙰𝚞𝚝𝚘)
║ 🔓 𝚅𝚒𝚎𝚠 𝙾𝚗𝚌𝚎 𝙾𝚙𝚎𝚗𝚎𝚛
║ 📥 𝚃𝚒𝚔𝚝𝚘𝚔 / 𝙵𝙱 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚛
║ 📂 𝙸𝚖𝚊𝚐𝚎 𝚃𝚘 𝙿𝙳𝙵
║ 🎭 𝚂𝚝𝚒𝚌𝚔𝚎𝚛 𝙼𝚊𝚔𝚎𝚛
║ 📝 𝙰𝙸 𝙲𝚑𝚊𝚝 (𝙳𝚎𝚎𝚙𝚂𝚎𝚎𝚔)
║
╚═══════════════════════╝
${config.footer}`;
                await sock.sendMessage(from, { image: { url: config.thumb }, caption: menu });
            }

            // 📥 DOWNLOADER (TikTok/FB)
            if (cmd === 'tt' || cmd === 'tiktok' || cmd === 'fb') {
                if (!args[0]) return sock.sendMessage(from, { text: "⚠️ 𝚄𝚁𝙻 𝚋𝚑𝚎𝚓𝚘 𝚋𝚑𝚊𝚒!" });
                await sock.sendMessage(from, { text: "⏳ 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚒𝚗𝚐... 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝" });
                // یہاں آپ کی API کال ہوگی، ابھی میں سیمپل میسج دے رہا ہوں
                await sock.sendMessage(from, { text: "✅ 𝙵𝚒𝚕𝚎 𝚂𝚎𝚗𝚝! (𝚄𝚜𝚎 𝚁𝚎𝚊𝚕 𝙰𝙿𝙸 𝚏𝚘𝚛 𝚏𝚞𝚕𝚕 𝚏𝚒𝚕𝚎)" });
            }
        }
    });

    // 🛡️ ANTI-DELETE (DM & Group)
    sock.ev.on('messages.delete', async (item) => {
        await sock.sendMessage(item.remoteJid, { text: "🚫 *𝙰𝚗𝚝𝚒-𝙳𝚎𝚕𝚎𝚝𝚎 𝙳𝚎𝚝𝚎𝚌𝚝𝚎𝚍!* 𝚂𝚘𝚖𝚎𝚘𝚗𝚎 𝚝𝚛𝚒𝚎𝚍 𝚝𝚘 𝚑𝚒𝚍𝚎 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎." });
    });
}

startAwaisBot();
