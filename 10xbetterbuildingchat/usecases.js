/* Instinct: demo fixtures and use cases. Pure data, played by engine.js.
   Each step = { label, view: resident|supplier|ai, events: [...], tab?, go?, typing?, ui? }.
   Every person, quote, price and reply below is fictional and illustrative. */
(function(){
const people = {
  maria: ['Maria', '4B'], david: ['David', '7C'], sarah: ['Sarah', '9A'], james: ['James', '12F'], priya: ['Priya', '6D'], tom: ['Tom', '6A'],
  liz: ['Liz', '3B'], ana: ['Ana', '11F'], carlos: ['Carlos', '2C'], daniel: ['Daniel', '8E'], sophia: ['Sophia', '10D'], mei: ['Mei', '7A'],
  mike: ['Mike', '9F'], nina: ['Nina', '14A'], rosa: ['Rosa', '5C'], rafa: ['Rafa (handyman)', '']
};
const S = (id, name, biz, trade, recs, quotes, o) => ({ id, name, biz, trade, recs, quotes, claimed: false, jobs: 0, inbox: [], openings: [], calendar: [], ...(o || {}) });
const suppliers = () => ({
  cb: S('cb', 'Luis Ortega', 'CoolBreeze AC', 'AC / HVAC', 6, [['Carlos · 2C', 'Did our AC last year, on time and tidy', 160], ['Rosa · 5C', 'Fixed a leak in the air handler, fair price', 90]], { claimed: true, jobs: 9 }),
  ga: S('ga', 'Grove Air', '', 'AC / HVAC', 4, [['Mike · 9F', 'Good work, a little slow to schedule', 120]]),
  po: S('po', 'Polar HVAC', '', 'AC / HVAC', 3, [['Nina · 14A', 'Cheapest quote we got', 200]]),
  joe: S('joe', 'Joe Rivera', 'Rivera Plumbing', 'Plumber', 8, [['Mike · 9F', 'Fixed our shower valve, fair price', 30], ['Ana · 11F', 'Came the same day for a leak', 75]], { claimed: true, jobs: 14 }),
  cv: S('cv', 'ClearView Windows', '', 'Cleaner', 3, [['Nina · 14A', 'Did our old building, very careful', 300]]),
  bp: S('bp', 'Bright Pane', '', 'Cleaner', 2, [['Tom · 6A', 'Quick and friendly', 250]]),
  rafa: S('rafa', 'Rafa Gómez', '', 'Handyman', 5, [['Liz · 3B', 'Mounted our TV and fixed a door in an hour', 40]], { claimed: true, jobs: 6 }),
  gh: S('gh', 'Grove Hardware', '', 'Other', 2, [['David · 7C', 'They deliver to the front desk', 60]]),
  volt: S('volt', 'Volt Electric', '', 'Electrician', 0, [])
});

/* helpers */
const say = (from, text, o = {}) => ({ label: people[from][0] + ' posts in the group', view: 'resident', tab: 'chat', typing: from, events: [{ t: 'MESSAGE_POSTED', from, text, chips: o.chips, id: o.id }, ...(o.also || [])] });
const step = (label, view, events, o = {}) => ({ label, view, events, ...o });
const msg = (from, text, o = {}) => ({ t: 'MESSAGE_POSTED', from, text, ...o });
const dm = (to, text, o = {}) => ({ t: 'AI_DM', to, text, ...o });
const reply = (from, text) => ({ t: 'RESIDENT_REPLY', from, text });
const optin = (id, rid, v = 'yes') => ({ t: 'OPT_IN', id, rid, v });
const toSup = (sid, text, o = {}) => ({ t: 'SUPPLIER_MSG', sid, from: 'ai', via: o.via || 'SMS', text, ...o });
const fromSup = (sid, text, o = {}) => ({ t: 'SUPPLIER_MSG', sid, from: 'supplier', text, ...o });
const quote = (id, sid, tiers, o = {}) => ({ t: 'QUOTE', id, offer: { sid, tiers, ...o } });
const upd = (id, patch, add) => ({ t: 'OPP_UPDATE', id, patch, add });
const choose = (target, k) => ({ t: 'CHOICE', target, k, auto: true });

const CASES = [];

/* 1. Group AC maintenance */
const acAsk = 'I noticed several neighbors are also looking for AC maintenance. Would you be interested if I coordinated a group service with providers your neighbors already recommend? It could lower the price and make scheduling easier.';
CASES.push({ key: 'ac', title: 'Group AC Maintenance', blurb: 'Neighbors who need AC service become one group job', you: 'maria', focus: 'cb', steps: [
  say('maria', 'Does anyone know a good company to service my AC?'),
  say('david', 'My unit is due for its six-month checkup. Any recommendations?'),
  say('sarah', 'The technician I called wants $350. Is that normal?'),
  say('carlos', 'CoolBreeze did ours last year. On time and tidy.', { chips: [['Remembered · CoolBreeze AC · 7 recs', 'suppliers', 'cb']], also: [{ t: 'REC', sid: 'cb', who: 'carlos', quote: 'Did ours last year. On time and tidy.' }] }),
  say('james', 'I’d be interested if anyone knows somebody who can do the whole building.'),
  step('More neighbors mention AC service', 'resident', [msg('priya', 'Same here, ours smells musty when it kicks on.'), msg('liz', 'Following!'), msg('ana', 'Interested too.'), msg('tom', 'Haven’t serviced ours in over a year.')], { tab: 'chat', wait: 2200 }),
  step('AI spots a shared need and opens an opportunity', 'ai', [{ t: 'DETECT', text: '8 residents mentioned AC service within 5 days. 3 AC providers are already recommended in the group.' },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'ac', title: 'Group AC maintenance', kind: 'group', goal: 20, base: 350, status: 'Detected', candidates: ['maria', 'david', 'sarah', 'james', 'priya', 'liz', 'ana', 'tom'], confidence: .82,
      evidence: ['8 residents asked about AC service in 5 days', 'Sarah was quoted $350 for one unit', 'Recommended providers: CoolBreeze AC (7), Grove Air (4), Polar HVAC (3)'],
      value: 'If 10 to 20 units join, roughly $1,000 to $3,000 saved together', permitted: 'Yes. All 8 have AI suggestions turned on.', next: 'Ask the 8 privately whether they want a group service',
      factors: [['People', '8 in 5 days'], ['Evidence', 'Direct asks and one price quote'], ['Proximity', 'Same building'], ['Value', '$100 to $150 per unit'], ['Feasible', 'Routine job, 3 recommended providers'], ['Timely', 'Cooler months are a good time to service'], ['Welcome?', 'They asked publicly for help'], ['Suppliers', '3 available']] } }], { wait: 2600 }),
  step('AI asks each interested neighbor privately', 'resident', [upd('ac', { status: 'Asking neighbors' }),
    dm('maria', acAsk, { id: 'acq', actions: [['Yes, count me in', 'yes'], ['What would it cost?', 'q'], ['Not interested', 'no']], on: { yes: [optin('ac', 'maria')], no: [optin('ac', 'maria', 'no')], q: [dm('maria', 'I don’t know yet. Sarah was quoted $350 for one unit. I’ll ask providers for a group price, and you decide after you see it.', { id: 'acq2', actions: [['Okay, count me in', 'y'], ['No thanks', 'n']], on: { y: [optin('ac', 'maria')], n: [optin('ac', 'maria', 'no')] } })] } }),
    ...['david', 'sarah', 'james', 'priya', 'liz', 'ana', 'tom'].map(r => dm(r, acAsk))], { tab: 'agent', wait: 2600 }),
  step('Neighbors answer privately', 'ai', [reply('david', 'Yes please!'), optin('ac', 'david'), reply('sarah', 'Yes, if it’s under $350.'), optin('ac', 'sarah'), reply('james', 'Yes. Could they also clean the dryer vent?'), dm('james', 'That’s outside AC service, but I’ll ask the providers whether they do it.'), optin('ac', 'james'),
    reply('tom', 'We’re good, just had ours done.'), optin('ac', 'tom', 'no'), reply('priya', 'In!'), optin('ac', 'priya'), reply('liz', 'Yes'), optin('ac', 'liz'), reply('ana', 'Count me in'), optin('ac', 'ana')], { wait: 2600 }),
  step('Maria says yes', 'resident', [choose('acq', 'yes')], { tab: 'agent' }),
  step('Five more neighbors join from the Deals page', 'resident', [upd('ac', {}, { extra: 5 })], { go: ['suppliers', 'deals'] }),
  step('AI asks 3 recommended providers for quotes', 'supplier', [upd('ac', { status: 'Getting quotes' }),
    ...['cb', 'ga', 'po'].map(sid => toSup(sid, 'Hi! 12 residents in the same building want routine AC maintenance in the next few weeks. Would you quote a coordinated service? Please include price per unit, what’s included, and available dates.', sid === 'cb' ? { id: 'rq-cb', actions: [['Quote $250 per unit for 10+', 'q']], on: { q: [fromSup('cb', '$250 per unit for 10 or more. Filter, coil clean and drain line flush. Mon to Fri next week.'), quote('ac', 'cb', [[10, 250]], { scope: 'Filter, coil clean, drain flush', dates: 'Next week, Mon–Fri' })] } } : {}))], { wait: 2400 }),
  step('Quotes come back', 'supplier', [choose('rq-cb', 'q'),
    fromSup('ga', '$210 per unit if you get 15 or more. Same scope, the week after next.'), quote('ac', 'ga', [[15, 210]], { scope: 'Same scope', dates: 'In two weeks' }),
    fromSup('po', '$200 per unit for 20 or more. Earliest is in three weeks.'), quote('ac', 'po', [[20, 200]], { scope: 'Same scope', dates: 'In three weeks' })], { wait: 2600 }),
  step('AI negotiates with CoolBreeze', 'supplier', [toSup('cb', 'Thanks Luis. Another provider offered $210 for 15+. Neighbors recommend you most and you’re available soonest. Could you do $220 at 12 units, and $200 if we reach 20?'),
    fromSup('cb', 'For one building in one week, yes. $220 at 12+, $200 at 20+.'), { t: 'OFFER_UPDATE', id: 'ac', sid: 'cb', patch: { tiers: [[10, 250], [12, 220], [20, 200]], note: 'Negotiated' } }], { wait: 2600 }),
  step('AI shares the options with the group and with Maria', 'resident', [upd('ac', { status: 'Choosing an offer' }),
    msg('ai', 'Group AC service: 12 neighbors are in. The best offer is $220 per unit, and it drops to $200 at 20 units. Join from Providers → Deals by Friday. Nobody sees who joined.'),
    dm('maria', 'Here are the offers. CoolBreeze: $220 now, $200 at 20 units, next week, 7 recommendations. Grove Air: $210 at 15+, in two weeks. Polar HVAC: $200 at 20+, in three weeks. Which one should we go with?', { id: 'acpick', title: 'Pick a provider', actions: [['CoolBreeze', 'cb'], ['Grove Air', 'ga'], ['None of these', 'none']],
      on: { cb: [{ t: 'OFFER_SELECTED', id: 'ac', sid: 'cb' }], ga: [{ t: 'OFFER_SELECTED', id: 'ac', sid: 'ga' }], none: [{ t: 'OFFER_SELECTED', id: 'ac', sid: null }, dm('maria', 'Okay. Nobody is booked. I’ll tell the group no offer was chosen.')] } })], { tab: 'chat', wait: 2600 }),
  step('Eight more neighbors join', 'resident', [upd('ac', {}, { extra: 8 })], { go: ['suppliers', 'deals'] }),
  step('Maria picks CoolBreeze', 'resident', [choose('acpick', 'cb')], { tab: 'agent' }),
  step('Group locks in and booking opens', 'supplier', [{ t: 'OFFER_SELECTED', id: 'ac', auto: true }, upd('ac', { status: 'Scheduling' }), toSup('$chosen:ac', 'Confirmed: the group chose you. 20 units next week. I’ll fill your calendar as neighbors pick times. You’ll see unit numbers only.'), { t: 'SLOTS', id: 'ac', n: 9 }], { wait: 2400 }),
  step('All appointments booked', 'supplier', [{ t: 'SLOTS', id: 'ac', n: 99 }, dm('maria', 'You’re booked: Monday, 9 to 11 AM. You pay the technician after the visit.', { cond: 'chosen:ac' })], { wait: 2400 }),
  step('Service week completed', 'supplier', [upd('ac', { status: 'Completed' }), { t: 'SUPPLIER_UPDATE', sid: '$chosen:ac', add: { jobs: 20 } }, { t: 'REC', sid: '$chosen:ac', who: 'sarah', quote: 'Group service week, quick and clean' },
    { t: 'MEMORY', text: 'Group AC service: 20 units in one week. 18 of 20 said it went well.', source: 'Follow-up answers' }], { wait: 2400 }),
  step('Outcome recorded for the group', 'resident', [{ t: 'OUTCOME', opp: 'ac', title: 'Group AC maintenance', notes: ['The provider can offer a 6-month reminder. Only neighbors who opt in will get it.', 'Possible revenue (illustrative): a coordination fee paid by the provider. Residents never pay Zing.'] }], { tab: 'chat' })
] });

