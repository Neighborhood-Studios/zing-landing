/* HOA Intelligence working version: AI calls. Every function falls back to the keyword rules in data.js
   when AI is unavailable (window.claude only exists inside the design tool) or a call fails. */
window.HOAI = (() => {
const H = window.HOA;
const on = () => !!(window.claude && window.claude.complete);
const json = t => { const m = String(t || '').match(/\{[\s\S]*\}/); if (!m) throw new Error('no json'); return JSON.parse(m[0]); };
const call = async (system, user, max = 700) => json(await window.claude.complete({ system, max_tokens: max, messages: [{ role: 'user', content: user }] }));

const SORT_SYS = `You read messages from a neighbors group chat (CGN Household/Services) and decide what each one is about.
Topics, pick exactly one:
- "suppliers": recommending, asking for, warning about, or discussing prices of a service provider (plumber, cleaner, AC tech, dog walker...), or sharing a provider's contact.
- "events": community gatherings and plans (parties, meetings, BBQs, classes, swaps), including neighbors coordinating one.
- "problems": shared problems in the building or community: something broken or not working in common areas, safety or security, neighbors not following rules, building notices (shutoffs, inspections, closures), board decisions.
- "ignore": everything else. Chit-chat, greetings, thanks, jokes, memes, sports, weather, personal news, and ANY politics or news discussion, however heated.
A problem inside someone's own home is not a building problem. If they ask for a provider for it, the topic is "suppliers".
Use "context" for short replies like "same here", "following" or "+1": they take the topic of the message they reply to (or the most recent relevant message). A "same here" on a building problem is another report of it: return the same action type with "match" set to its item id.
Return ONLY JSON: {"topic":"suppliers|events|problems|ignore","sub":"<1-2 words: request, recommendation, warning, price, maintenance, safety, rules, notice, decision, event, follow-up, politics, small talk...>","reason":"<under 10 words>","actions":[...]}
Actions (zero or more; "ignore" always has none):
- {"type":"rec","id":"<existing supplier id>","quote":"<the praise, max 12 words>"} recommends a supplier already in the list
- {"type":"newrec","name":"<provider name>","trade":"<one of the trades>","quote":"..."} recommends or shares a provider not in the list
- {"type":"warn","id":"<supplier id or null>","name":"<name if not in list>","trade":"<trade>","quote":"<the complaint, max 12 words>"} warns neighbors about a provider
- {"type":"ask","trade":"<trade>"} asks neighbors for a provider
- {"type":"maint","title":"<short title>","match":"<existing open item id, or null>"} something broken or not working in the building or community
- {"type":"safety","title":"...","match":"<id or null>"} security or safety concern
- {"type":"rule","topic":"pets|noise|parking|trash|smoking|amenities","where":"<place or empty>","match":"<existing open Rules item id, or null>"} neighbors not following community rules. Never name or guess the person.
- {"type":"ops","title":"...","when":"<e.g. Tue · 9 AM–12 PM>"} building notice: shutoffs, inspections, deliveries, closures
- {"type":"decision","title":"..."} a vote result or board decision
- {"type":"event","title":"...","when":"<e.g. Sat · 4 PM>","where":"<place or empty>"} a community event being announced or planned
Titles: sentence case, under 8 words, no emoji. Only match an existing item when it is clearly the same problem.`;
const TOPICS = ['suppliers', 'events', 'problems', 'ignore'];
const pack = m => m ? { from: m.from, text: m.text, topic: m.topic || null, item: m.item || null } : null;

async function sort(text, who, st, ctx){
  ctx = ctx || {};
  const kw = () => ({ ai: false, ...H.classify(text, st, ctx) });
  if (!on()) return kw();
  try {
    const user = JSON.stringify({ message: text, from: who, trades: H.TRADES,
      context: { replying_to: pack(ctx.parent), recent: (ctx.recent || []).map(pack) },
      suppliers: (st.suppliers || []).map(s => ({ id: s.id, name: s.name, trade: s.trade })),
      open_items: (st.items || []).filter(i => /open|flagged|scheduled|reminder/i.test(i.status)).map(i => ({ id: i.id, cat: i.cat, title: i.title, where: i.where || '' })) });
    const r = await call(SORT_SYS, user, 600);
    const topic = TOPICS.includes(r.topic) ? r.topic : 'ignore';
    return { ai: true, topic, sub: r.sub || '', reason: r.reason || '', conf: .85, actions: topic === 'ignore' || !Array.isArray(r.actions) ? [] : r.actions };
  } catch (e) { return kw(); }
}

const INTENT_SYS = `You are the booking agent inside a neighbors app. Read the resident's message and return ONLY JSON:
{"trade":"<one of the trades, or null>","supplierId":"<id if they name a supplier from the list, else null>","reply":"<if trade and supplierId are both null: one or two friendly sentences answering or asking what they need; else empty>"}`;
async function intent(text, st){
  const kw = () => { const n = st.suppliers.find(x => text.toLowerCase().includes(x.name.toLowerCase())); return { trade: H.tradeOf(text), supplierId: n ? n.id : null, reply: '' }; };
  if (!on()) return kw();
  try { return await call(INTENT_SYS, JSON.stringify({ message: text, trades: H.TRADES, suppliers: st.suppliers.map(s => ({ id: s.id, name: s.name, trade: s.trade })) }), 300); }
  catch (e) { return kw(); }
}

const ASK_SYS = `You answer a resident's question about the CGN Household/Services neighbors group using ONLY the group chat and records provided.
Answer in 2–3 plain sentences with specifics (names, counts, days). Never include phone numbers. If the data doesn't cover it, say so and suggest asking the group.
Return ONLY JSON: {"answer":"...","cites":["<message id>", ...]} with up to 3 ids of the messages you used.`;
async function ask(q, st){
  if (!on()) return { answer: 'Ask needs AI, which only works while this page runs inside the design tool for now. Search the Providers tab in the meantime.', cites: [], ai: false };
  const msgs = st.messages.filter(m => m.text).slice(-250).map(m => '[' + m.id + '] ' + m.from + ' (' + (m.d ? m.d.toDateString() : '') + ' ' + m.time + '): ' + m.text).join('\n');
  const recs = { suppliers: st.suppliers.map(s => s.name + ' · ' + s.trade + ' · ' + s.recs + ' recs' + (s.warnings ? ' · WARNING: ' + s.warnings : '')), items: st.items.map(i => i.cat + ': ' + i.title + ' — ' + i.status), requests: (st.requests || []).slice(0, 30).map(r => r.trade + ': ' + r.text + ' — ' + r.answers.length + ' replies'), events: st.events.map(e => e.title + ' · ' + e.date + ' ' + (e.time || '') + ' · ' + (e.where || '') + ' · ' + e.going + ' going') };
  try { const r = await call(ASK_SYS, 'Question: ' + q + '\n\nChat:\n' + msgs + '\n\nRecords:\n' + JSON.stringify(recs), 600); return { answer: r.answer || '', cites: (r.cites || []).filter(id => st.messages.some(m => m.id === id)), ai: true }; }
  catch (e) { return { answer: "I couldn't reach the AI just now. Try again in a moment.", cites: [], ai: false }; }
}

return { on, sort, intent, ask };
})();
