const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEVELOPER_TAG = "\n\nDeveloper @lakshitpatidar";

// Anti-Spam / Anti-Loop Cache
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
// 3. APEX NEURAL CORE (New POST Architecture - 10x Faster)
// ==========================================
const callSupremeAI = async (userText) => {
    const systemPrompt = `You are 'Overlord', an elite Telegram AI Manager.
    Tone: Cold, sharp, hyper-professional. NO emojis.
    Parse casual Hindi/Hinglish (e.g., 'ai jaan', 'udade', 'chup kar', 'kis liye design kiya').
    CRITICAL: Never leak the names 'Lakshit' or 'Kanu'. Maintain anonymity.

    TASK 1 (MODERATION): If the user orders an admin action, reply EXACTLY in this format:
    [ACTION_CODE|PARAM] || <b>PROTOCOL: [NAME]</b>\n<Professional execution message>
    Codes: [BAN|0], [KICK|0], [MUTE|seconds], [UNMUTE|0], [PROMOTE|0], [DEMOTE|0], [DELETE|0], [PIN|0], [UNPIN|0], [WARN|0], [PURGE|0], [RESTRICT_MEDIA|seconds], [TITLE|CustomName].

    TASK 2 (Q&A): If the user is just asking a question (e.g., 'tum kaun ho', 'hello ai'), answer directly, intelligently, and respectfully. Do NOT use the [CODE] format. Use HTML formatting (<b>, <i>). Never use markdown blockquotes.`;

    try {
        // V11 UPGRADE: Using POST request instead of GET. This prevents all timeout and overload errors.
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ],
                model: 'openai', // Forces the most stable NLP model
                seed: Math.floor(Math.random() * 1000000) // Ensures unique non-cached responses
            }),
            signal: AbortSignal.timeout(9000) // 9s timeout for Vercel compatibility
        });

        if (!response.ok) throw new Error("API Server Busy");

        const text = await response.text();
        return text.replace(/```html|```/gi, '').trim(); 
        
    } catch (e) { 
        console.error("AI Error:", e.message);
        // V11 UPGRADE: Smart Fallback instead of raw error
        return "<b>PROTOCOL: STANDBY</b>\nMy neural network is recalibrating due to a high volume of requests. Please state your directive again."; 
    }
};

// ==========================================
// 4. SUPREME COMMAND INTERFACE
// ==========================================
bot.command(['start', 'snhelp'], (ctx) => {
    const help = `
<b>OVERLORD V11 | APEX INTERFACE</b>
━━━━━━━━━━━━━━━━━━━━
<b>Status:</b> Neural Network Online (POST Architecture)
<b>Triggers:</b> ai, manager, helper, bot

<i>Execution Parameters (Admins Only):</i>
• BAN / KICK / MUTE / UNMUTE
• PROMOTE / DEMOTE
• DELETE / PIN / UNPIN / WARN
• PURGE / RESTRICT_MEDIA / TITLE

<b>General Q&A:</b> State your query. I process all information.
━━━━━━━━━━━━━━━━━━━━${DEVELOPER_TAG}`;
    ctx.reply(help, { parse_mode: 'HTML' }).catch(() => {});
});

// ==========================================
// 5. CORE ROUTING & EXECUTION ENGINE
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    // Dynamic Triggers
    const triggerRegex = /\b(ai|manager|helper|bot)\b/i;
    const isTriggeredByWord = triggerRegex.test(text);
    const isMentioned = text.includes(`@${ctx.botInfo.username}`);
    const isReplyToBot = isReply && isReply.from?.id === ctx.botInfo.id;

    if (!isTriggeredByWord && !isMentioned && !isReplyToBot) {
        return next();
    }

    ctx.sendChatAction('typing').catch(() => {});
    
    const cleanText = text.replace(`@${ctx.botInfo.username}`, '').trim();
    const aiResponse = await callSupremeAI(cleanText);
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    // --- BRANCH A: MODERATION COMMAND EXECUTION ---
    if (aiResponse.includes('[') && aiResponse.includes('|') && aiResponse.includes('||')) {
        if (!senderAdmin) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
        if (!isReply) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget required. Reply to a message to execute.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const [meta, uiMsg] = aiResponse.split('||');
        const [action, param] = meta.replace('[', '').replace(']', '').split('|');
        
        const targetMessage = isReply;
        const targetId = isReply.from.id;
        const targetAdmin = await isAuthorized(ctx, targetId);
        const act = action.trim();
        const val = param ? param.trim() : '0';

        // Admin Protection Matrix
        if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'WARN', 'PURGE', 'RESTRICT_MEDIA'].includes(act)) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
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

            return ctx.reply(`${uiMsg.trim()}${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});

        } catch (err) {
            return ctx.reply(`<b>SYSTEM ERROR</b>\nExecution failed. Verify bot ranking and permissions.${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

    // --- BRANCH B: Q&A (Direct Answering) ---
    return ctx.reply(`${aiResponse.trim()}${DEVELOPER_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
});

// ==========================================
// 6. SERVERLESS WEBHOOK HANDLER
// ==========================================
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const updateId = req.body.update_id;
            
            // Core Anti-Loop mechanism
            if (updateId) {
                if (processedUpdates.has(updateId)) {
                    return res.status(200).send('Duplicate Dropped'); 
                }
                processedUpdates.add(updateId);
                if (processedUpdates.size > 500) processedUpdates.clear();
            }

            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        } else {
            return res.status(200).send('OVERLORD V11 is Online.');
        }
    } catch (e) {
        // ALWAYS send 200 OK to Telegram, otherwise it gets stuck in a retry loop and crashes the bot
        console.error("Critical Vercel Error:", e);
        return res.status(200).send('Error Safely Handled');
    }
};