/* 2. Supplier route optimization */
const joeAsk = 'Joe, a plumber recommended by 8 neighbors, will already be in the building Tuesday. He has openings and may waive his $85 visit fee. Want me to check a time for your faucet?';
CASES.push({ key: 'route', title: 'Supplier Route Optimization', blurb: 'Joe the plumber fills two openings on a trip he’s already making', you: 'maria', focus: 'joe',
  init: [msg('maria', 'My kitchen faucet keeps dripping. Anyone know a plumber?', { ago: 4320 }), msg('daniel', 'Is anyone else getting low water pressure?', { ago: 2900 }), msg('sophia', 'Looking for someone to replace a kitchen fixture.', { ago: 1500 })],
  steps: [
  step('Joe adds availability in his provider view', 'supplier', [{ t: 'OPENING_SET', sid: 'joe', opening: { id: 'o1', day: 'Tuesday', where: 'Building A', total: 2, left: 2, note: 'Already there for a water heater job' } }, toSup('joe', 'Got it: 2 openings in Building A on Tuesday. I’ll check whether any neighbors there need a plumber. Nobody’s details are shared until they agree.', { via: 'app' })], { wait: 2400 }),
  step('AI matches open plumbing needs', 'ai', [{ t: 'DETECT', text: 'Joe has 2 openings in Building A on Tuesday. 3 recent plumbing-related messages there.' },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'route', title: 'Joe has 2 openings in Building A on Tuesday', kind: 'route', status: 'Detected', candidates: ['maria', 'sophia'], confidence: .76,
      evidence: ['Maria asked about a dripping faucet 3 days ago and hasn’t booked anyone', 'Sophia wants a kitchen fixture replaced', 'Daniel’s low water pressure may be a building issue, so he isn’t offered a plumber'],
      value: '$85 trip fee waived per visit. 2 jobs for Joe without an extra trip', permitted: 'Maria and Sophia allow service suggestions. Daniel is excluded.', next: 'Offer the openings privately to Maria and Sophia',
      factors: [['People', '2 matching needs'], ['Evidence', 'Explicit asks, still open'], ['Proximity', 'Same building as Joe’s job'], ['Value', '$85 saved each'], ['Feasible', 'Small jobs fit one morning'], ['Timely', 'Tuesday, this week'], ['Welcome?', 'Both asked for a plumber'], ['Suppliers', 'Joe, 8 recs, claimed profile']] } }], { wait: 2600 }),
  step('AI offers the opening to Maria, privately', 'resident', [dm('maria', joeAsk, { id: 'rq', actions: [['Yes, check for me', 'yes'], ['No thanks', 'no'], ['Stop these suggestions', 'mute']],
    on: { yes: [toSup('joe', 'A resident in unit 4B needs a dripping kitchen faucet fixed. Could you fit them in Tuesday, and what would the visit cost?', { via: 'app', id: 'jq', actions: [['Offer 10–11 AM, no trip fee', 'ok']], on: { ok: [fromSup('joe', 'Tuesday 10 to 11 AM works. No $85 trip fee since I’m already there. A faucet repair is usually $90 to $120 plus parts.')] } })],
      no: [], mute: [dm('maria', 'Okay. I won’t suggest service openings again. You can change this under your initials.')] } }), dm('sophia', joeAsk.replace('your faucet', 'your kitchen fixture'))], { tab: 'agent' }),
  step('Maria says yes, and the AI asks Joe', 'supplier', [choose('rq', 'yes')], { wait: 2200 }),
  step('Joe offers a time and waives the trip fee', 'supplier', [choose('jq', 'ok')], { wait: 2200 }),
  step('AI brings Joe’s terms back to Maria', 'resident', [dm('maria', 'Joe confirmed Tuesday, 10 to 11 AM. No $85 trip fee. A faucet repair is usually $90 to $120 plus parts, paid to Joe directly.', { id: 'rb', title: 'Joe’s offer', actions: [['Book it', 'book'], ['Ask for another time', 'time'], ['Not now', 'no']],
    on: { book: [{ t: 'OPENING_TAKE', sid: 'joe', oid: 'o1', time: '10–11 AM', unit: '4B', what: 'Faucet repair' }, toSup('joe', 'Booked: unit 4B, Tuesday 10 to 11 AM, faucet repair.', { via: 'app' })],
      time: [toSup('joe', 'Could you do the afternoon instead?', { via: 'app' }), fromSup('joe', '2 to 3 PM works too.'), dm('maria', 'Joe can also do 2 to 3 PM.', { id: 'rb2', actions: [['Book 2–3 PM', 'b']], on: { b: [{ t: 'OPENING_TAKE', sid: 'joe', oid: 'o1', time: '2–3 PM', unit: '4B', what: 'Faucet repair' }] } })] } })], { tab: 'agent' }),
  step('Maria books it, and Joe’s openings drop to 1', 'supplier', [choose('rb', 'book'), upd('route', { status: 'Booking' })], { wait: 2400 }),
  step('Sophia takes the second opening', 'supplier', [reply('sophia', 'Yes please, the fixture.'), { t: 'OPENING_TAKE', sid: 'joe', oid: 'o1', time: '11 AM–12 PM', unit: '10D', what: 'Kitchen fixture' }, upd('route', { status: 'Both openings filled' })], { wait: 2400 }),
  step('Tuesday: both jobs done', 'resident', [{ t: 'SUPPLIER_UPDATE', sid: 'joe', add: { jobs: 2 } }, dm('maria', 'How did it go with Joe?', { id: 'rf', actions: [['It went great', 'good'], ['Not great', 'bad']], on: { good: [{ t: 'REC', sid: 'joe', who: 'maria', quote: 'Fixed the faucet in 40 minutes, no trip fee' }], bad: [{ t: 'MEMORY', text: 'Maria had a bad experience with Joe (faucet repair).', source: 'Maria' }] } })], { tab: 'agent' }),
  step('Maria rates the visit', 'resident', [choose('rf', 'good')], { tab: 'agent' }),
  step('Outcome recorded', 'ai', [upd('route', { status: 'Completed' }), { t: 'OUTCOME', title: 'Joe’s Tuesday route', stats: [['2', 'extra jobs, no extra trip'], ['$85', 'trip fee waived per visit'], ['0', 'residents’ details shared without consent']], notes: ['Possible revenue (illustrative): Joe pays a small fee per extra appointment filled, or subscribes to route tools.', 'His recommendation count only changes when neighbors give feedback.'] }])
] });

