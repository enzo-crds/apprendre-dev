// site.js — comportements partagés sur toutes les pages

document.addEventListener('DOMContentLoaded', () => {
  // Toggle sidebar mobile
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (toggle && sidebar && backdrop) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('open');
    });
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    });
  }

  // Marque le lien actif dans la sidebar selon l'URL courante
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });

  // Bacs a sable HTML : mise a jour live de l'iframe
  document.querySelectorAll('[data-sandbox="html"]').forEach(box => {
    const textarea = box.querySelector('textarea');
    const iframe = box.querySelector('iframe');
    const run = () => { iframe.srcdoc = textarea.value; };
    run();
    textarea.addEventListener('input', run);
    const resetBtn = box.querySelector('[data-action="reset"]');
    if (resetBtn) {
      const original = textarea.value;
      resetBtn.addEventListener('click', () => { textarea.value = original; run(); });
    }
  });

  // Bacs a sable CSS : css injecte dans un mini document avec du HTML fixe
  document.querySelectorAll('[data-sandbox="css"]').forEach(box => {
    const textarea = box.querySelector('textarea');
    const iframe = box.querySelector('iframe');
    const baseHTML = box.dataset.previewHtml || '<p>Texte de demonstration</p>';
    const run = () => {
      iframe.srcdoc = `<!doctype html><html><head><style>
        body{font-family:sans-serif;padding:20px;margin:0;background:#fff;color:#111}
        ${textarea.value}
      </style></head><body>${baseHTML}</body></html>`;
    };
    run();
    textarea.addEventListener('input', run);
    const resetBtn = box.querySelector('[data-action="reset"]');
    if (resetBtn) {
      const original = textarea.value;
      resetBtn.addEventListener('click', () => { textarea.value = original; run(); });
    }
  });

  // Bacs a sable JS : execution dans une iframe isolee, capture console.log
  document.querySelectorAll('[data-sandbox="js"]').forEach(box => {
    const textarea = box.querySelector('textarea');
    const output = box.querySelector('.js-output');
    const runBtn = box.querySelector('[data-action="run"]');
    const resetBtn = box.querySelector('[data-action="reset"]');
    const original = textarea.value;

    const run = () => {
      const logs = [];
      const fakeConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('Erreur : ' + args.join(' ')),
        warn: (...args) => logs.push('Attention : ' + args.join(' ')),
      };
      try {
        const fn = new Function('console', textarea.value);
        fn(fakeConsole);
        output.textContent = logs.length ? logs.join('\n') : '(aucune sortie console.log)';
      } catch (e) {
        output.textContent = 'Erreur : ' + e.message;
      }
    };

    if (runBtn) runBtn.addEventListener('click', run);
    if (resetBtn) resetBtn.addEventListener('click', () => { textarea.value = original; output.textContent = ''; });
    run();
  });

  // Bacs a sable Python : execution via Pyodide (charge a la demande)
  document.querySelectorAll('[data-sandbox="python"]').forEach(box => {
    const textarea = box.querySelector('textarea');
    const output = box.querySelector('.py-output');
    const runBtn = box.querySelector('[data-action="run"]');
    const resetBtn = box.querySelector('[data-action="reset"]');
    const original = textarea.value;

    runBtn.addEventListener('click', async () => {
      output.textContent = 'Chargement de Python (Pyodide)...';
      try {
        if (!window.pyodideInstance) {
          if (!window.loadPyodide) {
            await new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });
          }
          window.pyodideInstance = await window.loadPyodide();
        }
        const pyodide = window.pyodideInstance;
        let captured = '';
        pyodide.setStdout({ batched: (s) => { captured += s + '\n'; } });
        pyodide.setStderr({ batched: (s) => { captured += s + '\n'; } });
        await pyodide.runPythonAsync(textarea.value);
        output.textContent = captured || '(aucune sortie)';
      } catch (e) {
        output.textContent = 'Erreur : ' + e.message;
      }
    });

    if (resetBtn) resetBtn.addEventListener('click', () => { textarea.value = original; output.textContent = ''; });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  // 1. Appliquer le thème sauvegardé au chargement
  const savedTheme = localStorage.getItem('site-theme');
  if (savedTheme === 'light') {
    htmlEl.classList.add('theme-light');
  }

  // 2. Basculer le thème au clic
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      htmlEl.classList.toggle('theme-light');
      
      // 3. Sauvegarder le choix
      if (htmlEl.classList.contains('theme-light')) {
        localStorage.setItem('site-theme', 'light');
      } else {
        localStorage.setItem('site-theme', 'dark');
      }
    });
  }
});