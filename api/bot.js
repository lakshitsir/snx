const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEVELOPER_TAG = "\n\nDeveloper @lakshitpatidar";
const processedUpdates = new Set();

// ==========================================
// 2. MATRIX AUTHORIZATION
// ==========================================
const isAuthorized = async (ctx, userId) => {
    try {
        const member = await ctx.getChatMember(userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch (e) { return false; }
};

// ==========================================
// 3. APEX NEURAL CORE (Universal Stable Endpoint)
// ==========================================
const callSupremeAI = async (userText) => {
    // Single consolidated prompt to avoid query string parameter crashes
    const fullPrompt = `You are 'Overlord', an elite, cold, and professional Telegram Group AI Manager. Do NOT use emojis. Never mention 'Lakshit' or 'Kanu'.

    TASK 1 (MODERATION): If the user orders an admin action (e.g., ban, mute, kick, unban, uda do, chup kar), extract the action and target ID.
    You MUST output EXACTLY in this format:
    [ACTION_CODE|PARAM|TARGET_ID] || <b>PROTOCOL: [NAME]</b>\n<Cold System Message>

    Action Codes: BAN, UNBAN, KICK, MUTE, UNMUTE, PROMOTE, DEMOTE, DELETE, PIN, UNPIN, WARN, PURGE, RESTRICT_MEDIA, TITLE.
    PARAM: Seconds for mute (e.g. 600) or Custom title. Else 0.
    TARGET_ID: If a numeric user ID (like 8394257805) is in the text, extract it. Otherwise write 'REPLY'.

    Example: "8394257805 ko ban kr do" -> [BAN|0|8394257805] || <b>PROTOCOL: EXILE</b>\nTarget 8394257805 has been terminated.
    Example: "isko uda do" -> [BAN|0|REPLY] || <b>PROTOCOL: EXILE</b>\nTarget terminated.

    TASK 2 (Q&A): If it is a normal question or chat, reply naturally, directly, and professionally. NO [CODE] format.

    USER TEXT TO PROCESS: "${userText}"`;

    // Universal stable GET request (Bypasses all recent server changes)
    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) }); // Safe 15s limit
        if (!response.ok) throw new Error("API Node Offline");
        const text = await response.text();
        return text.replace(/```html|```/gi, '').trim(); 
    } catch (e) { 
        console.error("AI Fetch Error:", e.message);
        return "<b>SYSTEM ALERT</b>\nNeural matrix timeout. Traffic overload."; 
    }
};

// ==========================================
// 4. SUPREME COMMAND INTERFACE
// ==========================================
bot.command(['start', 'snhelp'], (ctx) => {
    const help = `
<b>OVERLORD V15 | APEX MATRIX</b>
━━━━━━━━━━━━━━━━━━━━
<b>Status:</b> Universal Stable Protocol Active
<b>Triggers:</b> ai, manager, helper, bot

<i>Targeting Methods:</i>
1. Reply to a message.
2. Provide User ID (e.g., "ai 8394257805 ko mute kr").

<i>Parameters (Admins Only):</i>
• BAN / UNBAN / KICK / MUTE / UNMUTE 
• PROMOTE / DEMOTE / WARN / PURGE
• DELETE / PIN / UNPIN / RESTRICT_MEDIA / TITLE
━━━━━━━━━━━━━━━━━━━━${DEVELOPER_TAG}`;
    ctx.reply(help, { parse_mode: 'HTML' }).catch(() => {});
});

// ==========================================
// 5. CORE ROUTING & EXECUTION ENGINE
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    const triggerRegex = /\b(ai|manager|helper|bot)\b/i;
    const isTriggeredByWord = triggerRegex.test(text);
    const isMentioned = text.includes(`@${ctx.botInfo.username}`);
    const isReplyToBot = isReply && isReply.from?.id === ctx.botInfo.id;

    if (!isTriggeredByWord && !isMentioned && !isReplyToBot) return next();

    ctx.sendChatAction('typing').catch(() => {});
    
    const cleanText = text.replace(`@${ctx.botInfo.username}`, '').trim();
    const aiResponse = await callSupremeAI(cleanText);
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    // --- BRANCH A: COMMAND EXECUTION ---
    if (aiResponse.includes('[') && aiResponse.includes('|') && aiResponse.includes('||')) {
        if (!senderAdmin) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const [meta, uiMsg] = aiResponse.split('||');
        const [action, param, aiTargetId] = meta.replace('[', '').replace(']', '').split('|');
        
        const act = action.trim();
        const val = param ? param.trim() : '0';
        let finalTargetId = null;
        let targetMessage = null;

        if (aiTargetId && aiTargetId.trim() !== 'REPLY' && !isNaN(aiTargetId.trim())) {
            finalTargetId = parseInt(aiTargetId.trim());
        } else if (isReply) {
            finalTargetId = isReply.from.id;
            targetMessage = isReply;
        }

        if (!finalTargetId) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget ID missing. Reply to a message OR type the User ID.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const targetAdmin = await isAuthorized(ctx, finalTargetId);

        if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'WARN', 'PURGE', 'RESTRICT_MEDIA'].includes(act)) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        try {
            const until = parseInt(val) > 0 ? Math.floor(Date.now() / 1000) + parseInt(val) : 0;

            switch (act) {
                case 'BAN': await ctx.banChatMember(finalTargetId); break;
                case 'UNBAN': await ctx.unbanChatMember(finalTargetId, { only_if_banned: true }); break;
                case 'KICK': await ctx.banChatMember(finalTargetId); await ctx.unbanChatMember(finalTargetId); break;
                case 'MUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: false }, until > 0 ? { until_date: until } : {}); break;
                case 'UNMUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true }); break;
                case 'PROMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: true, can_delete_messages: true, can_invite_users: true, can_restrict_members: true, can_pin_messages: true, can_manage_video_chats: true }); break;
                case 'DEMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false, can_manage_video_chats: false }); break;
                case 'RESTRICT_MEDIA': await ctx.restrictChatMember(finalTargetId, { can_send_messages: true, can_send_media_messages: false, can_send_other_messages: false, can_add_web_page_previews: false }, until > 0 ? { until_date: until } : {}); break;
                case 'TITLE': await ctx.setChatAdministratorCustomTitle(finalTargetId, val); break;
                case 'DELETE': if (targetMessage) await ctx.deleteMessage(targetMessage.message_id); break;
                case 'PIN': if (targetMessage) await ctx.pinChatMessage(targetMessage.message_id); break;
                case 'UNPIN': if (targetMessage) await ctx.unpinChatMessage(targetMessage.message_id); break;
                case 'PURGE': if (targetMessage) await ctx.deleteMessage(targetMessage.message_id); await ctx.banChatMember(finalTargetId); break;
                case 'WARN': break;
            }

            return ctx.reply(`${uiMsg.trim()}${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});

        } catch (err) {
            let errMsg = "Execution failed. The User ID might be invalid, not in the group, or the bot lacks permissions.";
            if (err.message.includes("can't remove chat owner")) errMsg = "Cannot execute action against the Chat Owner.";
            if (err.message.includes("USER_NOT_PARTICIPANT")) errMsg = "This User ID is not a participant of this group.";
            
            return ctx.reply(`<b>SYSTEM ERROR</b>\n${errMsg}${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

    // --- BRANCH B: Q&A ---
    return ctx.reply(`${aiResponse.trim()}${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
});

// ==========================================
// 6. SERVERLESS WEBHOOK HANDLER
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
            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        }
        res.status(200).send('OVERLORD V15 is Online.');
    } catch (e) {
        return res.status(200).send('OK');
    }
};
       