/* 3. Building service week */
CASES.push({ key: 'week', title: 'Building Service Week', blurb: 'A building-wide window-cleaning week, organized by the AI', you: 'liz', focus: 'cv', steps: [
  say('liz', 'Our windows are filthy after the storm. Has anyone hired someone for the outside glass?'),
  say('mike', 'Outside glass here needs rope access. Most companies won’t come for one unit.'),
  say('nina', 'We’d split the cost if a few of us did it together.'),
  say('tom', 'In! 6A.'),
  step('AI spots a building-wide opportunity', 'ai', [{ t: 'DETECT', text: '4 residents asked about exterior windows in 2 days. The job needs rope access, which is priced per setup, not per unit.' },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'week', title: 'Building window-cleaning week', kind: 'group', goal: 60, base: 150, status: 'Needs building approval', candidates: ['liz', 'mike', 'nina', 'tom'], confidence: .7,
      evidence: ['4 residents asked about exterior windows in 2 days', 'Rope access is priced per drop, so one setup can serve a whole stack of units', 'Window companies in the directory: ClearView (3 recs), Bright Pane (2)'],
      value: 'A single unit is usually quoted around $150 (illustrative). With 40+ units, often half that', permitted: 'Yes, after management approves roof access', next: 'Ask management about roof access and insurance before polling residents',
      requirements: [['Roof access', 'Not asked yet'], ['Provider insurance certificate', 'Not received']],
      factors: [['People', '4 now, likely many more'], ['Evidence', 'Direct asks'], ['Proximity', 'Same building, every stack'], ['Value', 'High: per-setup pricing'], ['Feasible', 'Needs management OK'], ['Timely', 'Right after a storm'], ['Welcome?', 'Nina proposed splitting it'], ['Suppliers', '2 recommended']] } }], { wait: 2600 }),
  step('AI checks with Liz before contacting management', 'resident', [dm('liz', 'Exterior cleaning works best as one building-wide job, but management has to approve roof access and the company’s insurance first. Want me to ask them?', { id: 'wq', actions: [['Yes, ask management', 'yes'], ['Not now', 'no']], on: { yes: [upd('week', { requirements: [['Roof access', 'Request sent to management (simulated email)'], ['Provider insurance certificate', 'Not received']] })] } })], { tab: 'agent' }),
  step('Liz approves the request', 'resident', [choose('wq', 'yes')], { tab: 'agent' }),
  step('Management approves roof access (simulated reply)', 'ai', [upd('week', { status: 'Collecting interest', requirements: [['Roof access', 'Approved by management (simulated)'], ['Provider insurance certificate', 'Required before work starts']] }), { t: 'MEMORY', text: 'Management allows exterior window work with roof access if the provider’s insurance is on file.', source: 'Management reply' }], { wait: 2400 }),
  step('AI invites the whole building', 'resident', [msg('ai', 'Window-cleaning week: outside glass for the whole building, done stack by stack over one week. The price per unit drops as more units join. Join from Providers → Deals. Nobody sees who joined.'), optin('week', 'liz'), optin('week', 'tom'), optin('week', 'nina'), optin('week', 'mike'), upd('week', {}, { extra: 7 })], { tab: 'chat' }),
  step('Sign-ups grow to 28', 'resident', [upd('week', {}, { extra: 17 })], { go: ['suppliers', 'deals'] }),
  step('AI asks two window companies for tiered pricing', 'supplier', [upd('week', { status: 'Getting quotes' }), toSup('cv', 'Hi! 28 units in one building want exterior window cleaning, and more are joining. Could you quote per unit at 20, 40 and 60 units, done by stack over one week? Roof access is approved, and we’ll need your insurance certificate.'), toSup('bp', 'Hi! 28 units in one building want exterior window cleaning, and more are joining. Could you quote per unit at different group sizes?')], { wait: 2400 }),
  step('Quotes come back with price tiers', 'supplier', [fromSup('cv', '$95 per unit at 20+, $70 at 40+, $55 at 60+. Insurance certificate attached.'), quote('week', 'cv', [[20, 95], [40, 70], [60, 55]], { scope: 'Exterior glass, by stack', dates: 'Any week this month' }), fromSup('bp', '$80 at 30+, $65 at 50+.'), quote('week', 'bp', [[30, 80], [50, 65]], { scope: 'Exterior glass', dates: 'Two weeks out' }), upd('week', { requirements: [['Roof access', 'Approved by management (simulated)'], ['Provider insurance certificate', 'ClearView’s received (simulated)']] })], { wait: 2600 }),
  step('Sign-ups reach 46', 'resident', [upd('week', {}, { extra: 18 })], { go: ['suppliers', 'deals'] }),
  step('AI negotiates the last tier', 'supplier', [toSup('bp', 'We’re at 46 units. Could you do $65?'), fromSup('bp', 'Not under 50, sorry.'), toSup('cv', 'We’re at 46 units, just short of 60. Could you do $65 if you get the whole week?'), fromSup('cv', 'With the full week booked, yes, $65 at 45+.'), { t: 'OFFER_UPDATE', id: 'week', sid: 'cv', patch: { tiers: [[20, 95], [40, 70], [45, 65], [60, 55]], note: 'Negotiated' } }], { wait: 2600 }),
  step('ClearView is chosen and proposes a stack-by-stack week', 'supplier', [{ t: 'OFFER_SELECTED', id: 'week', sid: 'cv' }, upd('week', { status: 'Scheduling', week: [['Monday', 'A and B stacks', 10], ['Tuesday', 'C and D stacks', 10], ['Wednesday', 'E and F stacks', 9], ['Thursday', 'G and H stacks', 9], ['Friday', 'J stack and makeups', 8]] }),
    toSup('cv', 'Confirmed: 46 units at $65, Monday to Friday. Your route is 2 stacks a day, 10 roof setups in total instead of 46 separate visits.')], { wait: 2600 }),
  step('Residents pick inside-glass times', 'resident', [dm('liz', 'Your stack (B) is Monday. Outside glass doesn’t need you home. Do you want the inside done too, for $20 more?', { id: 'wi', actions: [['Yes, 9–11 AM', 'a'], ['Outside only', 'b']] }), { t: 'SLOTS', id: 'week', n: 20 }], { tab: 'agent' }),
  step('Liz picks a time, and the rest of the week fills', 'supplier', [choose('wi', 'a'), { t: 'SLOTS', id: 'week', n: 99 }], { wait: 2400 }),
  step('Service week completed', 'supplier', [upd('week', { status: 'Completed' }), { t: 'SUPPLIER_UPDATE', sid: '$chosen:week', add: { jobs: 46 } }, { t: 'REC', sid: '$chosen:week', who: 'nina', quote: 'Building window week, spotless and on schedule' }, { t: 'MEMORY', text: 'Window week: 46 units in 5 days, 10 roof setups. Next time, start sign-ups right after storm season.', source: 'Outcome' }], { wait: 2400 }),
  step('Outcome recorded', 'resident', [{ t: 'OUTCOME', opp: 'week', title: 'Building window-cleaning week', extra: [['10', 'roof setups instead of 46']], notes: ['Management approved roof access, and the provider’s insurance was on file before work started.', 'No HOA software or formal adoption needed.'] }], { tab: 'chat' })
] });

