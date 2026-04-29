const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEV_TAG = "\n\nDeveloper @snxdad";
const processedUpdates = new Set();

const GROQ_API_KEY = "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";

// DYNAMIC USER-AGENTS (For Proxy Spoofing)
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1) Version/17.1 Safari/604.1"
];
const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// 2. ABSOLUTE MATRIX AUTHORIZATION
// ==========================================
const isAuthorized = async (ctx, userId) => {
    try {
        const member = await ctx.getChatMember(userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch (e) { return false; }
};

// ==========================================
// 3. LAYER 1: MASSIVE REGEX MATRIX (Max Level)
// ==========================================
const getLocalCommand = (text) => {
    const t = text.toLowerCase();
    let act = null, ui = "";

    if (t.match(/\b(unban|ban hata|wapas|unblock|restore|maaf|pardon|aane do|chhod do|revert|andar lo)\b/)) { 
        act = 'UNBAN'; ui = `<b>PROTOCOL: RESTORE</b>\n${getRand(['Target restriction lifted.', 'User pardoned.', 'Exile protocol reversed.'])}`; 
    }
    else if (t.match(/\b(unmute|mute hata|bolne do|unsilence|aawaz kholo|allow|bolna shuru|awaz khol)\b/)) { 
        act = 'UNMUTE'; ui = `<b>PROTOCOL: RESTORE</b>\n${getRand(['Communications link re-established.', 'Target is now allowed to speak.'])}`; 
    }
    else if (t.match(/\b(unpin|pin hata|hata de upar|unhook|niche|utaar)\b/)) { 
        act = 'UNPIN'; ui = `<b>PROTOCOL: UNHOOK</b>\n${getRand(['Data fragment detached.', 'Message unpinned.'])}`; 
    }
    else if (t.match(/\b(unwarn|warn hata|warning hata|galti maaf|chhod de|maafi)\b/)) { 
        act = 'UNWARN'; ui = `<b>PROTOCOL: PARDON</b>\n${getRand(['Warning revoked.', 'Target pardoned. Record cleared.'])}`; 
    }
    else if (t.match(/\b(ban|uda|nikal|kick|hatao|block|dafa|bhaga|terminate|exile|rusticate|bahar|chutti|feko|gayab|dafa kar|hamesha ke liye)\b/)) { 
        act = 'BAN'; ui = `<b>PROTOCOL: EXILE</b>\n${getRand(['Target has been permanently terminated.', 'User exiled from the matrix.'])}`; 
    }
    else if (t.match(/\b(mute|chup|thanda|aawaz band|shant|silence|muh band|jubaan band|bakwas band|bolna band)\b/)) { 
        act = 'MUTE'; ui = `<b>PROTOCOL: SILENCE</b>\n${getRand(['Target vocal subroutines suspended.', 'User has been silenced.'])}`; 
    }
    else if (t.match(/\b(promote|admin bana|power do|superpower|elevate|rank up|make admin|sahab|baap bana)\b/)) { 
        act = 'PROMOTE'; ui = `<b>PROTOCOL: ELEVATION</b>\n${getRand(['Security clearance upgraded to Admin.', 'Target promoted.'])}`; 
    }
    else if (t.match(/\b(demote|power chheen|hatao admin|strip|rank down|remove admin|power lelo|normal user|aukat me la)\b/)) { 
        act = 'DEMOTE'; ui = `<b>PROTOCOL: STRIP</b>\n${getRand(['Administrative privileges revoked.', 'Target stripped of all powers.'])}`; 
    }
    else if (t.match(/\b(delete|mita|erase|remove message|clear msg|kachra hatao|msg delete|gayab kar isko)\b/)) { 
        act = 'DELETE'; ui = `<b>PROTOCOL: ERASE</b>\n${getRand(['Data fragment permanently deleted.', 'Message wiped.'])}`; 
    }
    else if (t.match(/\b(pin|chipka|upar|highlight|top|board pe)\b/)) { 
        act = 'PIN'; ui = `<b>PROTOCOL: HIGHLIGHT</b>\n${getRand(['Data fragment secured at top.', 'Message pinned successfully.'])}`; 
    }
    else if (t.match(/\b(purge|kachra saaf|destroy|clear all|sab mitao|sab delete)\b/)) { 
        act = 'PURGE'; ui = `<b>PROTOCOL: PURGE</b>\n${getRand(['Data erased and target exiled.', 'Complete purge executed.'])}`; 
    }
    else if (t.match(/\b(warn|warning|alert|dhamki|dhamka)\b/)) { 
        act = 'WARN';
        const numMatch = text.match(/\b(\d+)\b/);
        const count = numMatch ? ` (Count: ${numMatch[0]})` : '';
        ui = `<b>PROTOCOL: WARNING</b>\nTarget has been issued a formal warning${count}. Cease current behavior immediately.`; 
    }

    return act ? { act, val: '0', ui } : null;
};

// ==========================================
// 4. LAYER 2: ROTATING AI ENGINE (Groq + Custom API)
// ==========================================
const isCorrupted = (text) => /(429|403|500|backend api|currently unavailable|too many requests|rate limit)/i.test(text);

const cleanResponse = (rawData) => {
    let clean = rawData;
    try {
        const parsed = JSON.parse(rawData);
        if (parsed.data) clean = parsed.data;
        else if (parsed.response) clean = parsed.response;
        else if (parsed.message) clean = parsed.message;
    } catch (err) {} 
    
    clean = clean.replace(/(Powered by|Engineered by|Developer)\s*(@lakshitpatidar|@snxdad)/gi, '').trim();
    clean = clean.replace(/```html|```/gi, '').trim();
    clean = clean.replace(/[\r\n]+$/, '');
    return clean;
};

// VIRTUAL PROXY GENERATOR
const getSpoofedHeaders = () => {
    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    return {
        'User-Agent': getRand(userAgents),
        'X-Forwarded-For': randomIP,
        'X-Real-IP': randomIP,
        'Client-IP': randomIP,
        'Via': `1.1 ${randomIP}`
    };
};

const callAI = async (userText) => {
    const injectedPrompt = `You are 'Overlord', an elite Telegram AI Manager. Developer: Lakshit Patidar (@snxdad).
    TASK 1: Admin commands (ban, mute, warn, etc.) -> EXACTLY: [ACTION_CODE|0|TARGET_ID] || <b>PROTOCOL: SYSTEM</b>\n<Message>
    Codes: BAN, UNBAN, MUTE, UNMUTE, PROMOTE, DEMOTE, DELETE, PIN, UNPIN, PURGE, WARN, UNWARN.
    TARGET_ID: Numeric ID if present, else 'REPLY'.
    TASK 2: If normal Q&A, reply normally.
    User Text: ${userText}`;

    // ENGINE 1: Custom API
    const runCustomAPI = async () => {
        const url = `https://mplakshit.vercel.app/api/ai?prompt=${encodeURIComponent(injectedPrompt)}`;
        const res = await fetch(url, { headers: getSpoofedHeaders(), signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error("Custom API Fail");
        let data = cleanResponse(await res.text());
        if (isCorrupted(data)) throw new Error("Rate Limit Hit");
        return data;
    };

    // ENGINE 2: Groq API
    const runGroqAPI = async () => {
        const url = "https://api.groq.com/openai/v1/chat/completions";
        const payload = {
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "You are Overlord, an AI created by Lakshit Patidar (@snxdad). Follow instructions strictly." },
                { role: "user", content: injectedPrompt }
            ],
            temperature: 0.7, max_tokens: 500
        };
        const res = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error("Groq API Fail");
        const data = await res.json();
        return cleanResponse(data.choices[0].message.content);
    };

    // ROTATION LOGIC (Randomly pick primary, if it fails, fallback to secondary)
    const apis = Math.random() > 0.5 ? [runCustomAPI, runGroqAPI] : [runGroqAPI, runCustomAPI];

    for (const apiCall of apis) {
        try {
            const result = await apiCall();
            if (result) return result;
        } catch (e) {
            // Silently suppress the error and loop to the next API
            continue; 
        }
    }

    // 100% SUPPRESSED FALLBACK IF BOTH ENGINES FAIL
    return "<b>SYSTEM UPDATE</b>\nNeural matrix calibrating to handle massive traffic. Stand by.";
};

// ==========================================
// 5. CORE EXECUTION ENGINE
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    const trigger = /\b(ai|manager)\b/i;
    const isCommand = text.startsWith('/');
    
    if (!trigger.test(text) && !text.includes(`@${ctx.botInfo.username}`) && !(isReply && isReply.from?.id === ctx.botInfo.id) && !isCommand) {
        return next();
    }

    let cleanText = text.replace(`@${ctx.botInfo.username}`, '').replace(/^\//, '').trim();
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    let actionData = getLocalCommand(cleanText); 
    let aiChatResponse = "";

    if (!actionData) {
        const aiOutput = await callAI(cleanText);
        if (aiOutput.includes('[') && aiOutput.includes('|') && aiOutput.includes('||')) {
            const [meta, uiMsg] = aiOutput.split('||');
            const [act, val, aiTargetId] = meta.replace('[', '').replace(']', '').split('|');
            actionData = { act: act.trim(), val: val ? val.trim() : '0', ui: uiMsg.trim(), aiTargetId: aiTargetId?.trim() };
        } else {
            aiChatResponse = aiOutput; 
        }
    }

    // --- ADMIN EXECUTION ---
    if (actionData) {
        if (!senderAdmin) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied. Designated Admins only.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        let finalTargetId = null;
        let targetMessage = isReply;

        const idMatch = cleanText.match(/\b\d{8,15}\b/);
        const usernameMatch = cleanText.match(/@([a-zA-Z0-9_]{5,32})/); 

        if (idMatch) finalTargetId = parseInt(idMatch[0]);
        else if (actionData.aiTargetId && actionData.aiTargetId !== 'REPLY' && !isNaN(actionData.aiTargetId)) finalTargetId = parseInt(actionData.aiTargetId);
        else if (isReply) finalTargetId = isReply.from.id;

        const reqReply = ['PIN', 'UNPIN', 'DELETE', 'PURGE'];
        if (reqReply.includes(actionData.act) && !targetMessage) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective failed. Target message required (Reply).${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } else if (!finalTargetId && !reqReply.includes(actionData.act)) {
            if (usernameMatch) {
                return ctx.reply(`<b>SYSTEM ALERT</b>\nCannot resolve <b>${usernameMatch[0]}</b> without database caching. Please <b>Reply</b> or use <b>Numeric ID</b>.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
            }
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget ID missing. Reply or provide numeric ID.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        if (finalTargetId === ctx.from.id) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective illogical. Cannot execute punitive protocols upon yourself.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
        if (finalTargetId === ctx.botInfo.id) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nCannot execute directives upon my own system core.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const targetAdmin = finalTargetId ? await isAuthorized(ctx, finalTargetId) : false;

        if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'PURGE'].includes(actionData.act)) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        try {
            switch (actionData.act) {
                case 'BAN': await ctx.banChatMember(finalTargetId); break;
                case 'UNBAN': await ctx.unbanChatMember(finalTargetId, { only_if_banned: true }); break;
                case 'MUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: false }); break;
                case 'UNMUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true }); break;
                case 'PROMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: true, can_delete_messages: true, can_invite_users: true, can_restrict_members: true, can_pin_messages: true }); break;
                case 'DEMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false }); break;
                case 'DELETE': await ctx.deleteMessage(targetMessage.message_id); break;
                case 'PIN': await ctx.pinChatMessage(targetMessage.message_id); break;
                case 'UNPIN': await ctx.unpinChatMessage(targetMessage.message_id); break;
                case 'PURGE': await ctx.deleteMessage(targetMessage.message_id); await ctx.banChatMember(finalTargetId); break;
                case 'WARN': 
                case 'UNWARN': 
                    break; 
            }
            return ctx.reply(`${actionData.ui}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } catch (err) {
            // SILENT ERROR SUPPRESSION
            return ctx.reply(`<b>SYSTEM ALERT</b>\nAction cannot be executed. Verify hierarchy and bot permissions.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

    // --- CHAT EXECUTION ---
    if (aiChatResponse) {
        return ctx.reply(`${aiChatResponse}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
    }
});

// ==========================================
// 6. ANTI-LOOP WEBHOOK
// ==========================================
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const updateId = req.body.update_id;
            if (updateId) {
                if (processedUpdates.has(updateId)) return res.status(200).send('OK'); 
                processedUpdates.add(updateId);
                if (processedUpdates.size > 500) processedUpdates.clear();
            }
            bot.handleUpdate(req.body).catch(() => {});
            return res.status(200).send('OK');
        }
        res.status(200).send('OVERLORD V34 Dual-Core Matrix Online.');
    } catch (e) {
        return res.status(200).send('OK');
    }
};
    
