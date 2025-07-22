// ==UserScript==
// @name         A8 BOTÃO FILA SZ - Luiz Toledo (Storage Sync)
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Botões no chat para "Entrar", "Passar a vez" e "Sair" na fila usando localStorage para comunicação.
// @author       Luiz Toledo
// @match        https://ggnet.sz.chat/user/agent*
// @match        https://clusterscpr.sz.chat/user/agent*
// @match        https://toolsvgl.gegnet.com.br/fila*
// @match        https://*.sz.com.br/fila*
// @updateURL    https://raw.githubusercontent.com/devluiztoledo/atalho-fila-sz/main/atalho-fila-sz.user.js
// @downloadURL  https://raw.githubusercontent.com/devluiztoledo/atalho-fila-sz/main/atalho-fila-sz.user.js
// @icon         https://raw.githubusercontent.com/devluiztoledo/atalho-fila-sz/main/icon.png
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  const host = location.host;
  const keys = {
    entrar: 'LOCAL_ENTRAR_FILA',
    passar: 'LOCAL_PASSAR_VEZ',
    sair:   'LOCAL_SAIR_FILA'
  };

  if (host.endsWith('sz.chat')) {
    // CHAT: criar botões que gravam no localStorage
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;display:flex;flex-direction:column;gap:4px;';
    ['Entrar na fila','Passar a vez','Sair da fila'].forEach((label, i) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.cssText = 'padding:6px 12px;cursor:pointer;';
      btn.addEventListener('click', () => {
        const key = Object.values(keys)[i];
        localStorage.setItem(key, Date.now());
      });
      container.append(btn);
    });
    document.body.append(container);
  } else {
    // FILA: escutar storage events e clicar no botão correspondente
    window.addEventListener('storage', (ev) => {
      if (!ev.key || !ev.newValue) return;
      let selector = '', action = '';
      switch(ev.key) {
        case keys.entrar:
          selector = 'button#entrarFila'; action = 'Entrar na fila'; break;
        case keys.passar:
          selector = 'button#passarVez'; action = 'Passar a vez'; break;
        case keys.sair:
          selector = 'button#sairFila'; action = 'Sair da fila'; break;
        default:
          return;
      }
      // pequeno delay para evitar interferência
      setTimeout(() => {
        const btn = document.querySelector(selector);
        if (btn && !btn.disabled) {
          btn.click();
        }
        // limpar a chave para futuros sinais
        localStorage.removeItem(ev.key);
      }, 100);
    });
  }
})();