/* 4. Neighborhood gathering */
CASES.push({ key: 'party', title: 'Neighborhood Gathering', blurb: 'Casual pool-party talk becomes a real event', you: 'tom', steps: [
  say('tom', 'The pool is finally open again. We should do something!'),
  say('ana', 'A pool party would be fun. Saturday?'),
  say('mike', 'Saturday or Sunday works for us.'),
  say('liz', 'The kids would love it!'),
  step('AI notices interest but no organizer', 'ai', [{ t: 'DETECT', text: '4 households interested in 10 minutes. No date, time or organizer yet.' },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'pool', title: 'Pool party, nobody organizing yet', kind: 'event', status: 'Detected', candidates: ['tom', 'ana', 'mike', 'liz'], confidence: .8, evidence: ['4 households said yes in 10 minutes', 'The pool reopened this week', 'No date, time or organizer yet'], value: 'Community: a first gathering after the pool reopens', permitted: 'Yes, to the people in the thread', next: 'Offer Tom and Ana help organizing' } }]),
  step('AI offers help to the people in the thread', 'resident', [msg('ai', '', { kind: 'nudge', id: 'pq', title: 'Want help organizing the pool party?', body: 'I can run a quick poll for the day, make an event, collect RSVPs and track who brings what.', scope: 'Visible to Tom, Ana, Mike and Liz', actions: [['Yes, help us', 'yes'], ['We’ve got it', 'no']],
    on: { yes: [upd('pool', { status: 'Organizing' }), msg('ai', 'Which day works for the pool party?', { kind: 'poll', id: 'poll', options: [['Saturday 4 PM', 0], ['Sunday 1 PM', 0]] })] } })], { tab: 'chat' }),
  step('Tom says yes, and the AI posts a poll', 'resident', [choose('pq', 'yes')], { tab: 'chat' }),
  step('Votes come in', 'resident', [{ t: 'POLL_VOTE', id: 'poll', opt: 0, n: 6 }, { t: 'POLL_VOTE', id: 'poll', opt: 1, n: 3 }], { tab: 'chat' }),
  step('Saturday wins', 'resident', [{ t: 'POLL_VOTE', id: 'poll', opt: 0, n: 5 }, { t: 'POLL_VOTE', id: 'poll', opt: 1, n: 2 }], { tab: 'chat' }),
  step('AI creates the event and shares it', 'resident', [{ t: 'EVENT_CREATED', event: { id: 'pe', title: 'Pool party', inDays: 3, time: '4 PM', where: 'Pool deck', by: 'Tom · 6A', going: 11 } }, msg('ai', '', { kind: 'evcard', eid: 'pe' }), upd('pool', { status: 'Event created' })], { tab: 'chat' }),
  step('Neighbors say what they’ll bring', 'resident', [msg('ana', 'We’ll bring drinks!'), { t: 'EVENT_UPDATE', id: 'pe', who: 'ana', bring: 'Drinks', add: { going: 2 } }, msg('mike', 'I can man the grill.'), { t: 'EVENT_UPDATE', id: 'pe', who: 'mike', bring: 'Grill', add: { going: 3 } }, msg('liz', 'Pool games for the kids.'), { t: 'EVENT_UPDATE', id: 'pe', who: 'liz', bring: 'Pool games', add: { going: 3 } }], { tab: 'chat', wait: 2600 }),
  step('AI flags missing logistics to the organizer', 'resident', [dm('tom', 'Two things are missing. Nobody has reserved the pool deck with management, and nobody is bringing plates or ice. Want me to draft the reservation and ask the group about plates and ice?', { id: 'lg', title: 'Two things are missing', actions: [['Yes, do both', 'yes'], ['Just the reservation', 'r']],
    on: { yes: [upd('pool', { requirements: [['Pool deck reservation', 'Requested from management (simulated)']] }), msg('ai', 'Anyone able to bring plates or a bag of ice for Saturday?')], r: [upd('pool', { requirements: [['Pool deck reservation', 'Requested from management (simulated)']] })] } })], { tab: 'agent' }),
  step('Tom approves, and Rosa covers plates and ice', 'resident', [choose('lg', 'yes'), msg('rosa', 'I’ll bring plates and ice!'), { t: 'EVENT_UPDATE', id: 'pe', who: 'rosa', bring: 'Plates and ice', add: { going: 2 } }, upd('pool', { requirements: [['Pool deck reservation', 'Confirmed by management (simulated)']] })], { tab: 'chat' }),
  step('Reminder the day before', 'resident', [{ t: 'EVENT_UPDATE', id: 'pe', add: { going: 6 } }, msg('ai', 'Reminder: pool party tomorrow at 4 PM on the pool deck. 27 neighbors are going. Bringing: drinks, grill, pool games, plates and ice.')], { tab: 'chat' }),
  step('The party happens', 'resident', [{ t: 'MEMORY', text: 'Saturday 4 PM pool party: 31 came. Reserve the deck a week ahead next time.', source: 'Organizer and RSVPs' }, { t: 'OUTCOME', title: 'Pool party', stats: [['31', 'neighbors came'], ['5', 'households brought something'], ['1', 'deck reservation made']], notes: ['Nobody had to take on organizing alone.'] }], { tab: 'chat' })
] });

