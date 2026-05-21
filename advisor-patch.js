// Quant Skills Trainer integration patch v2
const QST_TRAINER_URL = 'https://iainholmes.github.io/quant-skills-trainer/';
const QST_ADVISOR_KEY = 'qst_advisor_session_v1';

const QST_METHOD_MAP = {
  'logit': {lang:'r', mod:'glm_bridge'}, 'probit': {lang:'r', mod:'glm_bridge'},
  'binary choice': {lang:'r', mod:'glm_bridge'}, 'logit / probit': {lang:'r', mod:'glm_bridge'},
  'poisson': {lang:'r', mod:'glm_bridge'}, 'negative binomial': {lang:'r', mod:'glm_bridge'},
  'tobit': {lang:'r', mod:'glm_bridge'}, 'censored': {lang:'r', mod:'glm_bridge'},
  'glm': {lang:'r', mod:'glm_bridge'},
  'ols': {lang:'r', mod:'r_ols'}, 'ordinary least squares': {lang:'r', mod:'r_ols'},
  'semi-log hedonic': {lang:'r', mod:'r_ols'}, 'hedonic': {lang:'r', mod:'r_ols'},
  'descriptive ols': {lang:'r', mod:'r_ols'},
  '2sls': {lang:'r', mod:'r_iv'}, 'two-stage least squares': {lang:'r', mod:'r_iv'},
  'instrumental variables': {lang:'r', mod:'r_iv'}, 'iv': {lang:'r', mod:'r_iv'},
  'control function': {lang:'r', mod:'r_iv'},
  'difference-in-differences': {lang:'r', mod:'r_did'}, 'did': {lang:'r', mod:'r_did'},
  'staggered': {lang:'r', mod:'r_did'}, 'callaway': {lang:'r', mod:'r_did'},
  'twfe': {lang:'r', mod:'r_did'}, 'synthetic control': {lang:'r', mod:'r_did'},
  'regression discontinuity': {lang:'r', mod:'r_rd'}, 'rd': {lang:'r', mod:'r_rd'},
  'fixed effects': {lang:'r', mod:'r_panel'}, 'panel': {lang:'r', mod:'r_panel'},
  'double ml': {lang:'python', mod:'py_ml'}, 'causal forest': {lang:'python', mod:'py_ml'},
  'time series': {lang:'r', mod:'r_ts'}, 'arima': {lang:'r', mod:'r_ts'},
};

function qstFindMapping(method) {
  const m = (method||'').toLowerCase();
  for (const [k,v] of Object.entries(QST_METHOD_MAP)) { if (m.includes(k)) return v; }
  return null;
}

function buildAdvisorSummary() {
  const v = k => { const x=ans[k]; return (!x||x==='_skipped')?null:x; };
  const lines = [];
  if (v('context'))       lines.push('Study: '+v('context'));
  if (v('field'))         lines.push('Field: '+v('field'));
  if (v('question_type')) lines.push('Research type: '+v('question_type'));
  if (v('treatment'))     lines.push('Treatment: '+v('treatment'));
  if (v('endogeneity'))   lines.push('Identification: '+v('endogeneity'));
  if (v('data_structure'))lines.push('Data: '+[].concat(v('data_structure')).join(', '));
  if (v('outcome'))       lines.push('Outcome: '+v('outcome'));
  if (v('geo'))           lines.push('Geography: '+v('geo'));
  if (_toolkit&&_toolkit.sections)
    lines.push('Estimators: '+_toolkit.sections.map(s=>s.label+': '+s.method).join(' | '));
  return lines.join('\n');
}

function qstSaveSession(session) {
  try { localStorage.setItem(QST_ADVISOR_KEY, JSON.stringify({...session, timestamp:Date.now()})); } catch(e){}
  qstRenderButton(session);
}

function qstRenderButton(session) {
  const wrap = document.getElementById('qst-trainer-btn-wrap');
  if (!wrap) return;
  const mapping = qstFindMapping(session.method||'');
  const lang = session.lang || (mapping?mapping.lang:'r');
  const mod  = mapping ? mapping.mod : null;
  const url  = new URL(QST_TRAINER_URL);
  url.searchParams.set('lang', lang);
  if (mod) url.searchParams.set('module', mod);
  url.searchParams.set('from', 'advisor');

  const langLabel = lang.charAt(0).toUpperCase()+lang.slice(1);
  const modLabel  = mod ? mod.replace(/_/g,' ') : 'relevant module';

  wrap.innerHTML = `<a href="${url}" target="_blank" rel="noreferrer" class="qst-btn">
    <div class="qst-btn-left">
      <div class="qst-btn-eyebrow">Continue in</div>
      <div class="qst-btn-title">Quant Skills Trainer</div>
      <div class="qst-btn-meta">${langLabel}&ensp;·&ensp;${modLabel}</div>
    </div>
    <div class="qst-btn-arrow">→</div>
  </a>`;
}

(function() {
  const style = document.createElement('style');
  style.textContent = `
#qst-trainer-btn-wrap { margin: 1.25rem 0 0; }
.qst-btn {
  display: inline-flex; align-items: center; justify-content: space-between;
  gap: 20px; padding: 14px 20px;
  background: rgba(126,182,255,0.07);
  border: .5px solid rgba(126,182,255,0.3);
  border-radius: 10px; text-decoration: none; color: #fff;
  font-family: inherit; width: 100%; max-width: 480px;
  transition: background .18s, border-color .18s, transform .18s;
}
.qst-btn:hover {
  background: rgba(126,182,255,0.13);
  border-color: rgba(126,182,255,0.6);
  transform: translateY(-1px);
}
.qst-btn-eyebrow {
  font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(126,182,255,.6); margin-bottom: 4px; font-weight: 500;
}
.qst-btn-title {
  font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 3px;
}
.qst-btn-meta {
  font-size: 11px; color: rgba(255,255,255,.4);
  font-family: 'Courier New', monospace; letter-spacing: .04em;
}
.qst-btn-arrow {
  font-size: 20px; color: rgba(126,182,255,.7); flex-shrink: 0;
  transition: transform .18s;
}
.qst-btn:hover .qst-btn-arrow { transform: translateX(3px); }
`;
  document.head.appendChild(style);
})();
