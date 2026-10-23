(() => {
  const language = document.documentElement.lang?.slice(0, 2) || "en";
  const copy = {
    en: {
      button: "Ask our travel assistant",
      title: "El Salvador travel assistant",
      intro: "Hello! I can help you find destinations, itineraries, transportation and practical travel information.",
      placeholder: "Ask about your trip…",
      send: "Send",
      close: "Close chat",
      note: "AI answers can make mistakes. Verify important details.",
      unavailable: "I cannot reach the AI service right now. Try the map or travel guides, or contact us on WhatsApp.",
      whatsapp: "Continue on WhatsApp",
      suggestions: ["Plan a 5-day trip", "Best beaches", "How do I travel by bus?"]
    },
    es: {
      button: "Pregunta al asistente",
      title: "Asistente de viaje de El Salvador",
      intro: "¡Hola! Puedo ayudarte con destinos, itinerarios, transporte e información práctica.",
      placeholder: "Pregunta sobre tu viaje…",
      send: "Enviar",
      close: "Cerrar chat",
      note: "La IA puede equivocarse. Verifica la información importante.",
      unavailable: "No puedo conectar con el servicio de IA ahora. Prueba el mapa o las guías, o contáctanos por WhatsApp.",
      whatsapp: "Continuar por WhatsApp",
      suggestions: ["Planifica 5 días", "Mejores playas", "¿Cómo viajar en bus?"]
    },
    fr: {
      button: "Demander à l’assistant",
      title: "Assistant de voyage au Salvador",
      intro: "Bonjour! Je peux vous aider avec les destinations, itinéraires, transports et informations pratiques.",
      placeholder: "Posez une question sur votre voyage…",
      send: "Envoyer",
      close: "Fermer le clavardage",
      note: "L’IA peut se tromper. Vérifiez les informations importantes.",
      unavailable: "Le service d’IA est momentanément inaccessible. Consultez la carte ou les guides, ou contactez-nous sur WhatsApp.",
      whatsapp: "Continuer sur WhatsApp",
      suggestions: ["Planifier 5 jours", "Meilleures plages", "Comment voyager en bus?"]
    }
  }[language] || null;

  const root = document.createElement("div");
  root.className = "travel-chat";
  root.innerHTML = `
    <button class="travel-chat__launcher" type="button" aria-expanded="false" aria-controls="travel-chat-panel">
      <span aria-hidden="true">✦</span><b>${copy.button}</b>
    </button>
    <section id="travel-chat-panel" class="travel-chat__panel" aria-label="${copy.title}" hidden>
      <header><div><span aria-hidden="true">🇸🇻</span><strong>${copy.title}</strong><small>EN · ES · FR</small></div><button type="button" class="travel-chat__close" aria-label="${copy.close}">×</button></header>
      <div class="travel-chat__messages" role="log" aria-live="polite"></div>
      <div class="travel-chat__suggestions"></div>
      <form><label class="sr-only" for="travel-chat-input">${copy.placeholder}</label><input id="travel-chat-input" maxlength="1200" autocomplete="off" placeholder="${copy.placeholder}" required><button class="travel-chat__mic" type="button" aria-pressed="false" hidden>🎤</button><button type="submit">${copy.send}</button><small class="travel-chat__voice-status" role="status" aria-live="polite" style="flex-basis:100%;font-size:11px;color:#52645e" hidden></small></form>
      <footer><span>${copy.note}</span><a href="https://wa.me/50375778211?text=${encodeURIComponent("Hello, I need help planning a trip to El Salvador.")}" target="_blank" rel="noopener">${copy.whatsapp}</a></footer>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector(".travel-chat__launcher");
  const panel = root.querySelector(".travel-chat__panel");
  const close = root.querySelector(".travel-chat__close");
  const messages = root.querySelector(".travel-chat__messages");
  const suggestions = root.querySelector(".travel-chat__suggestions");
  const form = root.querySelector("form");
  const input = root.querySelector("input");


  const mic = root.querySelector(".travel-chat__mic");
  const sendButton = form.querySelector('button[type="submit"]');
  const voiceStatus = root.querySelector(".travel-chat__voice-status");
  form.style.flexWrap = "wrap";
  mic.style.cssText = "min-width:40px;padding:0 8px";
  const voiceCopy = {
    en: {start:"Speak your question",stop:"Stop listening",listening:"Listening…",review:"Review your question, then press Send.",denied:"Microphone access was denied. Allow it in your browser settings or type your question.",error:"Voice input is unavailable. Please try again or type your question.",notice:"Voice recognition uses your browser’s speech service."},
    es: {start:"Dictar tu pregunta",stop:"Dejar de escuchar",listening:"Escuchando…",review:"Revisa tu pregunta y pulsa Enviar.",denied:"No se permitió el micrófono. Actívalo en tu navegador o escribe tu pregunta.",error:"El dictado no está disponible. Inténtalo de nuevo o escribe tu pregunta.",notice:"El dictado utiliza el servicio de voz de tu navegador."},
    fr: {start:"Dicter votre question",stop:"Arrêter l’écoute",listening:"Écoute en cours…",review:"Vérifiez votre question, puis appuyez sur Envoyer.",denied:"L’accès au microphone a été refusé. Autorisez-le dans votre navigateur ou écrivez votre question.",error:"La saisie vocale est indisponible. Réessayez ou écrivez votre question.",notice:"La reconnaissance utilise le service vocal de votre navigateur."}
  }[language] || null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null, listening = false, voiceBase = "";
  function showVoiceStatus(text) { voiceStatus.textContent = text; voiceStatus.hidden = !text; }
  function resetMic() {
    listening = false;
    mic.setAttribute("aria-pressed", "false");
    mic.setAttribute("aria-label", voiceCopy.start);
    mic.title = voiceCopy.start;
    mic.textContent = "🎤";
  }
  function stopVoice() { if (recognition && listening) recognition.abort(); }
  if (SpeechRecognition) {
    mic.hidden = false;
    resetMic();
    mic.addEventListener("click", () => {
      if (input.disabled) return;
      if (listening) { recognition.stop(); return; }
      recognition = new SpeechRecognition();
      recognition.lang = {en:"en-US",es:"es-SV",fr:"fr-CA"}[language] || "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      voiceBase = input.value.trim();
      recognition.onstart = () => {
        listening = true; mic.textContent = "⏹";
        mic.setAttribute("aria-pressed", "true");
        mic.setAttribute("aria-label", voiceCopy.stop);
        showVoiceStatus(voiceCopy.listening + " " + voiceCopy.notice);
      };
      recognition.onresult = event => {
        const transcript = Array.from(event.results).map(result => result[0].transcript).join(" ");
        input.value = [voiceBase, transcript.trim()].filter(Boolean).join(" ").slice(0, 1200);
        showVoiceStatus(voiceCopy.review);
      };
      recognition.onerror = event => {
        showVoiceStatus(["not-allowed","service-not-allowed"].includes(event.error) ? voiceCopy.denied : event.error === "aborted" ? "" : voiceCopy.error);
        resetMic();
      };
      recognition.onend = () => { resetMic(); if (voiceStatus.textContent.startsWith(voiceCopy.listening)) showVoiceStatus(""); };
      try { recognition.start(); } catch { resetMic(); showVoiceStatus(voiceCopy.error); }
    });
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopVoice(); });

  function renderAnswer(item, text) {
    text = String(text).replace(/&#x20;|&#32;|&nbsp;/gi, " ").replace(/&amp;/g, "&").replace(/\\([\[\]()_*])/g, "$1");
    item.replaceChildren();
    const pattern = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*|#[\w-]+)\)|https?:\/\/[^\s<>]+|(^|[\s(])((?:\/(?!\/)[a-zA-Z][\w/?=&%#.-]*|\/#explore|#[\w-]+))|\*\*([^*\n]+)\*\*/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      item.append(document.createTextNode(text.slice(cursor, match.index)));
      if (match[5]) {
        const strong = document.createElement("strong");
        renderAnswer(strong, match[5]);
        item.append(strong);
      } else {
        let href = match[2] || match[4] || match[0];
        const prefix = match[3] || "";
        const trailing = href.match(/[.,;:!?]+$/)?.[0] || "";
        href = href.slice(0, href.length - trailing.length);
        let url;
        try { url = new URL(href, location.origin); } catch { item.append(document.createTextNode(match[0])); cursor = match.index + match[0].length; continue; }
        if (url.protocol === "https:" || url.protocol === "http:") {
          const link = document.createElement("a");
          link.href = url.href;
          link.textContent = match[1] || href;
          link.style.cssText = "color:#087b70;text-decoration:underline;overflow-wrap:anywhere";
          if (url.origin !== location.origin) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          } else {
            link.addEventListener("click", () => toggle(false));
          }
          item.append(document.createTextNode(prefix), link, document.createTextNode(trailing));
        } else item.append(document.createTextNode(match[0]));
      }
      cursor = match.index + match[0].length;
    }
    item.append(document.createTextNode(text.slice(cursor)));
  }

  function addMessage(text, role) {
    const item = document.createElement("div");
    item.className = `travel-chat__message travel-chat__message--${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function toggle(force) {
    const open = force ?? panel.hidden;
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else stopVoice();
  }

  launcher.addEventListener("click", () => toggle());
  close.addEventListener("click", () => toggle(false));
  addMessage(copy.intro, "assistant");

  copy.suggestions.forEach(text => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", () => {
      input.value = text;
      form.requestSubmit();
    });
    suggestions.appendChild(button);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    stopVoice();
    showVoiceStatus("");
    addMessage(question, "user");
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    mic.disabled = true;
    suggestions.hidden = true;
    const pending = addMessage("…", "assistant");

    try {
      const mainText = document.querySelector("main")?.innerText || "";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          language,
          pageTitle: document.title,
          pagePath: location.pathname,
          pageContext: mainText.slice(0, 5000)
        })
      });
      if (!response.ok) throw new Error("Chat unavailable");
      const data = await response.json();
      renderAnswer(pending, data.answer || copy.unavailable);
    } catch {
      pending.textContent = copy.unavailable;
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      mic.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