/* 5. Shared issue */
CASES.push({ key: 'issue', title: 'Resolve a Shared Issue', blurb: 'Scattered gate reports become one tracked, resolved issue', you: 'ana',
  init: [{ t: 'ISSUE_CREATED', ago: 110000, item: { id: 'g0', cat: 'Maintenance', title: 'Front gate stuck open', by: 'Building manager', status: 'Fixed', reports: 2, log: [[110000, 'Reported by 2 neighbors in the chat'], [106000, 'Fixed: the motor sensor was replaced']] } }],
  steps: [
  say('carlos', 'Heads up, the front gate is stuck open again.', { chips: [['Maintenance · new issue', 'building', 'g1'], ['Linked · same gate fixed 76 days ago', 'building', 'g0']], also: [{ t: 'ISSUE_CREATED', item: { id: 'g1', cat: 'Maintenance', title: 'Front gate stuck open', by: 'Carlos · 2C', status: 'Open', reports: 1, linked: 'g0', log: 'Carlos reported it in the chat' } }] }),
  say('daniel', 'Is the entrance gate broken? It didn’t close behind me last night.', { chips: [['Same issue · 2 reports', 'building', 'g1']], also: [{ t: 'ISSUE_UPDATE', id: 'g1', add: { reports: 1 }, log: 'Daniel reported it too, in different words' }] }),
  step('AI links the reports and the earlier fix', 'ai', [{ t: 'DETECT', text: 'Two messages with different wording describe the same gate. It failed the same way 76 days ago.' },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'gate', title: 'Front gate stuck open', kind: 'issue', status: 'Tracking', candidates: ['carlos', 'daniel'], confidence: .88, evidence: ['2 reports in 18 hours, different wording', 'Same failure fixed 76 days ago (motor sensor)', 'Nobody has said management knows'], value: 'Security: the garage and lobby are open to anyone', permitted: 'Yes, privately to the people who reported it', next: 'Confirm it’s still happening, then offer a combined report' } }]),
  step('AI checks with the reporters privately', 'ai', [dm('carlos', 'Is the front gate still stuck open?'), reply('carlos', 'Yes, still open this morning.'), dm('daniel', 'Is the front gate still stuck open?'), reply('daniel', 'Yep.'), { t: 'ISSUE_UPDATE', id: 'g1', log: 'Both reporters confirmed it’s still open' }], { wait: 2400 }),
  say('ana', 'Gate’s still open?! Anyone can walk in.', { chips: [['Same issue · 3 reports', 'building', 'g1']], also: [{ t: 'ISSUE_UPDATE', id: 'g1', add: { reports: 1 }, log: 'Ana reported it' }] }),
  step('AI drafts one report, without names', 'resident', [dm('ana', 'Three neighbors reported the front gate, and the same problem was fixed in August. Here’s a combined report. It doesn’t include anyone’s name.', { id: 'gr', title: 'One report for management', draft: 'Hi, the front entrance gate has been stuck open since yesterday. Three residents reported it. The same problem was fixed about 2.5 months ago by replacing the motor sensor. Could you let us know when it will be repaired? Thank you.', actions: [['Send to management', 'send'], ['Not now', 'no']],
    on: { send: [{ t: 'ISSUE_UPDATE', id: 'g1', patch: { status: 'Reported to management' }, log: 'Combined report sent to management, approved by Ana (simulated email)' }] } })], { tab: 'agent' }),
  step('Ana approves, and the report is sent', 'resident', [choose('gr', 'send')], { tab: 'agent' }),
  step('Management replies (simulated)', 'resident', [{ t: 'ISSUE_UPDATE', id: 'g1', patch: { status: 'Scheduled' }, log: 'Management replied: a technician is coming Thursday (simulated)' }, msg('ai', 'Update on the front gate: management says a technician is coming Thursday.')], { go: ['building', 'g1'] }),
  step('Thursday follow-up with the first reporter', 'ai', [dm('carlos', 'Is the front gate fixed?'), reply('carlos', 'Yes, it closes fine now.'), { t: 'ISSUE_UPDATE', id: 'g1', patch: { status: 'Fixed' }, log: 'Carlos confirmed it’s fixed. Closed.' }, { t: 'MEMORY', text: 'Front gate motor failed twice in 3 months. Suggest asking management about a replacement if it fails again.', source: 'Issue history' }], { wait: 2400 }),
  step('Outcome recorded', 'resident', [{ t: 'OUTCOME', title: 'Front gate', stats: [['3', 'reports combined into 1'], ['1', 'report sent, with approval'], ['3 days', 'from first report to fixed']], notes: ['Second failure in 3 months. If it fails again, I’ll suggest asking about a new motor.'] }], { go: ['building', 'g1'] })
] });

