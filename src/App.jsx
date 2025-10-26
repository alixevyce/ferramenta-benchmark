import { useState, useEffect } from 'react';
import './app.css';

const translations = {
  pt: {
    title: 'Ferramenta de Benchmarking',
    apiKey: 'Chave API',
    import: 'Importar Dados',
    export: 'Exportar Dados',
    urlsLabel: 'URLS dos produtos',
    urlsCount: 'x URLS adicionadas',
    clearUrls: 'Limpar URLS',
    attrsLabel: 'Atributos',
    attrsCount: 'x atributos definidos',
    clearAttrs: 'Limpar atributos',
    generate: 'Gerar Benchmark',
    results: 'Resultados',
    analyzing: 'Analisando URLS e atributos definidos',
    finished: 'Análise concluída ✅',
    noUrls: '(nenhuma URL)',
    noAttrs: '(nenhum atributo)',
    langLabel: 'PT'
  },
  en: {
    title: 'Benchmarking Tool',
    apiKey: 'API Key',
    import: 'Import Data',
    export: 'Export Data',
    urlsLabel: 'Product URLs',
    urlsCount: 'x URLs added',
    clearUrls: 'Clear URLs',
    attrsLabel: 'Attributes',
    attrsCount: 'x attributes defined',
    clearAttrs: 'Clear attributes',
    generate: 'Generate Benchmark',
    results: 'Results',
    analyzing: 'Analyzing URLs and defined attributes',
    finished: 'Analysis completed ✅',
    noUrls: '(no URLs)',
    noAttrs: '(no attributes)',
    langLabel: 'EN'
  }
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'pt');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [urlInput, setUrlInput] = useState('');
  const [urlList, setUrlList] = useState([]);
  const [attrInput, setAttrInput] = useState('');
  const [attrList, setAttrList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [analyzingText, setAnalyzingText] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const isValidUrl = (url) => {
    try { new URL(url); return true; } 
    catch { return false; }
  };

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

  const addAttr = () => {
    const trimmed = attrInput.trim();
    if(!trimmed) return;
    setAttrList([...attrList, trimmed]);
    setAttrInput('');
  };
  const removeAttr = (index) => setAttrList(attrList.filter((_,i)=>i!==index));
  const clearAttrs = () => setAttrList([]);

  const simulateAnalysis = (urlsList, attrsList) => {
    return urlsList.map(url => ({
      url,
      checks: attrsList.map(attr => ({ attr, ok: attr.length > 0 && url.toLowerCase().includes(attr.toLowerCase()) }))
    }));
  };

  const handleGenerate = () => {
    setBusy(true);
    setAnalyzingText(translations[lang].analyzing);

    setTimeout(() => {
      const res = simulateAnalysis(
        urlList.length ? urlList : [translations[lang].noUrls],
        attrList.length ? attrList : [translations[lang].noAttrs]
      );
      setResults(res);
      setAnalyzingText(translations[lang].finished);
      setBusy(false);
      setTimeout(() => setAnalyzingText(''), 2500);
    }, 1800);
  };

  const escapeHtml = (text) => {
    return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  };

  // Função para truncar URLs longas
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
          <div className="nav-center">
            <div className="app-title">{translations[lang].title}</div>
          </div>
          <div className="nav-right">
            <button className="lang-toggle" onClick={toggleLang}>
              <span className={`toggle-track ${lang==='en'?'on':''}`}>
                <span className="toggle-thumb"></span>
              </span>
              <span className="lang-label">{translations[lang].langLabel}</span>
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
              <input className="api-key" placeholder={translations[lang].apiKey} disabled={busy} />
              <div className="import-export">
                <button className="btn small import" disabled={busy}>{translations[lang].import}</button>
                <button className="btn small export" disabled={busy}>{translations[lang].export}</button>
              </div>
            </div>

            <div className="section">
              <label className="label">{translations[lang].urlsLabel}</label>
              <div className="input-row">
                <input className="textarea" value={urlInput} onChange={e=>setUrlInput(e.target.value)} disabled={busy} placeholder="Adicionar URL"/>
                <button className="btn small" onClick={addUrl} disabled={busy}>+</button>
              </div>
              <div className="muted">{urlList.length} {translations[lang].urlsCount}</div>
              <ul>
                {urlList.map((u,i)=>(
                  <li key={i}>
                    <span title={u}>{escapeHtml(truncateUrl(u))}</span>
                    <button className="btn clear small" onClick={()=>removeUrl(i)} disabled={busy}>✖</button>
                  </li>
                ))}
              </ul>
              <div className="section-controls">
                <button className="btn clear small" onClick={clearUrls} disabled={busy}>{translations[lang].clearUrls}</button>
              </div>
            </div>

            <div className="section">
              <label className="label">{translations[lang].attrsLabel}</label>
              <div className="input-row">
                <input className="textarea" value={attrInput} onChange={e=>setAttrInput(e.target.value)} disabled={busy} placeholder="Adicionar atributo"/>
                <button className="btn small" onClick={addAttr} disabled={busy}>+</button>
              </div>
              <div className="muted">{attrList.length} {translations[lang].attrsCount}</div>
              <ul>
                {attrList.map((a,i)=>(
                  <li key={i}>
                    {escapeHtml(a)} <button className="btn clear small" onClick={()=>removeAttr(i)} disabled={busy}>✖</button>
                  </li>
                ))}
              </ul>
              <div className="section-controls">
                <button className="btn clear small" onClick={clearAttrs} disabled={busy}>{translations[lang].clearAttrs}</button>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <button className="btn generate" onClick={handleGenerate} disabled={busy}>
              {busy ? (lang==='pt'?'Gerando...':'Generating...') : translations[lang].generate}
            </button>
          </div>
        </section>

        <aside className="card right-card">
          <h2 className="results-title">{translations[lang].results}</h2>
          <div className="results-body">
            {busy && <div className="spinner"></div>}
            {!busy && results.length > 0 && (
              <div className="results-content">
                {results.map((r,i)=>(
                  <div className="result-item" key={i}>
                    <div className="result-url" title={r.url}>{escapeHtml(truncateUrl(r.url))}</div>
                    <ul className="result-list">
                      {r.checks.map((c,j)=>(
                        <li key={j}>
                          <span className={c.ok ? 'ok' : 'nok'}>{c.ok ? '✔' : '✖'}</span>
                          <strong>{escapeHtml(c.attr)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="results-sub">{analyzingText}</p>
        </aside>
      </main>
    </div>
  );
}

export default App;