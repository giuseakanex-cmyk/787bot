let handler = async (m, { conn, command, isOwner, usedPrefix }) => {
    // Sicurezza: Override riservato al Root
    if (!isOwner) return m.reply('⌬ ❯ ACCESSO NEGATO: Solo Giuse può eseguire l\'override del sistema.')

    if (command === 'off' || command === 'ghost') {
        if (global.ghostMode) return m.reply('⌬ ❯ 787 SYSTEM è già in modalità SILENT.')
        
        global.ghostMode = true 
        
        let txt = `
⌬ ━━━──  𝐆 𝐇 𝐎 𝐒 𝐓   𝐌 𝐎 𝐃 𝐄  ──━━━ ⌬

█ ⚡ **STATUS** ↳ PROTOCOLLO SILENT: ATTIVO 🌙
█ 🛠️ **EFFETTO** ↳ Il sistema ignora ogni input non autorizzato.

↳ Root Access: GIUSE (UNLOCKED)
↳ User Access: DENIED

⌬ ❯ Digita ${usedPrefix}on per ripristinare il core.

⌬ ━━━──  𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄  ──━━━ ⌬`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })

    } else if (command === 'on') {
        if (!global.ghostMode) return m.reply('⌬ ❯ Il sistema è già operativo in modalità FULL ACCESS.')
        
        global.ghostMode = false 
        
        let txt = `
⌬ ━━━──  𝐎 𝐍 𝐋 𝐈 𝐍 𝐄   𝐌 𝐎 𝐃 𝐄  ──━━━ ⌬

█ ⚡ **STATUS** ↳ PROTOCOLLO CORE: ATTIVO ☀️
█ 🛠️ **EFFETTO** ↳ Accesso globale ripristinato.

↳ Root Access: GIUSE
↳ User Access: GRANTED

⌬ ❯ Il sistema 787 è nuovamente in ascolto.

⌬ ━━━──  𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄  ──━━━ ⌬`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

// 🛑 INTERCETTORE DEFINITIVO: Solo l'Owner passa
handler.before = async function (m, { isOwner }) {
    if (global.ghostMode && !isOwner) {
        // Bypass totale per utenti non autorizzati
        m.text = ''
        m.body = ''
        return true 
    }
}

handler.help = ['ghost', 'on', 'off']
handler.tags = ['owner']
handler.command = /^(ghost|off|on)$/i
handler.owner = true

export default handler