/* 6. What did I miss? */
CASES.push({ key: 'catchup', title: 'What Did I Miss?', blurb: 'A personal catch-up after 4 days away', you: 'sophia',
  init: [{ t: 'SET', patch: { lastSeenAgo: 5800 } },
    msg('rosa', 'Did anyone catch that sunset tonight?', { ago: 5600 }), msg('mike', 'Who keeps taking the pool chairs up to their balcony', { ago: 5300 }), msg('tom', 'haha not me this time', { ago: 5290 }),
    msg('daniel', 'Elevator B is out again.', { ago: 4300, chips: [['Maintenance · new issue', 'building', 'el']] }), msg('ana', 'Still out today, had to take the stairs with groceries.', { ago: 2900, chips: [['Same issue · 4 reports', 'building', 'el']] }), msg('mike', 'Management says the part arrives Friday.', { ago: 2500 }),
    { t: 'ISSUE_CREATED', ago: 4300, item: { id: 'el', cat: 'Maintenance', title: 'Elevator B out of service', by: 'Daniel · 8E', status: 'Open', reports: 4, log: [[4300, 'Daniel reported it'], [2900, '3 more neighbors reported it'], [2500, 'Management said the part arrives Friday']] } },
    msg('james', 'Volt Electric fixed our outlets yesterday. Quick and fair.', { ago: 3600, chips: [['New provider · Volt Electric', 'suppliers', 'volt']] }), { t: 'REC', sid: 'volt', who: 'james', quote: 'Fixed our outlets, quick and fair', ago: 3600 },
    { t: 'EVENT_CREATED', ago: 2000, event: { id: 'mv', title: 'Movie night on the roof', inDays: 2, time: '8 PM', where: 'Roof deck', by: 'Priya · 6D', going: 14, bring: [['Priya · 6D', 'Projector']] } }, msg('ai', '', { kind: 'evcard', eid: 'mv', ago: 2000 }),
    msg('priya', 'Thank you to whoever brought my package up!', { ago: 1400 }), msg('liz', 'Anyone watching the game later?', { ago: 900 }), msg('carlos', 'Go team', { ago: 880 }),
    { t: 'OUTCOME', ago: 1200, title: 'Group AC maintenance', stats: [['20', 'households served'], ['$200', 'group price'], ['$3,000', 'saved together (illustrative)']], notes: [] }],
  steps: [
  step('Sophia opens the app after 4 days away', 'resident', [], { tab: 'chat', wait: 1600 }),
  step('Her catch-up opens', 'resident', [], { ui: 'catchup', wait: 4200 }),
  step('She asks a follow-up', 'resident', [reply('sophia', 'Is the elevator fixed yet?'), dm('sophia', 'Not yet. Elevator B is still out. 4 neighbors reported it, and Mike said 2 days ago that management expects the part Friday.')], { tab: 'agent', wait: 2600 }),
  step('And asks about the AC group service', 'resident', [reply('sophia', 'Can I still join the AC group service?'), dm('sophia', 'That group finished last week: 20 units at $200. The provider offered a second round next month. Want me to add you to the list? You’d only hear about it if it happens.', { id: 'cq', actions: [['Yes, add me', 'yes'], ['No thanks', 'no']] })], { tab: 'agent', wait: 2600 })
] });

