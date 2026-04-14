import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
    const head = '// 787 BOT // AGGIORNAMENTO //'
    const line = '----------------------------'
    
    try {
        let checkUpdates = execSync('git fetch && git status -uno', { encoding: 'utf-8' })

        if (checkUpdates.includes('Your branch is up to date') || checkUpdates.includes('nothing to commit')) {
            let msg = `${head}\n\nSistema aggiornato.\nNessuna modifica rilevata ✔.\n\n${line}`
            
            await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
            return
        }

        let updateLog = execSync('git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })
        let msg = `${head}\n\nSincronizzazione completata.\n\nLog:\n${updateLog.trim()}\n\n${line}`
        
        await conn.sendMessage(m.chat, { text: msg }, { quoted: m })

    } catch (err) {
        let msg = `// 787 BOT // ERRORE //\n\nFallimento aggiornamento.\n\nDettaglio:\n${err.message.trim()}\n\n${line}`
        
        await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    }
}

handler.help = ['aggiorna']
handler.tags = ['creatore']
handler.command = ['aggiorna', 'update']
handler.owner = true

export default handler
