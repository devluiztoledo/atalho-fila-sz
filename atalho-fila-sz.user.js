// ==UserScript==
// @name         A8 BOTÃO FILA SZ - Luiz Toledo
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Cria um botão que interage com a fila SZ
// @author       Luiz Toledo
// @match        https://ggnet.sz.chat/user/agent*
// @match        http*://toolsvgl.gegnet.com.br/fila*
// @updateURL    https://raw.githubusercontent.com/devluiztoledo/atalho-fila-sz/main/atalho-fila-sz.user.js
// @downloadURL  https://raw.githubusercontent.com/devluiztoledo/atalho-fila-sz/main/atalho-fila-sz.user.js
// @icon         https://raw.githubusercontent.com/devluiztoledo/atalho-fila-sz/main/icon.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const host = location.host;


  if (host === 'ggnet.sz.chat') {
    if (document.querySelector('#btn-passar-vez-sz')) return;

    const observer = new MutationObserver(() => {
      const agentDiv = document.querySelector('.agentAcorrdion');

      if (agentDiv && !document.querySelector('#btn-passar-vez-sz')) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '10';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-end';
        container.style.gap = '4px';

        const btnWidth = '100px';

        function makeBtn(id, text, bg, signalKey) {
          const btn = document.createElement('button');
          btn.id = id;
          btn.textContent = text;
          btn.style.padding = '4px 0';
          btn.style.width = btnWidth;
          btn.style.fontSize = '12px';
          btn.style.lineHeight = '1.2';
          btn.style.background = bg;
          btn.style.color = '#fff';
          btn.style.border = 'none';
          btn.style.borderRadius = '3px';
          btn.style.cursor = 'pointer';
          btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';

          let blinkInterval;
          if (signalKey === 'sinalPassarVez') {

            GM_addValueChangeListener(signalKey, (_k, _o, _n, remote) => {
              if (remote && !blinkInterval) {
                let visible = true;
                blinkInterval = setInterval(() => {
                  btn.style.visibility = visible ? 'hidden' : 'visible';
                  visible = !visible;
                }, 500);
              }
            });


            btn.addEventListener('click', () => {
              clearInterval(blinkInterval);
              btn.style.visibility = 'visible';
            });
          }

          btn.addEventListener('click', () => {
            GM_setValue(signalKey, Date.now());
            console.log(`🟢 sinal enviado: ${signalKey}`);
          });

          return btn;
        }

        container.appendChild(makeBtn('btn-passar-vez-sz', 'Passar a vez', '#ffc107', 'sinalPassarVez'));
        container.appendChild(makeBtn('btn-entrar-fila-sz', 'Entrar na fila', '#007bff', 'sinalEntrarFila'));
        container.appendChild(makeBtn('btn-sair-fila-sz', 'Sair da fila', '#dc3545', 'sinalSairFila'));

        agentDiv.style.position = 'relative';
        agentDiv.appendChild(container);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return;
  }


  function waitAndClick(selector, description) {
    const interval = setInterval(() => {
      const btn = document.querySelector(selector);
      if (btn && !btn.disabled) {
        btn.click();
        console.log(`▶️ ${description} clicado.`);
        clearInterval(interval);
      }
    }, 1000);
  }

  function clickNow(selector, description) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.click();
      console.log(`▶️ ${description} clicado.`);
    } else {
      console.warn(`⚠️ ${description} não encontrado (${selector}).`);
    }
  }

  if (GM_getValue('sinalEntrarFila', 0))
    waitAndClick('#entrarFila', 'Entrar na fila');
  if (GM_getValue('sinalSairFila', 0))
    clickNow('#sairFila', 'Sair da fila');
  if (GM_getValue('sinalPassarVez', 0))
    waitAndClick('#passarVez', 'Passar a vez');

  GM_addValueChangeListener('sinalEntrarFila', (_k, _o, _n, remote) => {
    if (remote) waitAndClick('#entrarFila', 'Entrar na fila');
  });
  GM_addValueChangeListener('sinalSairFila', (_k, _o, _n, remote) => {
    if (remote) clickNow('#sairFila', 'Sair da fila');
  });
  GM_addValueChangeListener('sinalPassarVez', (_k, _o, _n, remote) => {
    if (remote) waitAndClick('#passarVez', 'Passar a vez');
  });
})();