/* 7. Discover opportunities */
CASES.push({ key: 'discover', title: 'Discover Opportunities', blurb: 'Ordinary chat hides four opportunities. Pick one to run it.', you: 'mei',
  init: [msg('sophia', 'Anyone handy with mounting a TV?', { ago: 8600 }), msg('carlos', 'Our closet door came off its track again.', { ago: 12000 })],
  steps: [
  say('mike', 'Need to replace our AC filters again. Anyone know the size for these units?'),
  say('priya', 'Ours are 20x25x1, I think. Due for new ones too.'),
  say('liz', 'Any ideas for kids this weekend? Rain all week.'),
  say('james', 'Getting rid of a dresser and a desk. Free to a good home.'),
  say('nina', 'Ordering filters this week as well.'),
  say('rosa', 'Looking for weekend activities for my 7-year-old too.'),
  say('sarah', 'I have two chairs to give away.'),
  say('rafa', 'Hi all, Rafa here. I have Wednesday and Thursday open next week if anyone needs small repairs.'),
  step('AI finds four opportunities in ordinary chat', 'ai', [{ t: 'DETECT', text: 'Scanned the last 14 days: 4 possible opportunities.' },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'filters', flow: 'filters', title: 'Order AC filters together', kind: 'group', status: 'Detected', candidates: ['mike', 'priya', 'nina'], confidence: .78, evidence: ['3 residents need AC filters this week', 'Same unit type, same filter size (20x25x1)', 'Grove Hardware delivers to the front desk (2 recs)'], value: 'About half price per filter in bulk, one delivery (illustrative)', permitted: 'Yes, all 3 allow suggestions', next: 'Ask the 3 whether they want to order together' } },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'kids', flow: 'kids', title: 'Connect two families with kids', kind: 'event', status: 'Detected', candidates: ['liz', 'rosa'], confidence: .55, evidence: ['Liz and Rosa both asked about kids’ weekend activities', 'Rainy forecast, so indoor space helps', 'The party room is free Saturday morning'], value: 'Social: two families with kids the same age meet', permitted: 'Ask first. Names are shared only if both agree.', next: 'Offer to connect Liz and Rosa' } },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'swap', flow: 'swap', title: 'Lobby furniture swap', kind: 'event', status: 'Detected', candidates: ['james', 'sarah', 'david'], confidence: .66, evidence: ['James and Sarah are giving away furniture', 'Others usually ask for furniture after posts like these', 'Bulk pickup costs the building'], value: 'Furniture finds a home, fewer bulk pickups', permitted: 'Needs management OK to use the lobby', next: 'Suggest a Sunday-morning swap' } },
    { t: 'OPPORTUNITY_CREATED', opp: { id: 'rafa', flow: 'rafa', title: 'Fill Rafa’s openings next week', kind: 'route', status: 'Detected', candidates: ['sophia', 'carlos'], confidence: .71, evidence: ['Rafa (5 recs) has Wednesday and Thursday open', 'Sophia asked about mounting a TV 6 days ago', 'Carlos’s closet door is off its track'], value: '2 small jobs done in one trip', permitted: 'Yes, both requests are still open', next: 'Offer Rafa’s openings to Sophia and Carlos' } }], { wait: 3000 }),
  step('Pick an opportunity in AI Activity and press Start', 'ai', [], { wait: 1500 })
] });

