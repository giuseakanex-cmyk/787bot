let mutedUsers = new Map();
let spamWarnings = new Map();

function formatTimeLeft(timestamp) {
    if (!timestamp) return '∞ Permanente'
    const diff = timestamp - Date.now()
    if (diff <= 0) return '✅ Scaduto'
    const minutes = Math.ceil(diff / 60000)
    if (minutes === 0) return '< 1 min'
    return `${minutes} min`
}

function normalizeId(id) {
    if (!id) return '';
    let normalizedId = id.replace('@s.whatsapp.net', '').replace('@lid', '').split('@')[0]
    if (normalizedId.startsWith('39')) {
        normalizedId = normalizedId.substring(2)
    }
    return normalizedId
}

global.gpMutaSmuta = global.gpMutaSmuta || {}
global.gpMutaSmuta.mutedUsers = mutedUsers
global.gpMutaSmuta.normalizeId = normalizeId

function getUserName(userId, participants) {
    if (!participants || !Array.isArray(participants)) return normalizeId(userId)
    const normalizedUserId = normalizeId(userId)
    let participant = participants.find(p => normalizeId(p.id) === normalizedUserId)
    if (!participant) participant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
    if (!participant) {
        const alternativeId = normalizedUserId.startsWith('39') ? normalizedUserId.substring(2) : '39' + normalizedUserId
        participant = participants.find(p => normalizeId(p.id) === alternativeId)
        if (!participant) participant = participants.find(p => p.jid && normalizeId(p.jid) === alternativeId)
    }
    return participant?.notify || participant?.name || normalizedUserId
}

const legamContext = (title, mentions = []) => ({
    mentionedJid: mentions,
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363259442839354@newsletter',
        serverMessageId: 100,
        newsletterName: `𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: ${title}`
    }
});

