/* Zing Neighbors app: categories, rules, keyword sorter and small helpers. Real data comes from sheet.js. */
window.HOA = (() => {
const GROUP = { name: 'CGN Household/Services', short: 'CGN', sheetId: '1XysRFyxf7Mx52y529MwTutcBNY1-5n9Fh9FMqXwNRWI' };
const TRADES_RE = [
  ['AC / HVAC', /\b(ac|a\/c|air ?con\w*|hvac|cooling|blowing warm|duct)\b/i],
  ['Plumber', /plumb|leak|sink|toilet|drain|pipe|clog|faucet|water heater/i],
  ['Electrician', /electric|outlet|wiring|breaker|light fixture/i],
  ['Appliance repair', /appliance|washer|dryer|fridge|refrigerator|dishwasher|oven|stove/i],
  ['Locksmith', /locksmith|lock(ed)? out|rekey|\block\b/i],
  ['Cleaner', /clean(er|ing)?\b|maid|housekeep/i],
  ['Pest control', /pest|roach|ants?\b|termite|bugs?\b|exterminat|rodent|mice|rats?\b/i],
  ['Painter', /paint/i],
  ['Carpenter', /carpent|cabinet|wood ?work/i],
  ['Flooring', /floor|tile|grout/i],
  ['Movers', /mover|moving|move out|move in/i],
  ['Dog walker', /dog walk/i],
  ['Pet care', /pet sit|groom|vet\b|cat sit/i],
  ['Babysitter / Nanny', /babysit|nanny|childcare/i],
  ['Tutor', /tutor|lessons?\b/i],
  ['Mechanic', /mechanic|car repair|brakes|oil change/i],
  ['Car detailing', /detail(ing)?|car wash/i],
  ['Landscaping', /landscap|lawn|garden|tree trim/i],
  ['Pool', /pool (guy|service|clean)/i],
  ['Tailor', /tailor|alteration|seamstress/i],
  ['Beauty / Hair', /hair|barber|nails|manicure|lash|brows|makeup/i],
  ['Fitness', /trainer|fitness|yoga|pilates/i],
  ['Medical / Dental', /doctor|dentist|pediatric|dermatolog|physio/i],
  ['Legal / Accounting', /lawyer|attorney|accountant|cpa|taxes|notary/i],
  ['Handyman', /handyman|sliding door|shelf|shelves|mount|drywall|tv\b|furniture|assemble/i]
];
const TRADES = TRADES_RE.map(t => t[0]).concat('Other');
const tradeOf = t => { const f = TRADES_RE.find(([, re]) => re.test(t || '')); return f ? f[0] : null; };
const normTrade = c => { if (!c) return 'Other'; const x = TRADES.find(t => t.toLowerCase() === String(c).toLowerCase()); return x || tradeOf(c) || c; };

const RULES = {
  pets: { label: 'Pets', re: /poop|pick up after|picking up after|dog (waste|mess|poo)|off.?leash|pee on/i, text: 'please pick up after your pets on all common grounds, and keep dogs leashed outside your home' },
  noise: { label: 'Noise', re: /loud music|blasting|upstairs neighbou?r|stomping|party (until|till)|quiet hours|so loud/i, text: 'quiet hours are 10 PM to 8 AM, and music or TV shouldn’t be heard outside your home' },
  parking: { label: 'Parking', re: /park(ed|ing)? in (my|the guest|someone)|guest spots?|blocking (the|my)|double.?park/i, text: 'guest spots are for visitors, and residents park in their own space' },
  trash: { label: 'Trash', re: /trash|garbage|recycl|boxes (left|everywhere)|chute/i, text: 'bag your trash and break down boxes before leaving them for pickup' },
  smoking: { label: 'Smoking', re: /smok|vap(e|ing)|cigarette|weed smell/i, text: 'smoking and vaping aren’t allowed in shared areas' },
  amenities: { label: 'Amenities', re: /towels? (left|on (the )?chairs)|gym (equipment|machines)|didn’?t wipe|left (a mess|the pool)/i, text: 'wipe down equipment and clear your things when you leave the pool or gym' }
};
const ruleOf = t => Object.keys(RULES).find(k => RULES[k].re.test(t)) || null;
const whereOf = t => { const m = t.match(/\b(?:by|near|at|on|in|around) the ([a-z][a-z ]{2,22}?)(?=[.,!?]|\s(?:again|every|this|today|please)|$)/i); return m ? m[1].trim() : ''; };

/* ---- Detector (keyword version). The AI version in ai.js returns the same shape. ----
   Every message gets one topic: suppliers, events, problems, or ignore (chit-chat, politics, etc.). */
const RE = {
  safety: /suspicious|stolen|theft|break.?in|door handles|propped|stranger|trespass|followed|unlocked|someone tried|car (was )?broken into|package(s)? (stolen|missing|taken)/i,
  maint: /broken|stuck|leak|leaking|not working|isn'?t working|out again|is out|noisy|clogged|flicker|won'?t|doesn'?t work|smell|dripping|flooding|no hot water|no water|low (water )?pressure|power (is )?out|outage|out of order|cracked|mold/i,
  ops: /\b(water (will be |is being )?(shut ?off|turned off)|shut ?off|inspection|fire alarm (test|testing)|elevator maintenance|(closed|closing) for|will be closed|pressure wash\w*|fumigat\w*|construction (starts|begins|on)|repaving|notice from (management|the board)|board meeting minutes)\b/i,
  decision: /\b(the board (approved|voted|decided)|vote passed|motion passed|approved by the board|hoa (approved|decided))\b/i,
  event: /party|meeting|bbq|barbecue|potluck|movie night|yoga|happy hour|game night|clean.?up day|meetup|book (swap|club)|celebration|get.?together|birthday|halloween|trick.or.treat|garage sale|yard sale|playdate|run club|walking group|\bswap\b|join us|rsvp|everyone('s| is)? (welcome|invited)/i,
  ask: /anyone (know|recommend|have|use)|can anyone recommend|looking for|recommendations? for|who do (you|people) use|need a (good )?\w+|any (good )?(recs|recommendations)|does anyone have (a|the) (number|contact)/i,
  rec: /recommend|highly|\+1|fixed (ours|our|my)|great job|did (ours|our|my)|amazing|shout ?out|use[ds]? (him|her|them)|call\b|the best|so happy with|can'?t recommend .* enough/i,
  warn: /\b(avoid|don'?t (use|hire|call)|scam\w*|ripped (us |me )?off|no.?show|never (showed|came|called back)|stay away|terrible|worst|overcharg\w*|rude|unprofessional|ghosted)\b/i,
  price: /\$\s?\d|how much|quoted?|charg(ed|es|ing)|price|estimate|rate is|per hour|is that normal/i
};
const COMMON = /\b(building|lobby|elevators?|gym|pool|garage|gates?|hallways?|parking|mail ?room|mailbox(es)?|roof|stair(s|well)?|common areas?|amenit\w*|clubhouse|laundry room|trash room|chute|intercom|front desk|entrance|sidewalk|street ?lights?|courtyard|lawn|community|neighborhood|our street)\b/i;
const FOLLOW = /^(same( here| problem| issue| for us| with (ours|mine|us))?|me too|ours too|us too|mine too|\+1|following|interested|count me in|i'?m in|we'?re in|also( us)?|yes please|yep|yes)\b/i;
const IGNORE = [
  ['politics', /\b(trump|biden|kamala|harris|obama|democrats?|republicans?|gop|maga|liberals?|conservatives?|politic\w*|congress|senat(e|or)|elections?|ballot|presidential|governor|desantis|immigration|abortion|gun control|left.?wing|right.?wing|the debate|white house|supreme court|tariffs?)\b/i, 'Politics'],
  ['greeting', /^(good (morning|night|evening|afternoon)|morning|hi|hello|hey|hola|buenos d[ií]as)( (all|everyone|neighbou?rs|guys|y'?all))?[\s!.,]*[^\w\s]*$/iu, 'Greeting'],
  ['thanks', /^(thanks?( you)?|thank u|ty|thx|appreciate (it|you)|much appreciated|gracias)( (so much|all|everyone|neighbou?rs|guys))?[\s!.,]*[^\w\s]*$/iu, 'Thanks'],
  ['reaction', /^(lol|lmao|haha+|jaja+|ok(ay)?|cool|nice|wow|great|amazing|love (it|this)|congrats\w*|[^\w\s]{1,6})[\s!.]*$/iu, 'Reaction']
];
const SMALL = [['sports', /\b(the game|dolphins|heat game|panthers|marlins|inter miami|messi|super bowl|world cup|playoffs?|touchdown|score)\b/i, 'Sports'], ['weather', /\b(weather|so hot|rain(ing)?|sunset|sunrise|beautiful day)\b/i, 'Weather'], ['jokes', /\b(meme|joke|funny)\b/i, 'Jokes']];
const DAY = /(today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
const TIME = /\b(\d{1,2}(:\d\d)?\s?(am|pm))\b/i;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plain = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const knownIn = (text, st) => (st.suppliers || []).find(s => { const f = plain(s.name).split(/[ .]/)[0]; return f.length > 2 && new RegExp('\\b' + f.replace(/[^\w]/g, '') + '\\b', 'i').test(plain(text)); });

function sort(text, st){
  const out = [], known = knownIn(text, st), ask = RE.ask.test(text);
  const sc = /^Shared a contact: ([^,]+)(?:,\s*(.+))?/i.exec(text);
  if (sc) { const dg = digits(sc[2]), k = (dg.length >= 7 && (st.suppliers || []).find(s => digits(s.phone).slice(-10) === dg.slice(-10))) || known;
    out.push(k ? { type: 'rec', id: k.id, quote: 'Shared their contact in the group' } : { type: 'newrec', name: sc[1].trim(), trade: tradeOf(text) || 'Other', quote: 'Shared their contact in the group' }); return out; }
  if (RE.warn.test(text) && !ask && (known || tradeOf(text))) out.push({ type: 'warn', id: known ? known.id : null, trade: tradeOf(text) || (known && known.trade) || 'Other', quote: text });
  else if (RE.rec.test(text) && known && !ask) out.push({ type: 'rec', id: known.id });
  else if (RE.rec.test(text) && !ask){
    const m = text.match(/(?:[Uu]se|[Rr]ecommend|[Cc]all|[Tt]ry)\s+([A-Z][\w'’é]+(?:\s[A-Z][\w'’é.]+)?)/) || text.match(/^([A-Z][\w'’é]+(?:\s[A-Z][\w'’é.]+)?)\s+(?:fixed|did|is|was)/);
    const tr = tradeOf(text);
    if (m && tr) out.push({ type: 'newrec', name: m[1], trade: tr });
  }
  if (RE.safety.test(text)) out.push({ type: 'safety' });
  else if (ruleOf(text)) out.push({ type: 'rule', topic: ruleOf(text), where: whereOf(text) });
  else if (RE.ops.test(text)) out.push({ type: 'ops', when: (text.match(DAY) || [''])[0] });
  else if (RE.decision.test(text)) out.push({ type: 'decision' });
  else if (RE.maint.test(text) && (!ask || COMMON.test(text)) && !RE.warn.test(text) && !(out.some(a => /rec/.test(a.type)) && !COMMON.test(text))) out.push({ type: 'maint' });
  if (RE.event.test(text) && !ruleOf(text) && !RE.ops.test(text)) { const d = text.match(DAY), t = text.match(TIME); out.push({ type: 'event', when: [d ? cap(d[1].slice(0, 3)) : 'Soon', t ? t[1].toUpperCase() : ''].filter(Boolean).join(' · ') }); }
  if (ask) { const tr = tradeOf(text); out.push({ type: 'ask', trade: tr || 'Other' }); }
  return out;
}

const TOPIC_OF = { rec: 'suppliers', newrec: 'suppliers', ask: 'suppliers', warn: 'suppliers', event: 'events', maint: 'problems', safety: 'problems', rule: 'problems', ops: 'problems', decision: 'problems' };
const SUB_OF = { rec: 'recommendation', newrec: 'recommendation', ask: 'request', warn: 'warning', event: 'event', maint: 'maintenance', safety: 'safety', rule: 'rules', ops: 'notice', decision: 'decision' };
function why(a, text, st){
  const s = a.id && (st.suppliers || []).find(x => x.id === a.id), nm = s ? s.name : a.name;
  return { rec: 'Recommends ' + (nm || 'a provider'), newrec: 'Recommends ' + (nm || 'a new provider'), ask: 'Asks for ' + (a.trade && a.trade !== 'Other' ? 'a ' + a.trade.toLowerCase() : 'a provider'), warn: 'Warns about ' + (nm || (a.trade && a.trade !== 'Other' ? 'a ' + a.trade.toLowerCase() : 'a provider')),
    event: 'Plans or announces an event', maint: 'Something is broken or not working', safety: 'Safety or security concern', rule: 'Rule issue: ' + (RULES[a.topic] ? RULES[a.topic].label.toLowerCase() : 'community rules'), ops: 'Building notice', decision: 'Board or HOA decision' }[a.type];
}
/* ctx: { parent: {from, text, topic, item}, recent: [{from, text, topic, item}] } */
function classify(text, st, ctx){
  ctx = ctx || {}; st = st || {};
  const t = String(text || '').trim(), words = t.split(/\s+/).filter(Boolean).length;
  const done = (topic, sub, reason, actions, conf) => ({ topic, sub, reason, actions: actions || [], conf: conf || .6 });
  if (!t) return done('ignore', 'empty', 'Nothing to read');
  if (IGNORE[0][1].test(t) && !/\b(hoa|board) (election|elections|vote)\b/i.test(t)) return done('ignore', 'politics', 'Politics. Never filed or answered.', [], .85);
  const tgt = ctx.parent && ctx.parent.topic && ctx.parent.topic !== 'ignore' ? ctx.parent : (ctx.recent || []).filter(r => r.topic && r.topic !== 'ignore').slice(-1)[0];
  if (tgt && words <= 8 && FOLLOW.test(t)) {
    const a = [], it = tgt.item && (st.items || []).find(i => i.id === tgt.item);
    if (tgt.topic === 'problems' && it) a.push(it.cat === 'Rules' ? { type: 'rule', topic: it.topic, where: it.where, match: it.id } : { type: it.cat === 'Safety' ? 'safety' : 'maint', title: it.title, match: it.id });
    return done(tgt.topic, 'follow-up', 'Follows up on ' + (tgt.from ? String(tgt.from).split(' · ')[0] + '’s message' : 'an earlier message'), a, .55);
  }
  for (const [k, re, label] of IGNORE.slice(1)) if (re.test(t)) return done('ignore', k, label + '. Nothing to file.', [], .8);
  const acts = sort(t, st);
  if (acts.length) { const p = acts.find(a => TOPIC_OF[a.type] === 'problems') || acts.find(a => TOPIC_OF[a.type] === 'suppliers') || acts[0];
    return done(TOPIC_OF[p.type], SUB_OF[p.type], why(p, t, st), acts, acts.length > 1 || (p.type === 'rec' && p.id) ? .8 : .65); }
  const known = knownIn(t, st), tr = tradeOf(t);
  if (RE.price.test(t) && (known || tr)) return done('suppliers', 'price', 'Talks about prices for ' + (known ? known.name : 'a ' + tr.toLowerCase()), [], .6);
  if (known) return done('suppliers', 'mention', 'Mentions ' + known.name, [], .5);
  for (const [k, re, label] of SMALL) if (re.test(t)) return done('ignore', k, label + '. Nothing to file.', [], .7);
  return done('ignore', 'small talk', 'Small talk. Nothing to file.', [], .5);
}
const titleFrom = text => { let t = text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, '').replace(/\s+/g, ' ').trim().split(/[.!?]/)[0]; if (t.length > 52) t = t.slice(0, 50).replace(/\s\S*$/, '') + '…'; return cap(t); };

const digits = s => String(s || '').replace(/[^\d]/g, '');
const phones = s => String(s || '').split('/').map(x => x.trim()).filter(Boolean);
const mask = n => { n = String(n || '').replace(/^[~\s]+/, '').trim(); if (!n || digits(n).length >= 7 || !/\p{L}/u.test(n)) return 'A neighbor'; const w = n.replace(/[^\p{L}\s'.-]/gu, ' ').split(/\s+/).filter(Boolean); if (!w.length) return 'A neighbor'; const last = w.length > 1 ? w[w.length - 1].replace(/\.$/, '') : ''; return last ? w[0] + ' ' + last[0].toUpperCase() + '.' : w[0]; };
const fmtPhone = p => { const d = digits(p); return d.length === 11 && d[0] === '1' ? '(' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7) : d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : p; };
const waNum = p => { const d = digits(p); return d.length === 10 ? '1' + d : d; };
const parseDate = (s, t) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); if (!m) return null; const [h, mi] = String(t || '').split(':').map(Number); return new Date(+m[1], +m[2] - 1, +m[3], h || 0, mi || 0); };
const fmtDay = d => { if (!d) return ''; const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0); const n = Math.round((t - x) / 864e5); return n === 0 ? 'Today' : n === 1 ? 'Yesterday' : n === -1 ? 'Tomorrow' : x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: x.getFullYear() === t.getFullYear() ? undefined : 'numeric' }); };
const fmtTime = d => d ? ((d.getHours() + 11) % 12 + 1) + ':' + String(d.getMinutes()).padStart(2, '0') + (d.getHours() < 12 ? ' AM' : ' PM') : '';
const ago = d => { if (!d) return ''; const n = Math.floor((Date.now() - d) / 864e5); return n <= 0 ? 'today' : n === 1 ? 'yesterday' : n < 14 ? n + ' days ago' : n < 60 ? Math.round(n / 7) + ' weeks ago' : n < 365 ? Math.round(n / 30) + ' months ago' : Math.round(n / 365) + (n < 730 ? ' year ago' : ' years ago'); };

return { GROUP, TRADES, tradeOf, normTrade, RULES, ruleOf, whereOf, sort, classify, TOPIC_OF, titleFrom, digits, phones, mask, fmtPhone, waNum, parseDate, fmtDay, fmtTime, ago, cap };
})();
