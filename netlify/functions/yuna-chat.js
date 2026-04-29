exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API key not configured" })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON payload" })
    };
  }

  const rawMessage = (payload.message || "").toString();
  const message = rawMessage.trim().slice(0, 1200);
  if (!message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Message is required" })
    };
  }

  const userContext = payload.userContext || {};
  const firstName = (userContext.firstName || "Acompanhante").toString().slice(0, 40);
  const room = (userContext.room || "---").toString().slice(0, 20);

  const history = Array.isArray(payload.history) ? payload.history : [];
  const sanitizedHistory = history
    .filter((item) => item && (item.role === "user" || item.role === "assistant"))
    .slice(-12)
    .map((item) => ({
      role: item.role,
      content: (item.content || "").toString().slice(0, 2000)
    }))
    .filter((item) => item.content.trim().length > 0);

  sanitizedHistory.push({ role: "user", content: message });

  const system = [
    "Voce e a Yuna Assistente, chatbot de suporte para acompanhantes.",
    "Responda sempre em portugues do Brasil, com empatia e objetividade.",
    "Nunca forneca diagnostico ou orientacao medica.",
    "Em urgencia medica: orientar contato imediato com enfermagem (ramal 190).",
    "Quando usuario pedir servicos, oriente abrir solicitacao pelos cards do portal.",
    "Use no maximo 3 paragrafos curtos.",
    `Nome do acompanhante: ${firstName}`,
    `Quarto/Leito: ${room}`
  ].join(" ");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
        max_tokens: 500,
        temperature: 0.3,
        system,
        messages: sanitizedHistory
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: "Provider error",
          status: response.status,
          details: errorText.slice(0, 500)
        })
      };
    }

    const data = await response.json();
    const reply = Array.isArray(data.content)
      ? data.content.map((part) => part.text || "").join("").trim()
      : "";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: reply || "Desculpe, nao consegui processar agora. Tente novamente.",
        usage: data.usage || null
      })
    };
  } catch (error) {
    const isTimeout = error && error.name === "AbortError";
    return {
      statusCode: isTimeout ? 504 : 500,
      headers,
      body: JSON.stringify({
        error: isTimeout ? "Request timeout" : "Internal server error"
      })
    };
  }
};
