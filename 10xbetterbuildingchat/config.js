/* Zing Neighbors App: module switches and bot behavior. Edited on the AI Control page, read by Resident and Supplier.
   Saved in localStorage for now; this is the shape that moves to a Supabase `settings` table later. */
(function(){
  var KEY = 'zingN.app.config';
  var PHASES = ['MVP', 'Phase 2', 'Later'];
  var MODULES = [
    { id: 'capture', area: 'Directory', name: 'Save recommendations from chat', desc: 'When a neighbor recommends someone, the bot adds them to Providers.', phase: 'MVP' },
    { id: 'directory', area: 'Directory', name: 'Providers directory', desc: 'The Providers tab: search, what neighbors said, call or WhatsApp.', phase: 'MVP' },
    { id: 'requests', area: 'Directory', name: 'Track requests', desc: '“Anyone know a plumber?” stays open under Providers → Requests until someone answers.', phase: 'Phase 2' },
    { id: 'askAI', area: 'AI assistant', name: 'Private AI answers', desc: 'Tap ✦ or write @AI in the chat. Only the person who asked sees the answer.', phase: 'MVP' },
    { id: 'agent', area: 'AI assistant', name: 'Ask tab and booking', desc: 'A private conversation with the AI that writes the booking message for you.', phase: 'Phase 2' },
    { id: 'smsBooking', area: 'AI assistant', name: 'Zing texts providers for you', desc: 'Zing texts a recommended provider, reads the reply and confirms once the resident says yes. Starts from the Ask tab. Simulated until Twilio is connected.', phase: 'MVP' },
    { id: 'catchup', area: 'AI assistant', name: 'Catch-up summaries', desc: '“What did I miss?” since your last visit.', phase: 'Phase 2', cases: ['catchup'] },
    { id: 'building', area: 'Building', name: 'Building log', desc: 'Maintenance, safety, operations and decisions picked up from the chat.', phase: 'Phase 2' },
    { id: 'events', area: 'Building', name: 'Events and RSVPs', desc: 'Plans in the chat become calendar events.', phase: 'Phase 2' },
    { id: 'rules', area: 'Building', name: 'Rule reminders', desc: 'A friendly reminder in the group when a building rule comes up, once a day per topic.', phase: 'Later' },
    { id: 'issues', area: 'Collective agency', name: 'Resolve a shared issue', desc: 'Scattered reports become one tracked issue and one report to management.', phase: 'Phase 2', cases: ['issue'] },
    { id: 'deals', area: 'Collective agency', name: 'Group deals page', desc: 'Providers → Deals, where neighbors join group rates.', phase: 'Later' },
    { id: 'groupBuying', area: 'Collective agency', name: 'Group buying', desc: 'Neighbors with the same need join one deal. Zing texts the 3 most recommended providers for a group price and negotiates. Use case: Group AC Maintenance.', phase: 'Later', cases: ['ac'] },
    { id: 'serviceWeek', area: 'Collective agency', name: 'Building service week', desc: 'A building-wide job scheduled stack by stack. Use case: window cleaning.', phase: 'Later', cases: ['week'] },
    { id: 'route', area: 'Collective agency', name: 'Fill supplier openings', desc: 'A provider already in the building fills open slots. Use case: Joe the plumber.', phase: 'Later', cases: ['route'] },
    { id: 'organize', area: 'Collective agency', name: 'Help organizing gatherings', desc: 'Polls, an event and a bring list when neighbors want to get together.', phase: 'Later', cases: ['party'] },
    { id: 'discover', area: 'Collective agency', name: 'Discover opportunities', desc: 'Finds group orders, introductions and swaps in ordinary chat.', phase: 'Later', cases: ['discover'] },
    { id: 'providerVisits', area: 'Suppliers', name: 'Nearby this week', desc: 'Providers tell a neighborhood or building when they’ll be there. Residents only see it when they look for that kind of help. Residents book an opening, and Zing texts the provider.', phase: 'Phase 2' },
    { id: 'supplierPortal', area: 'Suppliers', name: 'Supplier portal', desc: 'Providers set up their profile by chatting with Zing (services, area, hours, insurance and COI, license), announce visits and see Zing’s texts.', phase: 'Later' }
  ];
  var BOT = { trigger: 'every', publicPosts: 'reminders', proactive: 'helpful', minPeople: 3, showTags: true, smsReplies: 'mix', smsWait: 120, poolAutoQuote: true, poolQuoteAt: 5, poolNegotiate: true, poolPick: 'organizer', detect: { suppliers: true, events: true, problems: true } };
  function defaults(){ var mods = {}; MODULES.forEach(function(m){ mods[m.id] = { on: true, phase: m.phase }; }); return { mods: mods, bot: Object.assign({}, BOT, { detect: Object.assign({}, BOT.detect) }) }; }
  var cache = null;
  function get(){
    if (cache) return cache;
    var d = defaults(), s = {};
    try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    MODULES.forEach(function(m){ if (s.mods && s.mods[m.id]) d.mods[m.id] = Object.assign(d.mods[m.id], s.mods[m.id]); });
    var det = Object.assign({}, BOT.detect, (s.bot || {}).detect || {}); d.bot = Object.assign(d.bot, s.bot || {}); d.bot.detect = det;
    return (cache = d);
  }
  function set(c){ cache = null; try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} window.dispatchEvent(new Event('zcfg')); }
  function subscribe(fn){ var h = function(e){ if (e.type === 'storage' && e.key !== KEY) return; cache = null; fn(); };
    window.addEventListener('zcfg', h); window.addEventListener('storage', h);
    return function(){ window.removeEventListener('zcfg', h); window.removeEventListener('storage', h); }; }
  function on(id){ var m = get().mods[id]; return !m || !!m.on; }
  window.ZCFG = { KEY: KEY, MODULES: MODULES, PHASES: PHASES, defaults: defaults, get: get, set: set, subscribe: subscribe, on: on };

  /* helpers the screens call */
  var NEEDS = { rec: 'capture', newrec: 'capture', safety: 'building', maint: 'building', ops: 'building', decision: 'building', rule: 'rules', event: 'events', ask: 'requests' };
  window.zOn = on;
  window.zAllows = function(type){ return !NEEDS[type] || on(NEEDS[type]); };
  window.zCaseOn = function(key){ var m = MODULES.find(function(x){ return x.cases && x.cases.indexOf(key) > -1; }); return !m || on(m.id); };
  window.zTabOn = function(provider){ return function(t){ var k = t[0];
    return k === 'chat' || (k === 'building' ? on('building') || on('events') : k === 'suppliers' ? on('directory') : k === 'agent' ? provider || on('agent') : true); }; };
  window.zApplyBot = function(v, level){ var b = get().bot;
    var lvl = b.proactive === 'helpful' && b.publicPosts === 'suggestions' ? (level || 'helpful') : 'quiet';
    if (b.proactive !== 'off') return Object.assign({}, v, { aiLevel: lvl });
    var keep = function(m){ return m.kind !== 'nudge'; };
    return Object.assign({}, v, { aiLevel: 'quiet', feed: v.feed.filter(keep), messages: v.messages.filter(keep), agent: (v.agent || []).filter(keep) }); };
  var PAGES = { resident: 'Resident.html', supplier: 'Supplier.html', ai: 'AI Control.html' };
  window.zPageHref = function(k){ return encodeURI(PAGES[k] || PAGES.resident); };

  /* topic switches: a message about a switched-off topic is treated as ignored */
  var TOPIC_OF = { rec: 'suppliers', newrec: 'suppliers', ask: 'suppliers', warn: 'suppliers', event: 'events', maint: 'problems', safety: 'problems', rule: 'problems', ops: 'problems', decision: 'problems' };
  window.zDetect = function(r){ var det = get().bot.detect || {}, topic = r.topic || 'ignore';
    var acts = (r.actions || []).filter(function(a){ var tp = TOPIC_OF[a.type]; return !tp || det[tp] !== false; });
    if (topic !== 'ignore' && det[topic] === false) return acts.length ? { topic: TOPIC_OF[acts[0].type], actions: acts, off: topic } : { topic: 'ignore', actions: [], off: topic };
    return { topic: topic, actions: topic === 'ignore' ? [] : acts }; };

  /* detection log, newest first, shared with the AI Control page */
  var LKEY = 'zingN.app.detect';
  window.ZLog = {
    list: function(){ try { return JSON.parse(localStorage.getItem(LKEY)) || []; } catch (e) { return []; } },
    add: function(e){ var l = window.ZLog.list(); l.unshift(e); try { localStorage.setItem(LKEY, JSON.stringify(l.slice(0, 300))); } catch (x) {} window.dispatchEvent(new Event('zdetect')); },
    clear: function(){ try { localStorage.removeItem(LKEY); } catch (x) {} window.dispatchEvent(new Event('zdetect')); },
    subscribe: function(fn){ var h = function(e){ if (e.type === 'storage' && e.key !== LKEY) return; fn(); }; window.addEventListener('zdetect', h); window.addEventListener('storage', h); return function(){ window.removeEventListener('zdetect', h); window.removeEventListener('storage', h); }; }
  };
})();
