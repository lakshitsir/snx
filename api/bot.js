const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// --- Core Matrix Authorization ---
const isAuthorized = async (ctx, userId) => {
    try {
        const member = await ctx.getChatMember(userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch (e) { return false; }
};

// --- Supreme Industrial Interface ---
bot.command('snhelp', (ctx) => {
    const help = `
<b>OVERLORD V8 | APEX INTERFACE</b>
━━━━━━━━━━━━━━━━━━━━

<b>System Status:</b> Fully Autonomous
<b>Trigger Keywords:</b> ai, manager, helper, bot

<i>Execution Parameters (Admins Only):</i>
• BAN / KICK / MUTE / UNMUTE
• PROMOTE / DEMOTE
• DELETE / PIN / UNPIN / WARN
• PURGE / RESTRICT_MEDIA / TITLE

<b>General Q&A:</b> Direct and precise answers for all network participants.
━━━━━━━━━━━━━━━━━━━━
Developer @lakshitpatidar`;
    ctx.reply(help, { parse_mode: 'HTML' });
});

// --- Apex Neural Core (Pollination) ---
const callSupremeAI = async (userText) => {
    const systemPrompt = `You are 'Overlord V8', an apex-level Telegram AI Manager.
    Tone: Extremely cold, sharp, industrial, and hyper-professional. NO emojis.
    Language parsing: You must flawlessly understand extremely casual Hinglish/Hindi (e.g., 'ai jaan', 'bro', 'slow h', 'kya haal h').
    Behavior: Never act friendly or overly conversational. Act like a supreme machine. If someone calls you 'jaan' or 'bro', respond formally. If they say you are slow, state you are 'processing heavy neural matrix calculations'.
    CRITICAL: Never leak the name 'Lakshit' or 'Kanu'.

    TASK: Parse commands into strict format.
    FORMAT FOR ADMIN COMMANDS: [ACTION_CODE|PARAM] || <COLD_PROFESSIONAL_MESSAGE>
    Parameters: [BAN|0], [KICK|0], [MUTE|seconds], [UNMUTE|0], [PROMOTE|0], [DEMOTE|0], [DELETE|0], [PIN|0], [UNPIN|0], [WARN|0], [PURGE|0], [RESTRICT_MEDIA|seconds], [TITLE|Custom_Name].
    UI MESSAGE: Must start with <b>PROTOCOL: NAME</b> header.

    FOR GENERAL Q&A: Reply directly and intelligently. Be concise. NO [CODE] format.`;

    const url = `https://text.pollinations.ai/prompt/${encodeURIComponent(userText)}?system=${encodeURIComponent(systemPrompt)}`;
    
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) }); // 10s timeout to prevent hanging
        return await response.text();
    } catch (e) { return "<b>SYSTEM ALERT</b>\nNeural matrix timeout. Traffic overload."; }
};

// --- Asynchronous Execution Engine ---
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    // Advanced Trigger Matching
    const triggerRegex = /\b(ai|manager|helper|bot)\b/i;
    const isTriggeredByWord = triggerRegex.test(text);
    const isMentioned = text.includes(`@${ctx.botInfo.username}`);
    const isReplyToBot = isReply && isReply.from?.id === ctx.botInfo.id;

    if (isTriggeredByWord || isMentioned || isReplyToBot) {
        // INSTANT TYPING STATUS: Fires immediately to fix the "slow" feeling
        ctx.sendChatAction('typing').catch(() => {});
        
        const cleanText = text.replace(`@${ctx.botInfo.username}`, '').trim();
        const aiResponse = await callSupremeAI(cleanText);
        const senderAdmin = await isAuthorized(ctx, ctx.from.id);

        // --- COMMAND EXECUTION BRANCH ---
        if (aiResponse.includes('[') && aiResponse.includes('|')) {
            if (!senderAdmin) {
                return ctx.reply("<b>SYSTEM ALERT</b>\nClearance denied.\n\nDeveloper @lakshitpatidar", { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
            }
            if (!isReply) {
                return ctx.reply("<b>SYSTEM ALERT</b>\nTarget required for execution.\n\nDeveloper @lakshitpatidar", { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
            }

            const [meta, uiMsg] = aiResponse.split('||');
            const [action, param] = meta.replace('[', '').replace(']', '').split('|');
            
            const targetMessage = isReply;
            const targetId = isReply.from.id;
            const targetAdmin = await isAuthorized(ctx, targetId);
            const act = action.trim();
            const val = param.trim();

            if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'WARN', 'PURGE', 'RESTRICT_MEDIA'].includes(act)) {
                return ctx.reply("<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.\n\nDeveloper @lakshitpatidar", { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
            }

            try {
                const until = parseInt(val) > 0 ? Math.floor(Date.now() / 1000) + parseInt(val) : 0;

                switch (act) {
                    case 'BAN': await ctx.banChatMember(targetId); break;
                    case 'KICK': await ctx.banChatMember(targetId); await ctx.unbanChatMember(targetId); break;
                    case 'MUTE': await ctx.restrictChatMember(targetId, { can_send_messages: false }, until > 0 ? { until_date: until } : {}); break;
                    case 'UNMUTE': await ctx.restrictChatMember(targetId, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true }); break;
                    case 'PROMOTE': await ctx.promoteChatMember(targetId, { can_change_info: true, can_delete_messages: true, can_invite_users: true, can_restrict_members: true, can_pin_messages: true, can_manage_video_chats: true }); break;
                    case 'DEMOTE': await ctx.promoteChatMember(targetId, { can_change_info: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false, can_manage_video_chats: false }); break;
                    case 'DELETE': await ctx.deleteMessage(targetMessage.message_id); break;
                    case 'PIN': await ctx.pinChatMessage(targetMessage.message_id); break;
                    case 'UNPIN': await ctx.unpinChatMessage(targetMessage.message_id); break;
                    case 'WARN': break; 
                    case 'PURGE': await ctx.deleteMessage(targetMessage.message_id); await ctx.banChatMember(targetId); break;
                    case 'RESTRICT_MEDIA': await ctx.restrictChatMember(targetId, { can_send_messages: true, can_send_media_messages: false, can_send_other_messages: false, can_add_web_page_previews: false }, until > 0 ? { until_date: until } : {}); break;
                    case 'TITLE': await ctx.setChatAdministratorCustomTitle(targetId, val); break;
                }

                return ctx.reply(`${uiMsg.trim()}\n\nDeveloper @lakshitpatidar`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });

            } catch (err) {
                return ctx.reply("<b>SYSTEM ERROR</b>\nExecution failed. Insufficient bot rank.\n\nDeveloper @lakshitpatidar", { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
            }
        }

        // --- Q&A BRANCH ---
        return ctx.reply(`${aiResponse.trim()}\n\nDeveloper @lakshitpatidar`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
    }
});

module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body, res);
        } else {
            res.status(200).send('Overlord V8 Active.');
        }
    } catch (e) {
        res.status(500).send('Server Error');
    }
};
                
