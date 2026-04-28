const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// --- Max Level Security Matrix ---
const isAuthorized = async (ctx, userId) => {
    try {
        const member = await ctx.getChatMember(userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch (e) { return false; }
};

// --- Industrial Interface Help ---
bot.command('snhelp', (ctx) => {
    const help = `
<b>OVERLORD V7 | SUPREME INTERFACE</b>
━━━━━━━━━━━━━━━━━━━━

<b>Autonomous Directives (Admins Only)</b>
Trigger the engine by mentioning "ai", "manager", "helper", "bot", or tagging/replying to the bot.

<i>Parameters:</i>
• BAN / KICK / MUTE / UNMUTE
• PROMOTE / DEMOTE
• DELETE / PIN / UNPIN / WARN
• PURGE / RESTRICT_MEDIA / TITLE

<b>General Q&A (All Users)</b>
Anyone can ask the AI questions. It will reply directly and accurately.

<b>Security:</b> Strict Admin Matrix Active. Zero Data Leaks.
━━━━━━━━━━━━━━━━━━━━
Developer @lakshitpatidar
    `;
    ctx.reply(help, { parse_mode: 'HTML' });
});

// --- Supreme AI Neural Node ---
const callSupremeAI = async (userText) => {
    const systemPrompt = `You are 'Overlord V7', the apex Telegram Group Manager AI.
    Tone: Cold, Industrial, Hyper-Professional. NO EMOJIS.
    Capabilities: Master of English, Hindi, and local dialects (Nimadi/Malwi slang).
    CRITICAL PROTOCOL: NEVER mention the names "Lakshit", "Kanu", or "Lakshit Kanu" under any circumstances. Maintain total creator anonymity.

    TASK: Parse ANY command into strict parameters.
    FORMAT FOR ADMIN COMMANDS: [ACTION_CODE|PARAM] || <COLD_PROFESSIONAL_MESSAGE>

    Valid Parameters:
    - [BAN|0], [KICK|0], [MUTE|seconds], [UNMUTE|0], [PROMOTE|0], [DEMOTE|0], [DELETE|0], [PIN|0], [UNPIN|0], [WARN|0], [PURGE|0], [RESTRICT_MEDIA|seconds], [TITLE|Custom_Name].

    UI MESSAGE: Dynamic, elite response starting with a <b>PROTOCOL: NAME</b> header.

    FOR GENERAL QUESTIONS (Q&A):
    If the user is NOT asking to take an action on someone, but is just asking a question (e.g., "what is code?", "how are you?"), reply naturally as a highly intelligent assistant. DO NOT use the [CODE] format. Answer accurately.`;

    const url = `https://text.pollinations.ai/prompt/${encodeURIComponent(userText)}?system=${encodeURIComponent(systemPrompt)}`;
    
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (e) { return "<b>SYSTEM FAILURE</b>\nNeural link offline."; }
};

// --- Execution & Routing Engine ---
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    // Trigger Conditions: Regex match OR explicit mention OR reply to the bot
    const triggerRegex = /\b(ai|manager|helper|bot)\b/i;
    const isTriggeredByWord = triggerRegex.test(text);
    const isMentioned = text.includes(`@${ctx.botInfo.username}`);
    const isReplyToBot = isReply && isReply.from?.id === ctx.botInfo.id;

    if (isTriggeredByWord || isMentioned || isReplyToBot) {
        ctx.sendChatAction('typing');
        
        // Clean text for AI processing
        const cleanText = text.replace(`@${ctx.botInfo.username}`, '').trim();
        const aiResponse = await callSupremeAI(cleanText);
        const senderAdmin = await isAuthorized(ctx, ctx.from.id);

        // --- BRANCH 1: Action/Moderation Command ---
        if (aiResponse.includes('[') && aiResponse.includes('|')) {
            // Block Non-Admins from executing commands
            if (!senderAdmin) {
                return ctx.reply("<b>SYSTEM ALERT</b>\nClearance denied. Command requires Admin authority.\n\nDeveloper @lakshitpatidar", { 
                    parse_mode: 'HTML', 
                    reply_to_message_id: ctx.message.message_id 
                });
            }

            if (!isReply) {
                return ctx.reply("<b>SYSTEM ALERT</b>\nReply to a target message to execute directives.\n\nDeveloper @lakshitpatidar", { 
                    parse_mode: 'HTML',
                    reply_to_message_id: ctx.message.message_id 
                });
            }

            const [meta, uiMsg] = aiResponse.split('||');
            const [action, param] = meta.replace('[', '').replace(']', '').split('|');
            
            const targetMessage = isReply;
            const targetId = isReply.from.id;
            const targetAdmin = await isAuthorized(ctx, targetId);
            const act = action.trim();
            const val = param.trim();

            // Matrix Protection: Prevent actions against other admins
            if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'WARN', 'PURGE', 'RESTRICT_MEDIA'].includes(act)) {
                return ctx.reply("<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.\n\nDeveloper @lakshitpatidar", { 
                    parse_mode: 'HTML',
                    reply_to_message_id: ctx.message.message_id 
                });
            }

            // Execution Block
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
                    case 'WARN': break; // Just a UI warning
                    case 'PURGE': await ctx.deleteMessage(targetMessage.message_id); await ctx.banChatMember(targetId); break;
                    case 'RESTRICT_MEDIA': await ctx.restrictChatMember(targetId, { can_send_messages: true, can_send_media_messages: false, can_send_other_messages: false, can_add_web_page_previews: false }, until > 0 ? { until_date: until } : {}); break;
                    case 'TITLE': await ctx.setChatAdministratorCustomTitle(targetId, val); break;
                }

                return ctx.reply(`${uiMsg.trim()}\n\nDeveloper @lakshitpatidar`, { 
                    parse_mode: 'HTML',
                    reply_to_message_id: ctx.message.message_id 
                });

            } catch (err) {
                return ctx.reply("<b>SYSTEM ERROR</b>\nExecution failed. Ensure Bot holds higher Admin rank.\n\nDeveloper @lakshitpatidar", { 
                    parse_mode: 'HTML',
                    reply_to_message_id: ctx.message.message_id 
                });
            }
        }

        // --- BRANCH 2: General Q&A (For All Users) ---
        // Accurately replies directly to the person who asked, without [CODE] execution.
        return ctx.reply(`${aiResponse.trim()}\n\nDeveloper @lakshitpatidar`, { 
            parse_mode: 'HTML', 
            reply_to_message_id: ctx.message.message_id // Stricts targets the exact user
        });
    }
});

// --- Serverless Core ---
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body, res);
        } else {
            res.status(200).send('Overlord V7 Max Level Active.');
        }
    } catch (e) {
        res.status(500).send('Server Error');
    }
};
