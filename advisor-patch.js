// Quant Skills Trainer integration patch v2
const QST_TRAINER_URL = 'https://iainholmes.github.io/quant-skills-trainer/';
const QST_ADVISOR_KEY = 'qst_advisor_session_v1';

// Maps a free-text method description to a canonical Advisor tag. The actual
// language + module id are resolved via the shared TRAINER_TAG_MAP /
// trainerModuleFor() in index.html, using whatever language the student
// actually has selected — not a value hardcoded per method. (Previously this
// map hardcoded module ids like 'r_ols' regardless of language, so a Stata
// or Python student would get sent to the Trainer with their correct
// language selected but an R module id that doesn't exist under that
// language — the module silently failed to open.)
const QST_METHOD_MAP = {
  'logit': 't_logit', 'probit': 't_logit',
  'binary choice': 't_logit', 'logit / probit': 't_logit',
  'poisson': 't_poisson', 'negative binomial': 't_poisson',
  'tobit': 't_tobit', 'censored': 't_tobit',
  'glm': 't_logit',
  'ols': 't_ols', 'ordinary least squares': 't_ols',
  'semi-log hedonic': 't_ols', 'hedonic': 't_ols',
  'descriptive ols': 't_ols',
  '2sls': 't_iv', 'two-stage least squares': 't_iv',
  'instrumental variables': 't_iv', 'iv': 't_iv',
  'control function': 't_iv',
  'difference-in-differences': 't_did', 'did': 't_did',
  'staggered': 't_did', 'callaway': 't_did', 'twfe': 't_did',
  'synthetic control': 't_scm',
  'regression discontinuity': 't_rd', 'rd': 't_rd',
  'fixed effects': 't_fe', 'panel': 't_fe',
  'double ml': 't_dml', 'causal forest': 't_cf',
  'time series': 't_cox', 'arima': 't_cox',
};

function qstFindMapping(method) {
  const m = (method||'').toLowerCase();
  for (const [k,tag] of Object.entries(QST_METHOD_MAP)) { if (m.includes(k)) return tag; }
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
  const tag  = qstFindMapping(session.method||'');
  const lang = session.lang || 'r';
  const mod  = (tag && typeof trainerModuleFor === 'function') ? trainerModuleFor(tag, lang) : null;
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
