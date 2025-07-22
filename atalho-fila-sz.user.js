// ==UserScript==
// @name         A8 BOTÃO FILA SZ - Luiz Toledo
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Cria botões "Entrar na fila", "Passar a vez" e "Sair da fila" no chat SZ, sincronizando com a página da fila.
// @author       Luiz Toledo
// @match        https://ggnet.sz.chat/user/agent*
// @match        https://clusterscpr.sz.chat/user/agent*
// @match        https://*.sz.com.br/fila*
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

  const signalKeys = {
    entrar: 'sinalEntrarFila',
    passar: 'sinalPassarVez',
    sair:   'sinalSairFila'
  };
  const host = location.host;

  // ===== CHAT: injeta botões =====
  if (host.endsWith('sz.chat')) {
    // evita múltipla injeção
    if (document.querySelector('#btn-entrar-sz')) return;

    const observer = new MutationObserver((mutations, obs) => {
      const agentDiv = document.querySelector('.agentAcorrdion');
      if (!agentDiv) return;

      // container absoluto alinhado à direita
      const container = document.createElement('div');
      container.style.cssText = [
        'position: absolute',
        'top: 10px',
        'right: 10px',
        'z-index: 9999',
        'display: flex',
        'flex-direction: column',
        'gap: 4px'
      ].join(';');

      const btnWidth = '120px';
      function makeBtn(id, label, iconClass, bgClass, signalKey) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.innerHTML = `<i class="${iconClass}"></i> ${label}`;
        btn.className = `btn shadow ${bgClass}`;
        btn.style.width = btnWidth;
        btn.addEventListener('click', () => GM_setValue(signalKey, Date.now()));

        // piscar se for passar vez
        if (signalKey === signalKeys.passar) {
          let blink;
          GM_addValueChangeListener(signalKey, (_k, _old, _new, remote) => {
            if (remote) {
              blink = setInterval(() => {
                btn.style.visibility = btn.style.visibility === 'hidden' ? 'visible' : 'hidden';
              }, 500);
            }
          });
          btn.addEventListener('click', () => {
            clearInterval(blink);
            btn.style.visibility = 'visible';
          });
        }

        return btn;
      }

      container.append(
        makeBtn('btn-passsz', 'Passar a vez', 'bi bi-arrow-right', 'btn-outline-warning', signalKeys.passar),
        makeBtn('btn-entrsz', 'Entrar na fila', 'bi bi-person-plus', 'btn-outline-primary', signalKeys.entrar),
        makeBtn('btn-sairsz', 'Sair da fila', 'bi bi-box-arrow-left', 'btn-outline-danger', signalKeys.sair)
      );

      agentDiv.style.position = 'relative';
      agentDiv.append(container);
      obs.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return;
  }

  // ===== FILA: processa sinais =====
  function waitClick(selector) {
    const interval = setInterval(() => {
      const btn = document.querySelector(selector);
      if (btn && !btn.disabled) {
        btn.click();
        clearInterval(interval);
      }
    }, 500);
  }

  // entrada
  GM_addValueChangeListener(signalKeys.entrar, (_k, _o, _n, remote) => {
    if (remote) waitClick('#entrarFila');
  });
  // passar vez
  GM_addValueChangeListener(signalKeys.passar, (_k, _o, _n, remote) => {
    if (remote) waitClick('#passarVez');
  });
  // sair
  GM_addValueChangeListener(signalKeys.sair, (_k, _o, _n, remote) => {
    if (remote) waitClick('#sairFila');
  });

})();