let handler = async (m, { conn, command, args, participants, usedPrefix }) => {
    try {
        const isMute = command === 'muta'
        const isUnmute = command === 'smuta'
        const isList = command === 'listamutati'

        const decodedSender = conn.decodeJid(m.sender);
        const executorIsOwner = global.owner.map(([n]) => n + '@s.whatsapp.net').includes(decodedSender) || m.fromMe;

        if (isList) {
            if (!mutedUsers.size) {
                let msg = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄  𝐌  ───━━━ ⌬\n\n⌬ ❯ Nessun utente mutato nel database.\n\n⌬ ━━━───  𝟕 𝟖 𝟕  ───━━━ ⌬`;
                return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext('Lista Pulita') }, { quoted: m });
            }
            
            let text = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄  𝐌  ───━━━ ⌬\n\n`
            let mentions = []
            for (let [normalized, data] of mutedUsers.entries()) {
                let timeLeft = formatTimeLeft(data.timestamp)
                let userJid = data.displayNumber.startsWith('39') && data.displayNumber.length === 12 ? data.displayNumber + '@s.whatsapp.net' : data.displayNumber + '@lid'
                let currentName = getUserName(userJid, participants) || data.displayNumber
                
                text += `⌬ ❯ @${currentName}\n`
                text += `⏱️ Scadenza: ${timeLeft}\n`
                text += `📝 Motivo: ${data.reason}\n`
                text += `🛡️ Autore: ${data.mutedByOwner ? 'Owner' : 'Admin'}\n`
                text += `───────────────────\n`
                mentions.push(userJid)
            }
            text += `\n⌬ ━━━───  𝟕 𝟖 𝟕  ───━━━ ⌬`
            return conn.sendMessage(m.chat, { text, contextInfo: legamContext('Registro Muti', mentions) }, { quoted: m });
        }

        let users = []
        if (m.mentionedJid?.length) {
            users = m.mentionedJid
            args = args.filter(arg => !arg.startsWith('@'))
        } else if (m.quoted) {
            users = [m.quoted.sender]
        }

        if (!users.length) {
            let msg = `⌬ ❯ **ERRORE**\nUso: ${usedPrefix}${command} @user [minuti] [motivo]`;
            return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext('Sintassi') }, { quoted: m });
        }

        const validUsers = []
        const userParticipantMap = new Map()
        for (const user of users) {
            const decodedId = conn.decodeJid(user)
            const normalizedUserId = normalizeId(decodedId)
            let isValid = false
            let matchedParticipant = participants.find(p => normalizeId(p.id) === normalizedUserId)
            if (!matchedParticipant) matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
            if (!matchedParticipant) {
                const alternativeId = normalizedUserId.startsWith('39') ? normalizedUserId.substring(2) : '39' + normalizedUserId
                matchedParticipant = participants.find(p => normalizeId(p.id) === alternativeId)
                if (!matchedParticipant) matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === alternativeId)
            }
            if (!isValid && m.quoted && decodedId === conn.decodeJid(m.quoted.sender)) {
                isValid = true
                matchedParticipant = participants.find(p => p.jid && conn.decodeJid(p.jid) === decodedId)
            }
            if (matchedParticipant || isValid) {
                validUsers.push(decodedId)
                userParticipantMap.set(decodedId, matchedParticipant)
            }
        }
        users = validUsers

        if (!users.length) {
            let msg = `⌬ ❯ **ERRORE**\nUtente non valido o non nel gruppo.`;
            return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext('Target Invalido') }, { quoted: m });
        }
        
        let time = 0
        let reason = 'Violazione delle regole'

        if (args.length) {
            let timeArg = args[0].toLowerCase()
            let timeMatch = timeArg.match(/^(\d+)(s|sec|m|min)?$/)

            if (timeMatch) {
                let value = parseInt(timeMatch[1])
                let unit = timeMatch[2] || 'm'
                time = unit.startsWith('s') ? value * 1000 : value * 60000
                reason = args.slice(1).join(' ') || reason
            } else {
                reason = args.join(' ')
            }
        }

        let results = []

        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            const jid = conn.decodeJid(user)
            const matched = userParticipantMap.get(user)
            const preferredJid = matched && matched.jid ? conn.decodeJid(matched.jid) : jid
            const normalized = normalizeId(preferredJid)
            const displayNumber = preferredJid.split('@')[0]
            let isTargetOwner = global.owner.map(([n]) => n + '@s.whatsapp.net').includes(jid)
            
            if (isTargetOwner && isMute) {
                const normalizedPunish = normalizeId(conn.decodeJid(m.sender))
                mutedUsers.set(normalizedPunish, { timestamp: Date.now() + (2 * 60000), reason: 'Hai osato provare a mutare un superiore 👀', lastNotification: 0, displayNumber: conn.decodeJid(m.sender).split('@')[0], mutedByOwner: true })
                let punMsg = `⌬ ❯ **PUNIZIONE**\nNon puoi mutare un Owner. Sei mutato per 2 minuti.`;
                return conn.sendMessage(m.chat, { text: punMsg, contextInfo: legamContext('Punizione', [m.sender]) }, { quoted: m });
            }

            if (isMute) {
                const muteData = { timestamp: time ? Date.now() + time : 0, reason, lastNotification: 0, displayNumber, mutedByOwner: executorIsOwner };
                mutedUsers.set(normalized, muteData);
                results.push(`@${displayNumber}`);
            } else if (isUnmute) {
                const normalizedTargetId = normalizeId(preferredJid);
                let muteData = mutedUsers.get(normalizedTargetId);

                if (muteData) {
                    if (muteData.mutedByOwner && !executorIsOwner) {
                        let msg = `⌬ ❯ **ACCESSO NEGATO**\nUtente mutato da un Owner. La tua autorita' non basta.`;
                        return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext('Gerarchia Violata', [preferredJid]) }, { quoted: m });
                    }
                    mutedUsers.delete(normalizedTargetId);
                    results.push(`@${displayNumber}`);
                }
            }
        }

        if (results.length > 0) {
            let msg = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄  𝐌  ───━━━ ⌬\n\n`
            msg += `👤 Utenti: *${results.join(', ')}*\n`
            msg += `⚡ Azione: *${isMute ? 'Mutato' : 'Smutato'}*\n`
            if (isMute) msg += time ? `⏱️ Durata: *${time / 60000} minuti*\n` : `⏱️ Durata: *∞ Permanente*\n`
            msg += `📝 Motivo: _${reason}_\n\n`
            msg += `⌬ ━━━───  𝟕 𝟖 𝟕  ───━━━ ⌬`

            await conn.sendMessage(m.chat, {
                text: msg,
                contextInfo: legamContext(`Security Update`, users)
            }, { quoted: m });
        }

    } catch (e) {
        console.error(e);
    }
}

handler.before = async (m, { conn, isCommand }) => {
    try {
        if (!m.sender || m.sender === conn.user.jid) return

        const senderJid = conn.decodeJid(m.sender)
        let normalizedSender = normalizeId(senderJid)

        const isMuted = mutedUsers.has(normalizedSender)
        if (!isMuted) return
        if (isCommand && m.isAdmin) return true

        const data = mutedUsers.get(normalizedSender)
        
        if (data.timestamp && Date.now() > data.timestamp) {
            mutedUsers.delete(normalizedSender)
            let unMsg = `⌬ ❯ **MUTE SCADUTO**\nL'utente @${m.sender.split('@')[0]} e' stato smutato.`;
            await conn.sendMessage(m.chat, { text: unMsg, contextInfo: legamContext('Mute End', [m.sender]) })
            return
        }

        conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

        const now = Date.now()
        const userWarnings = spamWarnings.get(m.sender) || { count: 0, lastMessage: 0, warned: false }
        
        if (now - userWarnings.lastMessage < 2000) userWarnings.count++
        else userWarnings.count = 1
        
        userWarnings.lastMessage = now
        spamWarnings.set(m.sender, userWarnings)
        
        if (userWarnings.count >= 7) {
            try {
                let kickMsg = `⌬ ❯ **KICK AUTOMATICO**\n@${m.sender.split('@')[0]} rimosso per spam sotto mute.`;
                await conn.sendMessage(m.chat, { text: kickMsg, contextInfo: legamContext('Kick', [m.sender]) })
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                spamWarnings.delete(m.sender)
                mutedUsers.delete(normalizedSender)
            } catch (e) {}
        }

        const shouldNotify = !data.lastNotification || (now - data.lastNotification) > 300000 
        
        if (shouldNotify) {
            let remaining = formatTimeLeft(data.timestamp)
            let nMsg = `⌬ ❯ **SILENZIO**\nL'account @${m.sender.split('@')[0]} e' mutato.\nMotivo: ${data.reason}\nTempo: ${remaining}`;
            try {
                await conn.sendMessage(m.chat, { text: nMsg, contextInfo: legamContext('Notifica', [m.sender]) })
                data.lastNotification = now
                mutedUsers.set(normalizedSender, data)
            } catch (e) {}
        }
    } catch (err) {}
    return false
}

setInterval(() => {
    const now = Date.now()
    for (let [user, data] of mutedUsers.entries()) {
        if (data.timestamp && now > data.timestamp) mutedUsers.delete(user)
    }
}, 60000)

handler.help = ['muta', 'smuta', 'listamutati']
handler.tags = ['gruppo']
handler.command = /^(muta|smuta|listamutati)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
