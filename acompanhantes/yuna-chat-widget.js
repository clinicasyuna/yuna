(function () {
  // ============================================================
  // ⚠️  SUBSTITUA PELA SUA CHAVE DA API ANTHROPIC
  // Obtenha em: https://console.anthropic.com/
  // ============================================================
  var ANTHROPIC_API_KEY = 'SUA_CHAVE_AQUI';
  var HAS_ANTHROPIC_KEY = !!ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'SUA_CHAVE_AQUI';
  // ============================================================

  if (document.getElementById("yuna-chat-window")) {
    return;
  }

  const root = document.createElement("div");
  root.id = "yuna-chat-root";
  root.innerHTML = "\n    <button id=\"yuna-fab\" aria-label=\"Abrir assistente Yuna\">\n      <svg id=\"yuna-fab-icon\" width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" fill=\"none\">\n        <path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\" stroke=\"#fff\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path>\n      </svg>\n      <svg id=\"yuna-fab-close\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" style=\"display:none\">\n        <path d=\"M18 6L6 18M6 6l12 12\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\"></path>\n      </svg>\n    </button>\n    <span id=\"yuna-badge\">1</span>\n    <div id=\"yuna-chat-window\">\n      <div class=\"yuna-chat-header\">\n        <div class=\"yuna-avatar\">\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\">\n            <circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"rgba(255,255,255,0.25)\"></circle>\n            <path d=\"M8 13.5C8.5 15 10 16 12 16s3.5-1 4-2.5\" stroke=\"#fff\" stroke-width=\"1.6\" stroke-linecap=\"round\"></path>\n            <circle cx=\"9.5\" cy=\"10.5\" r=\"1\" fill=\"#fff\"></circle>\n            <circle cx=\"14.5\" cy=\"10.5\" r=\"1\" fill=\"#fff\"></circle>\n          </svg>\n        </div>\n        <div class=\"yuna-header-text\">\n          <div class=\"yuna-title\">Yuna Assistente</div>\n          <div class=\"yuna-status\"><span class=\"yuna-dot\"></span>Online agora</div>\n        </div>\n        <button id=\"yuna-close\" type=\"button\">x</button>\n      </div>\n      <div id=\"yuna-msgs\"></div>\n      <div id=\"yuna-quick\">\n        <button type=\"button\" data-quick=\"Qual o status da minha solicitacao?\">Minhas solicitacoes</button>\n        <button type=\"button\" data-quick=\"Preciso de itens de conforto ou amenidades\">Hotelaria</button>\n        <button type=\"button\" data-quick=\"Preciso de ajuda com o quarto\">Ajuda com o quarto</button>\n        <button type=\"button\" data-quick=\"Quero falar com a equipe\">Falar com equipe</button>\n      </div>\n      <div class=\"yuna-input-wrap\">\n        <textarea id=\"yuna-input\" placeholder=\"Digite sua mensagem...\" rows=\"1\"></textarea>\n        <button id=\"yuna-send-btn\" type=\"button\" aria-label=\"Enviar mensagem\">\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"#fff\">\n            <path d=\"M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z\"></path>\n          </svg>\n        </button>\n      </div>\n    </div>\n  ";

  document.body.appendChild(root);

  const style = document.createElement("style");
  style.textContent = "\n    #yuna-fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: #0f6e56; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 9998; box-shadow: 0 2px 8px rgba(0,0,0,0.18); transition: background .2s, transform .15s; }\n    #yuna-fab:hover { background: #085041; transform: scale(1.05); }\n    #yuna-badge { position: fixed; bottom: 68px; right: 22px; background: #e53e3e; color: #fff; font-size: 11px; font-weight: 600; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 9999; border: 2px solid #fff; }\n    #yuna-chat-window { position: fixed; bottom: 92px; right: 24px; width: 360px; max-width: calc(100vw - 24px); max-height: 580px; background: #fff; border-radius: 20px; border: 1px solid rgba(0,0,0,.1); box-shadow: 0 8px 32px rgba(0,0,0,.14); display: none; flex-direction: column; z-index: 9997; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }\n    .yuna-chat-header { background: #0f6e56; padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }\n    .yuna-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n    .yuna-header-text { flex: 1; }\n    .yuna-title { color: #fff; font-size: 13px; font-weight: 600; }\n    .yuna-status { color: rgba(255,255,255,.8); font-size: 11px; display: flex; align-items: center; gap: 4px; }\n    .yuna-dot { width: 6px; height: 6px; border-radius: 50%; background: #86efac; display: inline-block; }\n    #yuna-close { background: none; border: none; color: rgba(255,255,255,.7); font-size: 18px; cursor: pointer; padding: 4px; line-height: 1; }\n    #yuna-msgs { flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 10px; background: #f8f9fa; min-height: 300px; max-height: 380px; }\n    #yuna-quick { padding: 8px 10px 4px; background: #f8f9fa; border-top: 1px solid rgba(0,0,0,.06); display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0; }\n    #yuna-quick button { font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid #d1d5db; background: #fff; color: #374151; cursor: pointer; white-space: nowrap; }\n    .yuna-input-wrap { display: flex; align-items: center; gap: 8px; padding: 10px 12px 14px; background: #fff; border-top: 1px solid rgba(0,0,0,.08); flex-shrink: 0; }\n    #yuna-input { flex: 1; font-size: 13px; padding: 8px 12px; border-radius: 20px; border: 1px solid #d1d5db; background: #f9fafb; color: #111; outline: none; resize: none; height: 36px; font-family: inherit; line-height: 1.4; }\n    #yuna-send-btn { width: 36px; height: 36px; border-radius: 50%; background: #0f6e56; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .2s; }\n    #yuna-send-btn:disabled { opacity: .5; cursor: not-allowed; }\n    .yuna-msg-wrap { display: flex; flex-direction: column; max-width: 85%; }\n    .yuna-msg-wrap.bot { align-self: flex-start; }\n    .yuna-msg-wrap.user { align-self: flex-end; }\n    .yuna-bubble.bot { padding: 9px 12px; border-radius: 16px 16px 16px 4px; font-size: 13px; line-height: 1.55; background: #fff; border: 1px solid rgba(0,0,0,.09); color: #111; }\n    .yuna-bubble.user { padding: 9px 12px; border-radius: 16px 16px 4px 16px; font-size: 13px; line-height: 1.55; background: #0f6e56; color: #fff; }\n    .yuna-time { font-size: 10px; color: #9ca3af; margin-top: 3px; padding: 0 2px; }\n    .yuna-time.user { text-align: right; }\n    .yuna-typing { align-self: flex-start; }\n    .yuna-typing-inner { padding: 10px 14px; background: #fff; border: 1px solid rgba(0,0,0,.09); border-radius: 16px 16px 16px 4px; display: flex; gap: 5px; align-items: center; }\n    .yuna-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #9ca3af; animation: yunaBlink 1.2s infinite; display: inline-block; }\n    .yuna-typing-dot:nth-child(2) { animation-delay: .2s; }\n    .yuna-typing-dot:nth-child(3) { animation-delay: .4s; }\n    @keyframes yunaBlink { 0%,80%,100% { opacity: .2; } 40% { opacity: 1; } }\n    @media (max-width: 600px) {\n      #yuna-chat-window { right: 12px; bottom: 86px; width: calc(100vw - 24px); }\n      #yuna-fab { right: 12px; }\n      #yuna-badge { right: 10px; }\n    }\n  ";
  document.head.appendChild(style);

  const fab = document.getElementById("yuna-fab");
  const chatWindow = document.getElementById("yuna-chat-window");
  const badge = document.getElementById("yuna-badge");
  const iconChat = document.getElementById("yuna-fab-icon");
  const iconClose = document.getElementById("yuna-fab-close");
  const closeBtn = document.getElementById("yuna-close");
  const msgs = document.getElementById("yuna-msgs");
  const input = document.getElementById("yuna-input");
  const sendBtn = document.getElementById("yuna-send-btn");
  const quickWrap = document.getElementById("yuna-quick");

  let isOpen = false;
  let sending = false;
  const history = [];

  function now() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function getUserContext() {
    try {
      // Lê do contexto global exposto pelo portal após login
      if (window.yunaUserContext) return window.yunaUserContext;
      return { nome: "Acompanhante", quarto: "---", email: "" };
    } catch (error) {
      return { nome: "Acompanhante", quarto: "---", email: "" };
    }
  }

  function getSystemPrompt() {
    const u = getUserContext();
    const firstName = u.nome.split(" ")[0] || "Acompanhante";
    return "Você é a Yuna Assistente, um chatbot de suporte humanizado para acompanhantes e familiares de pacientes internados nas Clínicas Yuna.\n\nDados do acompanhante logado:\n- Nome: " + u.nome + "\n- Quarto/Leito: " + u.quarto + "\n\nSuas responsabilidades:\n- Responder dúvidas sobre o funcionamento do hospital e do portal Yuna Solicite\n- Ajudar o acompanhante a entender como abrir uma solicitação (Manutenção, Higienização, Hotelaria)\n- Explicar o status das solicitações quando perguntado\n- Orientar sobre horários de visita, regras gerais e serviços disponíveis\n- Acolher acompanhantes que estejam ansiosos ou com dúvidas\n\nRegras importantes:\n- Responda SEMPRE em português do Brasil, de forma calorosa e empática\n- Seja conciso: respostas curtas, parágrafos de no máximo 2-3 frases\n- Para urgências médicas: encaminhe IMEDIATAMENTE para a enfermagem (ramal 190)\n- Nunca dê diagnósticos ou opiniões médicas\n- Para abrir solicitações, oriente o acompanhante a usar os cards na tela principal do portal\n- Se não souber algo específico do hospital, diga que vai verificar com a equipe\n- Trate o acompanhante pelo primeiro nome sempre que possível";
  }

  function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "yuna-msg-wrap " + (role === "bot" ? "bot" : "user");

    const bubble = document.createElement("div");
    bubble.className = "yuna-bubble " + (role === "bot" ? "bot" : "user");
    bubble.textContent = text;

    const time = document.createElement("div");
    time.className = "yuna-time " + (role === "bot" ? "bot" : "user");
    time.textContent = now();

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const typing = document.createElement("div");
    typing.id = "yuna-typing";
    typing.className = "yuna-typing";
    typing.innerHTML = "<div class=\"yuna-typing-inner\"><span class=\"yuna-typing-dot\"></span><span class=\"yuna-typing-dot\"></span><span class=\"yuna-typing-dot\"></span></div>";
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("yuna-typing");
    if (el) {
      el.remove();
    }
  }

  function getLocalReply(message) {
    const msg = (message || "").toLowerCase();

    if (msg.includes("status") || msg.includes("solicit")) {
      return "Para verificar o status, abra a secao Historico no portal. La voce ve se a solicitacao esta pendente, em andamento ou finalizada.";
    }

    if (msg.includes("aliment") || msg.includes("nutri") || msg.includes("refe")) {
      return "Para necessidades alimentares ou dieteticas, informe a equipe de enfermagem diretamente. O portal oferece solicitacoes de Hotelaria, Higienizacao e Manutencao.";
    }

    if (msg.includes("quarto") || msg.includes("hotel") || msg.includes("higien")) {
      return "Para demandas do quarto, abra uma solicitacao em Hotelaria, Higienizacao ou Manutencao. Informe o quarto e uma descricao objetiva.";
    }

    if (msg.includes("urg") || msg.includes("dor") || msg.includes("mal") || msg.includes("emerg")) {
      return "Em caso de urgencia medica, chame imediatamente a equipe de enfermagem pelo ramal 190.";
    }

    return "Posso ajudar com status de solicitacoes, abertura de pedidos e orientacoes gerais do portal. Se quiser, descreva sua duvida em uma frase.";
  }

  async function sendToServer(message) {
    // Tenta usar a Netlify Function (seguro — chave fica no servidor)
    const u = getUserContext();
    const historyWithoutLast = history.slice(0, -1); // Remove a mensagem atual (função a adiciona)

    try {
      const response = await fetch("/.netlify/functions/yuna-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          history: historyWithoutLast,
          userContext: {
            firstName: u.nome.split(" ")[0],
            room: u.quarto
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.reply || "Desculpe, não consegui processar. Tente novamente.";
        history.push({ role: "assistant", content: reply });
        return reply;
      }

      // Se a Function retornar 500 (sem chave configurada), usa fallback local
      if (response.status === 500) {
        return getLocalReply(message);
      }

      throw new Error("chat-request-failed-" + response.status);
    } catch (fetchError) {
      // Rede indisponível ou Function não deployada → fallback local
      if (HAS_ANTHROPIC_KEY) {
        // Tentativa direta (apenas se chave estiver configurada no widget)
        const resp2 = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 600,
            system: getSystemPrompt(),
            messages: history
          })
        });
        if (!resp2.ok) throw new Error("chat-request-failed");
        const data2 = await resp2.json();
        const reply2 = (data2.content || []).map(function(b) { return b.text || ""; }).join("") || "Desculpe, não consegui processar.";
        history.push({ role: "assistant", content: reply2 });
        return reply2;
      }
      return getLocalReply(message);
    }
  }

  function setOpen(value) {
    isOpen = value;
    chatWindow.style.display = isOpen ? "flex" : "none";
    badge.style.display = "none";
    iconChat.style.display = isOpen ? "none" : "block";
    iconClose.style.display = isOpen ? "block" : "none";

    if (isOpen && history.length === 0) {
      const user = getUserContext();
      addMessage("bot", "Olá, " + user.nome.split(" ")[0] + "! Como posso ajudar você hoje?");
      setTimeout(function () { input.focus(); }, 200);
    }
  }

  async function sendMessage(text) {
    const message = (text || input.value || "").trim();
    if (!message || sending) {
      return;
    }

    input.value = "";
    input.style.height = "36px";
    sending = true;
    sendBtn.disabled = true;
    quickWrap.style.display = "none";

    addMessage("user", message);
    history.push({ role: "user", content: message });
    addTyping();

    try {
      const reply = await sendToServer(message);
      removeTyping();
      addMessage("bot", reply);

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
    } catch (error) {
      removeTyping();
      addMessage("bot", "No momento estou com instabilidade de conexao. Tente novamente em instantes.");
    } finally {
      sending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  fab.addEventListener("click", function () { setOpen(!isOpen); });
  closeBtn.addEventListener("click", function () { setOpen(false); });
  sendBtn.addEventListener("click", function () { sendMessage(); });

  quickWrap.addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-quick]");
    if (!btn) {
      return;
    }
    sendMessage(btn.getAttribute("data-quick") || "");
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener("input", function () {
    input.style.height = "36px";
    input.style.height = Math.min(input.scrollHeight, 80) + "px";
  });
})();
