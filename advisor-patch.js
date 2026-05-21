// ── Quant Skills Trainer integration patch ───────────────────────────────────
// Version 2 — written against the actual Advisor source structure.
//
// INSTALLATION — three steps, all clearly marked below with ── STEP N ──:
//
//   STEP 1  Add <div id="qst-trainer-btn-wrap"></div> to renderResults() HTML
//           Place it immediately after the closing </div> of the narrative block
//           (the one with id="tk-narrative"). The narrative block ends with:
//                 </div><!-- end narrative -->
//           Add the div right after that.
//
//   STEP 2  Call qstSaveSession() at the end of generate() in the Advisor,
//           after renderResults() and show('results') have been called.
//           Paste this block there:
//
//               qstSaveSession({
//                 method:  (_toolkit.sections[0]||{}).method || '',
//                 study:   ans.context || ans.field || 'your research design',
//                 summary: buildAdvisorSummary(),
//                 lang:    codeLang || 'r',
//               });
//
//   STEP 3  Add <script src="advisor-patch.js"></script> before </body>
//           OR paste the contents of this file inline before </body>.

const QST_TRAINER_URL = 'https://iainholmes.github.io/quant-skills-trainer/';
const QST_ADVISOR_KEY = 'qst_advisor_session_v1';

// ── Method → Trainer module mapping ─────────────────────────────────────────
const QST_METHOD_MAP = {
  // OLS / Hedonic
  'ols':                           {lang:'r', mod:'r_ols'},
  'ordinary least squares':        {lang:'r', mod:'r_ols'},
  'semi-log hedonic':              {lang:'r', mod:'r_ols'},
  'hedonic':                       {lang:'r', mod:'r_ols'},
  'descriptive ols':               {lang:'r', mod:'r_ols'},
  // IV
  '2sls':                          {lang:'r', mod:'r_iv'},
  'two-stage least squares':       {lang:'r', mod:'r_iv'},
  'instrumental variables':        {lang:'r', mod:'r_iv'},
  'iv':                            {lang:'r', mod:'r_iv'},
  'control function':              {lang:'r', mod:'r_iv'},
  // DiD / Staggered
  'difference-in-differences':     {lang:'r', mod:'r_did'},
  'did':                           {lang:'r', mod:'r_did'},
  'diff-in-diff':                  {lang:'r', mod:'r_did'},
  'staggered':                     {lang:'r', mod:'r_did'},
  'callaway':                      {lang:'r', mod:'r_did'},
  'twfe':                          {lang:'r', mod:'r_did'},
  // RD
  'regression discontinuity':      {lang:'r', mod:'r_rd'},
  'rd':                            {lang:'r', mod:'r_rd'},
  'rdd':                           {lang:'r', mod:'r_rd'},
  // Panel / FE
  'fixed effects':                 {lang:'r', mod:'r_panel'},
  'panel':                         {lang:'r', mod:'r_panel'},
  'two-way fixed effects':         {lang:'r', mod:'r_panel'},
  // SCM
  'synthetic control':             {lang:'r', mod:'r_did'},
  'synthetic did':                 {lang:'r', mod:'r_did'},
  'scm':                           {lang:'r', mod:'r_did'},
  // ML
  'double ml':                     {lang:'python', mod:'py_ml'},
  'debiased ml':                   {lang:'python', mod:'py_ml'},
  'causal forest':                 {lang:'python', mod:'py_ml'},
  'lasso':                         {lang:'python', mod:'py_ml'},
  // Time series
  'arima':                         {lang:'r', mod:'r_ts'},
  'time series':                   {lang:'r', mod:'r_ts'},
};

function qstFindMapping(methodStr) {
  const m = (methodStr || '').toLowerCase();
  for (const [key, val] of Object.entries(QST_METHOD_MAP)) {
    if (m.includes(key)) return val;
  }
  return null;
}

