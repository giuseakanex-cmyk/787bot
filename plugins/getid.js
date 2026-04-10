let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('୧・︶ ❌ ︶・୨ `Inserisci il link del canale WhatsApp.` ꒷꒦');

    let code = text.split('whatsapp.com/channel/')[1];
    if (!code) return m.reply('୧・︶ ❌ ︶・୨ `Link non valido. Assicurati che sia un link di invito ufficiale.` ꒷꒦');

    try {
        await m.reply('୧・︶ ⏳ ︶・୨ `Estrazione ID in corso...` ꒷꒦');
        
        // Usa la funzione di Baileys per estrarre i metadati del canale tramite il codice di invito
        let res = await conn.newsletterMetadata("invite", code);
        
        let msg = `
୧・︶ ✦ 𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲-𝐁𝐨𝐭 ✦ ︶・୨
꒷꒦ ‧₊ 📡 𝐈𝐃 𝐂𝐀𝐍𝐀𝐋𝐄 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ₊‧ ꒷꒦
୧・︶ : ︶ : ︶ : ︶ : ︶ : ︶ : ︶・୨

✦ 📛 𝐍𝐨𝐦𝐞: ${res.name}
✦ 🆔 𝐉𝐈𝐃: ${res.id}

👑 _Copia l'ID e incollalo nei tuoi comandi._
୧・︶ : ︶ ꒷꒦ ‧₊ ୧`.trim();

        await m.reply(msg);
    } catch (e) {
        console.error(e);
        m.reply('୧・︶ ❌ ︶・୨ `Errore: impossibile ottenere l\'ID. Il canale potrebbe essere privato o il link revocato.` ꒷꒦');
    }
}

handler.help = ['getidcanale <link>'];
handler.tags = ['owner'];
handler.command = /^getidcanale$/i;
handler.owner = true;

export default handler;
