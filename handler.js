import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@realvare/baileys'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}
global.processedWelcome = new Set() 

if (!global.groupCache) global.groupCache = new NodeCache({ stdTTL: 300, useClones: false })
if (!global.jidCache) global.jidCache = new NodeCache({ stdTTL: 600, useClones: false })
if (!global.nameCache) global.nameCache = new NodeCache({ stdTTL: 600, useClones: false });

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try { return await conn.groupMetadata(chatId); } 
        catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Listener Cache e Poll (Mantengo la logica originale)
if (!global.cacheListenersSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                if (!update || !update.id) continue;
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (metadata) global.groupCache.set(update.id, metadata, { ttl: 300 })
                } catch (e) {}
            }
        })
        global.cacheListenersSet = true
    }
}

const isNumber = x => typeof x === 'number' && !isNaN(x)
const responseHandlers = new Map()

function initResponseHandler(conn) {
    if (!conn.waitForResponse) {
        conn.waitForResponse = async (chat, sender, options = {}) => {
            const { timeout = 30000, onTimeout = null } = options
            return new Promise((resolve) => {
                const key = chat + sender
                const timeoutId = setTimeout(() => {
                    responseHandlers.delete(key)
                    if (onTimeout) onTimeout()
                    resolve(null)
                }, timeout)
                responseHandlers.set(key, { resolve, timeoutId })
            })
        }
    }
}

// ==========================================
// 787 BOT - GESTIONE PARTECIPANTI (MINIMAL)
// ==========================================
export async function participantsUpdate({ id, participants, action }) {
    try {
        let eventKey = `${action}_${id}_${participants.join('')}`
        if (global.processedWelcome.has(eventKey)) return;
        global.processedWelcome.add(eventKey);
        setTimeout(() => global.processedWelcome.delete(eventKey), 10000);

        if (action !== 'add' && action !== 'remove') return;

        console.log(chalk.black.bgWhite(' 787 ') + chalk.gray(` Evento: ${action} ➡ ${id.split('@')[0]}`));

        if (global.opts['self']) return;
        let chat = global.db.data.chats[id] || {};
        if (!chat.welcome) return;

        let groupMetadata = global.groupCache.get(id) || await this.groupMetadata(id).catch(_ => null) || {};
        let groupName = groupMetadata.subject || 'Group';

        for (let user of participants) {
            let pp = await this.profilePictureUrl(user, 'image').catch(_ => 'https://files.catbox.moe/57bmbv.jpg');
            let cleanUser = user.split('@')[0];
            let text = '';

            if (action === 'add') {
                text = chat.sWelcome || `➡ INGRESSO\n\nUtente: @${cleanUser}\nGruppo: ${groupName}\n\n↪ Benvenuto nel sistema 787.`;
            } else if (action === 'remove') {
                text = chat.sBye || `↩ USCITA\n\nUtente: @${cleanUser}\nGruppo: ${groupName}\n\n↪ Connessione interrotta.`;
            }

            if (!text) continue;

            await this.sendMessage(id, {
                text: text,
                mentions: [user],
                contextInfo: {
                    mentionedJid: [user],
                    externalAdReply: {
                        title: action === 'add' ? '787 ➡ JOIN' : '787 ↩ LEAVE',
                        body: 'System Status: Active',
                        mediaType: 1, 
                        renderLargerThumbnail: false,
                        thumbnailUrl: pp,
                        sourceUrl: ''
                    }
                }
            });
        }
    } catch (e) { console.error(e) }
}

// ==========================================
// HANDLER PRINCIPALE
// ==========================================
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
        m.key = m.message.protocolMessage.key;
        m.message = m.message.protocolMessage.editedMessage;
    }

    m = smsg(this, m, global.store)
    if (!m || !m.key || !m.chat || !m.sender) return

    // Gestione StubType per add/remove
    if (m.messageStubType && m.isGroup) {
        let actionTrigger = m.messageStubType === 27 ? 'add' : (m.messageStubType === 28 || m.messageStubType === 32 ? 'remove' : '');
        if (actionTrigger) {
            participantsUpdate.call(this, { id: m.chat, participants: [m.messageStubParameters[0]], action: actionTrigger });
        }
    }

    if (m.key.participant?.includes(':')) return
    if (m.key) m.key.remoteJid = this.decodeJid(m.key.remoteJid)
    if (!m.key.remoteJid) return
    
    // Estrazione testo (Bottoni/Messaggi)
    let extractedText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try { extractedText = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id; } catch (e) {}
    }
    if (extractedText) m.text = extractedText;

    initResponseHandler(this)

    try {
        if (!global.db.data) await global.loadDatabase()
        let normalizedSender = this.decodeJid(m.sender)
        
        let user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = { euro: 10, banned: false, name: m.pushName || 'User' })
        let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = { isBanned: false, welcome: false, modoadmin: false })
        let settings = global.db.data.settings[this.user.jid] || (global.db.data.settings[this.user.jid] = { antiPrivate: true })

        // Log Console Minimalista
        if (m.text && !m.messageStubType) {
            let orario = new Date().toLocaleTimeString('it-IT');
            let isCmd = /^[.#!\\/]/.test(m.text.trim());
            console.log(
                chalk.black.bgWhite(' 787 ') + ' ' +
                chalk.gray(`[${orario}]`) + ' ' +
                (isCmd ? chalk.white.bold(`[CMD] `) : chalk.gray(`[MSG] `)) + 
                chalk.white(`${m.pushName || 'Guest'} ➡ `) + 
                chalk.cyan(m.text.substring(0, 30))
            );
        }

        // Plugin Loop
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix || global.prefix || '.'
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(m.text), p]) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]] : [[[], new RegExp]]).find(p => p[1])

            if (!match || !match[0]) continue
            let usedPrefix = (match[0] || '')[0]
            
            if (usedPrefix) {
                let noPrefix = m.text.replace(usedPrefix, '').trim()
                let [command, ...args] = noPrefix.split(/\s+/).filter(v => v)
                command = command?.toLowerCase() || ''
                
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

                // Check Permessi Minimal
                let isOwner = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender) || m.fromMe
                if (plugin.owner && !isOwner) { global.dfail('owner', m, this); continue }
                if (plugin.group && !m.isGroup) { global.dfail('group', m, this); continue }

                try {
                    await plugin.call(this, m, { match, usedPrefix, noPrefix, args, command, text: args.join(' '), conn: this, isOwner })
                } catch (e) {
                    m.reply(`➡ ERROR\n\n↪ ${String(e)}`)
                }
                break 
            }
        }
    } catch (e) { console.error(e) }
}

global.dfail = async (type, m, conn) => {
    const msg = {
        owner:   '➡ ACCESSO NEGATO\n↪ Richiesto: Owner',
        group:   '➡ ERRORE AMBIENTE\n↪ Eseguire in: Gruppo',
        admin:   '➡ PERMESSI INSUFFICIENTI\n↪ Richiesto: Admin',
        botAdmin: '➡ CONFIGURAZIONE ERRATA\n↪ Requisito: Bot Admin'
    }[type]
    if (msg) conn.reply(m.chat, msg, m)
}
