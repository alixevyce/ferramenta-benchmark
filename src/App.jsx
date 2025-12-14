import { useState, useEffect } from 'react';
import './app.css';

// Componente Modal de Instruções (CORRIGIDO: Recebe 't' para traduzir o título e rodapé)
const InstructionsModal = ({ isOpen, onClose, content, t }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="btn small close-modal" onClick={onClose}>✖</button>
        <h3>{t.instructions}</h3> {/* CORRIGIDO: Usa t.instructions */}
        <div className="instructions-text">{content}</div>
        <p className="muted" style={{textAlign:'right'}}>{t.closeInstructions}</p> {/* CORRIGIDO: Usa t.closeInstructions */}
      </div>
    </div>
  );
};


const translations = {
  pt: {
    title: 'Ferramenta de Benchmarking',
    apiKey: 'Chave API',
    import: 'Importar Dados',
    export: 'Exportar Dados',
    urlsLabel: 'URLS dos produtos',
    urlsCount: 'x URLS adicionadas',
    clearUrls: 'Limpar URLS',
    attrsLabel: 'Atributos e Importância', 
    attrsCount: 'x atributos definidos',
    clearAttrs: 'Limpar atributos',
    generate: 'Gerar Benchmark',
    results: 'Resultados',
    analyzing: 'Analisando URLS e atributos definidos',
    finished: 'Análise concluída ✅',
    noUrls: '(nenhuma URL)',
    noAttrs: '(nenhum atributo)',
    langLabel: 'PT',
    instructions: 'Instruções',
    closeInstructions: 'Feche para continuar.', // NOVO: Texto para o rodapé do modal
    noResultsYet: 'Nenhum resultado gerado.', // NOVO: Texto para quando não há resultados
    // REMOÇÃO DE **
    instructionsContent: 'Bem-vindo à Ferramenta de Benchmarking Altus. \n\n1. URLs: Adicione as URLs dos produtos, uma por vez. \n2. Atributos: Defina os atributos e use o campo para ajustar a Importância (1 a 10). \n3. Gerar: Clique para iniciar a análise. \n\nTroque o tema ou idioma a qualquer momento.'
  },
  en: {
    title: 'Benchmarking Tool',
    apiKey: 'API Key',
    import: 'Import Data',
    export: 'Export Data',
    urlsLabel: 'Product URLs',
    urlsCount: 'x URLs added',
    clearUrls: 'Clear URLs',
    attrsLabel: 'Attributes and Importance',
    attrsCount: 'x attributes defined',
    clearAttrs: 'Clear attributes',
    generate: 'Generate Benchmark',
    results: 'Results',
    analyzing: 'Analyzing URLs and defined attributes',
    finished: 'Analysis completed ✅',
    noUrls: '(no URLs)',
    noAttrs: '(no attributes)',
    langLabel: 'EN',
    instructions: 'Instructions',
    closeInstructions: 'Close to continue.', // NOVO: Texto para o rodapé do modal
    noResultsYet: 'No results generated yet.', // NOVO: Texto para quando não há resultados
    // REMOÇÃO DE **
    instructionsContent: 'Welcome to the Altus Benchmarking Tool. \n\n1. URLs: Add product URLs, one at a time. \n2. Attributes: Define attributes and use the field to adjust Importance (1 to 10). \n3. Generate: Click to start the analysis. \n\nToggle the theme or language at any time.'
  }
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'pt');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [urlInput, setUrlInput] = useState('');
  const [urlList, setUrlList] = useState([]);
  const [attrInput, setAttrInput] = useState('');
  const [attrWithImportance, setAttrWithImportance] = useState([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [analyzingText, setAnalyzingText] = useState('');
  const [showInstructions, setShowInstructions] = useState(false); 

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = translations[lang];

  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const isValidUrl = (url) => {
    try { new URL(url); return true; } 
    catch { return false; }
  };

  // --- Funções de URL
  const addUrl = () => {
    const trimmed = urlInput.trim();
    if(!trimmed) return;
    if(!isValidUrl(trimmed)){
      alert('URL inválida!');
      return;
    }
    setUrlList([...urlList, trimmed]);
    setUrlInput('');
  };
  const removeUrl = (index) => setUrlList(urlList.filter((_,i)=>i!==index));
  const clearUrls = () => setUrlList([]);

  // --- Funções de Atributo (com importância)
  const addAttr = () => {
    const trimmed = attrInput.trim();
    if(!trimmed) return;
    // Adiciona o atributo com importância inicial 5
    setAttrWithImportance([...attrWithImportance, { name: trimmed, importance: 5 }]);
    setAttrInput('');
  };
  const removeAttr = (index) => setAttrWithImportance(attrWithImportance.filter((_,i)=>i!==index));
  const clearAttrs = () => setAttrWithImportance([]);

  const handleImportanceChange = (index, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 10) num = 10;

    const newAttrs = [...attrWithImportance];
    newAttrs[index].importance = num;
    setAttrWithImportance(newAttrs);
  };

  // --- Lógica de Análise (Mantida)
  const simulateAnalysis = (urlsList, attrsList) => {
    const attrNames = attrsList.map(a => a.name);

    return urlsList.map(url => ({
      url,
      checks: attrsList.map(attr => ({ 
        attr: attr.name, 
        importance: attr.importance, 
        ok: attr.name.length > 0 && url.toLowerCase().includes(attr.name.toLowerCase()) 
      }))
    }));
  };

  const handleGenerate = () => {
    setBusy(true);
    setAnalyzingText(t.analyzing);

    setTimeout(() => {
      const res = simulateAnalysis(
        urlList.length ? urlList : [t.noUrls],
        attrWithImportance.length ? attrWithImportance : [{ name: t.noAttrs, importance: 0 }]
      );
      setResults(res);
      setAnalyzingText(t.finished);
      setBusy(false);
      setTimeout(() => setAnalyzingText(''), 2500);
    }, 1800);
  };

  // Funções de utilidade
  const escapeHtml = (text) => {
    return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  };
  const truncateUrl = (url, maxLength = 60) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
  };

  return (
    <div className="app-root">
      <header className="nav">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="logo-pill">
              <span className="logo-text">Altus</span>
            </div>
            
          </div>
          {/* MUDANÇA DE LAYOUT AQUI: Nav-center se move para a esquerda (flex-start) */}
          <div className="nav-center nav-center-adjusted">
            <div className="app-title">{t.title}</div>
            
          </div>
          <div className="nav-right">
            {/* Botão de Instruções */}
            <button className="btn small instructions-btn" onClick={() => setShowInstructions(true)}>
              <span className="info-icon">ⓘ</span> {t.instructions}
            </button>
            {/* TOGGLE DE IDIOMA - CLASSE FIXA */}
            <button className="lang-toggle fixed-size-toggle" onClick={toggleLang}>
              <span className={`toggle-track ${lang==='en'?'on':''}`}>
                <span className="toggle-thumb"></span>
              </span>
              <span className="lang-label">{t.langLabel}</span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme==='dark'?'🌙':'☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <section className="card left-card">
          <div className="left-inner">
            <div className="top-row">
              <input className="input-field" placeholder={t.apiKey} disabled={busy} />
              <div className="import-export">
                <button className="btn small import" disabled={busy}>{t.import}</button>
                <button className="btn small export" disabled={busy}>{t.export}</button>
              </div>
            </div>

            {/* SEÇÃO URLS */}
            <div className="section">
              <label className="label">{t.urlsLabel}</label>
              <div className="input-row">
                <input className="input-field" value={urlInput} onChange={e=>setUrlInput(e.target.value)} disabled={busy} placeholder="Ex: https://produto-altus.com"/>
                <button className="btn small primary-btn" onClick={addUrl} disabled={busy}>+</button>
              </div>
              <div className="muted">{urlList.length} {t.urlsCount}</div>
              <ul className="list-items">
                {urlList.map((u,i)=>(
                  <li className="list-item" key={i}>
                    <span title={u} className="url-name">{escapeHtml(truncateUrl(u))}</span>
                    <button className="btn small remove-btn" onClick={()=>removeUrl(i)} disabled={busy}>✖</button>
                  </li>
                ))}
              </ul>
              <div className="section-controls">
                <button className="btn small clear" onClick={clearUrls} disabled={busy}>{t.clearUrls}</button>
              </div>
            </div>

            {/* SEÇÃO ATRIBUTOS COM IMPORTÂNCIA */}
            <div className="section">
              <label className="label">{t.attrsLabel}</label>
              <div className="input-row">
                <input className="input-field" value={attrInput} onChange={e=>setAttrInput(e.target.value)} disabled={busy} placeholder="Ex: 'Especificação técnica' ou 'Preço'"/>
                <button className="btn small primary-btn" onClick={addAttr} disabled={busy}>+</button>
              </div>
              <div className="muted">{attrWithImportance.length} {t.attrsCount}</div>
              <ul className="list-items">
                {attrWithImportance.map((a,i)=>(
                  <li className="list-item attr-item" key={i}>
                    <span className="attr-name">{escapeHtml(a.name)}</span>
                    <div className="importance-control-v2">
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={a.importance} 
                        onChange={e => handleImportanceChange(i, e.target.value)} 
                        className="importance-number-input"
                        disabled={busy}
                        readOnly // <<<<< NOVO: Impede a digitação, mantendo as setas
                      />
                    </div>
                    <button className="btn small remove-btn" onClick={()=>removeAttr(i)} disabled={busy}>✖</button>
                  </li>
                ))}
              </ul>
              <div className="section-controls">
                <button className="btn small clear" onClick={clearAttrs} disabled={busy}>{t.clearAttrs}</button>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <button className="btn generate" onClick={handleGenerate} disabled={busy || urlList.length === 0 || attrWithImportance.length === 0}>
              {busy ? (lang==='pt'?'Gerando...':'Generating...') : t.generate}
            </button>
          </div>
        </section>

        {/* CARD DIREITO: RESULTADOS */}
        <aside className="card right-card">
          <h2 className="results-title">{t.results}</h2>
          <div className="results-body">
            {busy && <div className="spinner"></div>}
            {!busy && results.length > 0 && (
              <div className="results-content">
                {results.map((r,i)=>(
                  <div className="result-item" key={i}>
                    <div className="result-url" title={r.url}>{escapeHtml(truncateUrl(r.url))}</div>
                    <ul className="result-list">
                      {r.checks.map((c,j)=>(
                        <li key={j} className={c.ok ? 'result-ok' : 'result-nok'}>
                          <span className="check-status">{c.ok ? '✔' : '✖'}</span>
                          <strong>{escapeHtml(c.attr)}</strong>
                          <span className="importance-res">(Imp: {c.importance})</span>
                        </li>
                      ))}
                  </ul>
                  </div>
                ))}
              </div>
            )}
            {!busy && results.length === 0 && (
<p className="no-data">{t.noResultsYet}</p> /* CORRIGIDO: Usa t.noResultsYet */            )}
          </div>
          <p className="results-sub">{analyzingText}</p>
        </aside>
      </main>

      {/* RENDERIZA O MODAL (CORRIGIDO: Passa 't' para o modal) */}
      <InstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
        content={t.instructionsContent}
        t={t}
      />
    </div>
  );
}

export default App;