const FLOWS = {
  filters: [
    step('AI asks the 3 neighbors privately', 'ai', [...['mike', 'priya', 'nina'].map(r => dm(r, 'Three neighbors need AC filters this week. Want me to order them together for a lower price, delivered to the front desk?')), reply('mike', 'Yes, 2 please'), optin('filters', 'mike'), reply('priya', 'Yes!'), optin('filters', 'priya'), reply('nina', 'Sure'), optin('filters', 'nina')]),
    step('AI asks Grove Hardware for a bulk price', 'supplier', [toSup('gh', 'Hi! Three households in one building need 20x25x1 AC filters, 18 in total. Could you quote a bulk price delivered to the front desk?'), fromSup('gh', 'For 18, $7 each instead of $14, delivered Thursday.'), quote('filters', 'gh', [[3, 7]], { scope: '18 filters, delivered', dates: 'Thursday' })], { focus: 'gh' }),
    step('Neighbors confirm and the order is placed', 'ai', [{ t: 'OFFER_SELECTED', id: 'filters', sid: 'gh' }, upd('filters', { status: 'Ordered' })]),
    step('Delivered to the front desk', 'resident', [upd('filters', { status: 'Completed' }), { t: 'OUTCOME', title: 'AC filters, ordered together', stats: [['18', 'filters delivered'], ['$7', 'each, instead of $14'], ['$126', 'saved together (illustrative)']], notes: [] }], { tab: 'chat' })],
  kids: [
    step('AI asks Liz and Rosa privately', 'ai', [dm('liz', 'Rosa also asked about kids’ activities this weekend. Want me to connect you? I’ll only share names if you both say yes.'), reply('liz', 'Yes!'), dm('rosa', 'Liz also asked about kids’ activities this weekend. Want me to connect you?'), reply('rosa', 'That would be great'), upd('kids', { status: 'Connected' })]),
    step('A kids’ morning is planned', 'resident', [{ t: 'EVENT_CREATED', event: { id: 'km', title: 'Kids’ craft morning', inDays: 2, time: '10 AM', where: 'Party room', by: 'Liz · 3B', going: 4 } }, msg('ai', '', { kind: 'evcard', eid: 'km' })], { tab: 'chat' }),
    step('More families join', 'resident', [{ t: 'EVENT_UPDATE', id: 'km', add: { going: 5 } }, msg('maria', 'We’ll come with our two!')], { tab: 'chat' }),
    step('Outcome recorded', 'resident', [upd('kids', { status: 'Completed' }), { t: 'OUTCOME', title: 'Kids’ craft morning', stats: [['6', 'kids came'], ['4', 'families met']], notes: [] }], { tab: 'chat' })],
  swap: [
    step('AI suggests a swap to James', 'resident', [dm('mei', 'James and Sarah are giving away furniture. A lobby swap Sunday morning could help. Want me to ask management and post it?', { id: 'sw', actions: [['Yes, go ahead', 'yes'], ['Not now', 'no']], on: { yes: [upd('swap', { requirements: [['Lobby use', 'Requested from management (simulated)']] })] } })], { tab: 'agent' }),
    step('Mei says yes, and management approves (simulated)', 'ai', [choose('sw', 'yes'), upd('swap', { status: 'Approved', requirements: [['Lobby use', 'Approved, 10 AM to 12 PM (simulated)']] })]),
    step('Swap is posted', 'resident', [{ t: 'EVENT_CREATED', event: { id: 'fs', title: 'Furniture swap', inDays: 3, time: '10 AM', where: 'Lobby', by: 'Neighbors AI', going: 6, bring: [['James · 12F', 'Dresser and desk'], ['Sarah · 9A', 'Two chairs']] } }, msg('ai', '', { kind: 'evcard', eid: 'fs' })], { tab: 'chat' }),
    step('Outcome recorded', 'resident', [upd('swap', { status: 'Completed' }), { t: 'OUTCOME', title: 'Lobby furniture swap', stats: [['7', 'items found a new home'], ['0', 'bulk pickups needed']], notes: [] }], { tab: 'chat' })],
  rafa: [
    step('Rafa’s openings are added', 'supplier', [{ t: 'OPENING_SET', sid: 'rafa', opening: { id: 'r1', day: 'Wednesday', where: 'Building A', total: 2, left: 2 } }], { focus: 'rafa' }),
    step('AI offers them to Sophia and Carlos', 'ai', [dm('sophia', 'Rafa, a handyman 5 neighbors recommend, has an opening Wednesday. Want me to book your TV mount?'), reply('sophia', 'Yes please'), dm('carlos', 'Rafa has an opening Wednesday. Want me to book your closet door?'), reply('carlos', 'Yes')]),
    step('Both are booked on one trip', 'supplier', [{ t: 'OPENING_TAKE', sid: 'rafa', oid: 'r1', time: '9–10 AM', unit: '10D', what: 'TV mount' }, { t: 'OPENING_TAKE', sid: 'rafa', oid: 'r1', time: '10–11 AM', unit: '2C', what: 'Closet door' }, upd('rafa', { status: 'Booked' })], { focus: 'rafa' }),
    step('Outcome recorded', 'ai', [upd('rafa', { status: 'Completed' }), { t: 'SUPPLIER_UPDATE', sid: 'rafa', add: { jobs: 2 } }, { t: 'OUTCOME', title: 'Rafa’s Wednesday', stats: [['2', 'repairs done in one trip'], ['$0', 'extra trip fees']], notes: [] }])]
};

window.ZFIX = { people, suppliers };
window.ZCASES = CASES;
window.ZFLOWS = FLOWS;
})();
