let handler = async (m, { conn }) => {

    // ==========================================
    // 🛠️ MODIFICA QUI SOTTO LE INFO DELLA PATCH 🛠️
    // ==========================================
    
    let versione = "v2.0" // La nuova era del bot
    let dataRelease = "Oggi"
    
    // Le novità che hai aggiunto (usa │ 🟢 per mantenere lo stile)
    let novita = `
│ 🟢 Nuovi Virtual Match (Sistema Snai Asincrono & Ticket Canvas)
│ 🟢 Nuovo gioco Crazy Time HD anti-crash
│ 🟢 Nuovo Menu Speciale completamente riprogettato
│ 🟢 Nuovo comando .stats per le statistiche avanzate
│ 🟢 Nuovo Activity Tracker: Ricompense automatiche ogni 100 msg
│ 🟢 Nuovo comando .time per il monitoraggio del tempo online
!BONUS:COMANDO .partite PER FARE SCHEDINE AD ORARI REALI E RISCATTARE CON UN CODICE COME NELLA VITA REALE.
    `.trim()

    // I bug che hai risolto (usa │ 🛠️ per mantenere lo stile)
    let fix = `
│ 🛠️ Risolto e potenziato l'Antispam dei comandi (Ora chirurgico a 10s)
│ 🛠️ Ottimizzati i database locali per azzerare il lag
    `.trim()

    // Un messaggio finale per gli utenti
    let note = "La V2.0 è qui! Provate subito .partite e .time per vedere le nuove Dashboard grafiche!"

    // ==========================================
    // NON TOCCARE NIENTE QUI SOTTO (Motore Grafico)
    // ==========================================

    let patchTesto = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🚀 𝐍𝐔𝐎𝐕𝐎 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀𝐌𝐄𝐍𝐓𝐎 🚀 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏷️ 』 𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: *${versione}*
『 📅 』 𝐃𝐚𝐭𝐚: *${dataRelease}*

╭── ✨ 𝐍𝐎𝐕𝐈𝐓𝐀' ──⬣
${novita}
╰───────────────⬣

╭── 🔧 𝐁𝐔𝐆 𝐅𝐈𝐗 ──⬣
${fix}
╰───────────────⬣

📌 _Note:_ ${note}

👑 _Update rilasciato ufficialmente dal Legam OS_
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE E ANTI-CRASH) 🔥
    let channelContext = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `🛠️ System Update ${versione}` // Titolo personalizzato nel canale
        }
    };

    // Invio del messaggio
    await conn.sendMessage(m.chat, { text: patchTesto, contextInfo: channelContext }, { quoted: m })
}

handler.help = ['patch', 'aggiornamento']
handler.tags = ['owner']
handler.command = /^(patch|aggiornamento|update|novita)$/i

handler.owner = true // SOLO TU (Owner) puoi lanciare questo comando!

export default handler