// Build a plain-text summary of the Advisor session for the Trainer prompt
function buildAdvisorSummary() {
  // ans and _toolkit are globals in the Advisor
  const v = k => { const x = ans[k]; return (!x || x === '_skipped') ? null : x; };
  const lines = [];
  if (v('context'))        lines.push('Study: ' + v('context'));
  if (v('field'))          lines.push('Field: ' + v('field'));
  if (v('question_type'))  lines.push('Research type: ' + v('question_type'));
  if (v('treatment'))      lines.push('Treatment: ' + v('treatment'));
  if (v('endogeneity'))    lines.push('Identification: ' + v('endogeneity'));
  if (v('data_structure')) lines.push('Data: ' + [].concat(v('data_structure')).join(', '));
  if (v('n_treated'))      lines.push('Units treated: ' + v('n_treated'));
  if (v('outcome'))        lines.push('Outcome type: ' + v('outcome'));
  if (v('geo'))            lines.push('Geography role: ' + v('geo'));
  if (_toolkit && _toolkit.sections) {
    lines.push('Recommended estimators: ' +
      _toolkit.sections.map(s => s.label + ': ' + s.method).join(' | '));
  }
  return lines.join('\n');
}

// ── STEP 2 — call this after show('results') inside generate() ───────────────
function qstSaveSession(session) {
  try {
    localStorage.setItem(QST_ADVISOR_KEY, JSON.stringify({
      ...session,
      timestamp: Date.now(),
    }));
  } catch(e) { console.warn('QST: could not write session', e); }
  qstRenderButton(session);
}

// ── Render the Practice in Trainer button ────────────────────────────────────
function qstRenderButton(session) {
  const wrap = document.getElementById('qst-trainer-btn-wrap');
  if (!wrap) {
    console.warn('QST: #qst-trainer-btn-wrap not found — did you complete STEP 1?');
    return;
  }

  const methodStr = (session.method || '').toLowerCase();
  const mapping   = qstFindMapping(methodStr);

  // Prefer the user's active language in the Advisor if detectable
  const langPref  = session.lang || (mapping ? mapping.lang : 'r');
  const modId     = mapping ? mapping.mod : null;

  // Build URL
  const url = new URL(QST_TRAINER_URL);
  // Map Advisor language labels to Trainer lang keys
  const langMap = { r: 'r', stata: 'stata', python: 'python' };
  url.searchParams.set('lang', langMap[langPref] || 'r');
  if (modId) url.searchParams.set('module', modId);
  url.searchParams.set('from', 'advisor');

  const langLabel = (langPref.charAt(0).toUpperCase() + langPref.slice(1));
  const modLabel  = modId ? modId.replace(/_/g, ' ') : 'relevant module';

  wrap.innerHTML = `
    <a href="${url}" target="_blank" rel="noreferrer" class="qst-btn">
      <div class="qst-btn-icon">
        <svg viewBox="0 0 56 56" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
          <rect width="56" height="56" rx="10" fill="rgba(255,255,255,0.1)"/>
          <circle cx="18" cy="28" r="5.5" fill="rgba(255,255,255,0.85)"/>
          <circle cx="33" cy="18" r="5.5" fill="rgba(255,255,255,0.65)"/>
          <circle cx="33" cy="38" r="5.5" fill="rgba(255,255,255,0.5)"/>
          <line x1="23.5" y1="25.5" x2="27.5" y2="20.5" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="23.5" y1="30.5" x2="27.5" y2="35.5" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="qst-btn-body">
        <div class="qst-btn-title">Practice this in the Trainer →</div>
        <div class="qst-btn-sub">${langLabel} · ${modLabel}</div>
      </div>
    </a>`;
}

// ── CSS injection ─────────────────────────────────────────────────────────────
(function() {
  const style = document.createElement('style');
  style.textContent = `
#qst-trainer-btn-wrap { margin: 1.5rem 0 0; }

.qst-btn {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 16px 22px;
  background: linear-gradient(135deg, #1b3a5c 0%, #2e5484 100%);
  border: .5px solid rgba(126,182,255,.3);
  border-radius: 12px;
  text-decoration: none;
  color: #fff;
  font-family: inherit;
  box-shadow: 0 4px 20px rgba(0,0,0,.35);
  transition: transform .18s, box-shadow .18s, border-color .18s;
  max-width: 480px;
  width: 100%;
}
.qst-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,.45);
  border-color: rgba(126,182,255,.6);
}
.qst-btn-icon { flex-shrink: 0; }
.qst-btn-body { display: flex; flex-direction: column; gap: 4px; }
.qst-btn-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: .01em;
}
.qst-btn-sub {
  font-size: 11.5px;
  color: rgba(255,255,255,.55);
  font-family: 'Courier New', monospace;
  letter-spacing: .04em;
  text-transform: uppercase;
}
  `;
  document.head.appendChild(style);
})();
