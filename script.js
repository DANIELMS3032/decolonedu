document.addEventListener('DOMContentLoaded', () => {

  // ===================================
  // 1. NAVEGAÇÃO SINGLE-PAGE (SPA)
  // ===================================
  const allPages = document.querySelectorAll('.page-content');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const navButtons = document.querySelectorAll('.nav-button'); // Botões da Home
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const menuOpenIcon = document.getElementById('menu-open-icon');
  const menuCloseIcon = document.getElementById('menu-close-icon');

  function showPage(pageId) {
    // Esconde todas as páginas
    allPages.forEach(page => {
      page.classList.add('hidden');
    });

    // Mostra a página correta
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
      pageToShow.classList.remove('hidden');
      window.scrollTo(0, 0); // Rola para o topo
    }

    // Atualiza links ativos
    allNavLinks.forEach(link => {
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Fecha o menu mobile
    mobileMenu.classList.add('hidden');
    menuOpenIcon.classList.remove('hidden');
    menuCloseIcon.classList.add('hidden');
  }

  // Event Listeners para links de navegação
  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = e.currentTarget.dataset.page;
      showPage(pageId);
    });
  });
  
  // Event Listeners para botões da Home
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = e.currentTarget.dataset.page;
      showPage(pageId);
    });
  });

  // Toggle do Menu Mobile
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuOpenIcon.classList.toggle('hidden');
    menuCloseIcon.classList.toggle('hidden');
  });


  // ===================================
  // 2. SISTEMA DE IDIOMA
  // ===================================
  const langSwitchers = document.querySelectorAll('.lang-switcher');
  let currentLang = 'pt'; // Padrão

  function updateLanguage(lang) {
    currentLang = lang;
    
    // Atualiza botões de idioma
    langSwitchers.forEach(switcher => {
      if (switcher.dataset.lang === lang) {
        switcher.classList.add('active');
      } else {
        switcher.classList.remove('active');
      }
    });

    // Atualiza todos os elementos com data-lang
    const elementsToTranslate = document.querySelectorAll('[data-lang-pt]');
    elementsToTranslate.forEach(el => {
      const text = el.dataset[`lang-${lang}`];
      if (text) {
        el.textContent = text;
      }
    });
  }

  langSwitchers.forEach(switcher => {
    switcher.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      updateLanguage(lang);
    });
  });

  // Define o idioma padrão
  updateLanguage(currentLang);


  // ===================================
  // 3. ANIMAÇÕES DE SCROLL (ROLAGEM)
  // ===================================
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Adiciona um delay baseado no data-index (se existir)
        const delay = (entry.target.dataset.index || 1) * 100; // 100ms de delay por item
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        observer.unobserve(entry.target); // Para de observar após animar
      }
    });
  }, {
    threshold: 0.1 // Ativa quando 10% do elemento está visível
  });

  animatedElements.forEach(el => {
    observer.observe(el);
  });
  

  // ===================================
  // 4. FÁBRICA DE JOGOS (Copiar Prompt)
  // ===================================
  const copyButtons = document.querySelectorAll('.copy-prompt-button');
  const copyNotification = document.getElementById('copy-notification');

  copyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.prompt-card');
      const textToCopy = card.querySelector('.prompt-text').textContent;

      navigator.clipboard.writeText(textToCopy).then(() => {
        // Mostra notificação
        copyNotification.classList.remove('hidden');
        setTimeout(() => {
          copyNotification.classList.add('hidden');
        }, 2000);
      }).catch(err => {
        console.error('Falha ao copiar:', err);
      });
    });
  });
  

  // ===================================
  // 5. REPOSITÓRIO (Busca Acadêmica)
  // ===================================
  const searchInput = document.getElementById('academic-search-input');
  const searchButton = document.getElementById('academic-search-button');

  function performSearch() {
    const query = encodeURIComponent(searchInput.value);
    if (query) {
      // Abre busca em novas abas
      window.open(`https://scholar.google.com/scholar?q=${query}`, '_blank');
      window.open(`https://search.scielo.org/?q=${query}`, '_blank');
    }
  }

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });


  // ===================================
  // 6. CHAT GRIÔ (API do Gemini)
  // ===================================
  const chatBox = document.getElementById('grio-chat-box');
  const chatInput = document.getElementById('grio-chat-input');
  const chatSendButton = document.getElementById('grio-chat-send');
  const loadingIndicator = document.getElementById('grio-loading-indicator');

  // --- ATENÇÃO DANIEL! ---
  // A CHAVE DE API ESTÁ AQUI.
  // Lembre-se que deixar a chave assim no código é um RISCO DE SEGURANÇA.
  // Qualquer pessoa pode ver e usar sua chave.
  // Para a feira, tudo bem, mas para um site público, você precisaria
  // de um "backend" (servidor) para escondê-la.
  const apiKey = "AIzaSyDO26PcEzIe1e50q2IGD_stA2h7dmxV1Zw";
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // O "Cérebro" do seu assistente de IA
  const systemInstruction = {
    parts: [{
      text: "Você é o 'Griô', um assistente de IA prestativo e inteligente. Sua missão é ajudar os usuários respondendo suas perguntas da melhor forma possível, sobre qualquer assunto. Responda em português brasileiro."
    }]
  };
  
  let chatHistory = []; // Armazena o histórico da conversa

  // Função para adicionar mensagem ao chat
  function addMessageToChat(role, text, isError = false) {
    const messageDiv = document.createElement('div');
    const messageType = isError ? 'grio-error' : role;
    messageDiv.classList.add('chat-message', messageType, 'p-4', 'rounded-lg');
    
    // Converte Markdown simples para HTML (para negrito, listas, etc.)
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
      .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Itálico
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-2 mb-1">$1</h2>') // H2
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-2 mb-1">$1</h1>') // H1
      .replace(/^- (.*$)/gm, '<ul class="list-disc list-inside ml-4"><li>$1</li></ul>') // Lista (simplificado)
      .replace(/^1\. (.*$)/gm, '<ol class="list-decimal list-inside ml-4"><li>$1</li></ol>') // Lista (simplificado)
      .replace(/\n/g, '<br>');

    // Limpeza de listas (para agrupar itens)
    html = html.replace(/<\/ul>\s*<ul class="list-disc list-inside ml-4">/g, '');
    html = html.replace(/<\/ol>\s*<ol class="list-decimal list-inside ml-4">/g, '');

    messageDiv.innerHTML = html; // Usar innerHTML para renderizar o HTML
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Rola para o final
  }

  // Função para enviar mensagem para a API
  async function sendMessageToGriô() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    addMessageToChat('user', userMessage);
    chatInput.value = '';
    loadingIndicator.classList.remove('hidden');

    // Limita o histórico para evitar erros de contexto muito longo
    const limitedHistory = chatHistory.slice(-10); // Pega as últimas 10 trocas

    const payload = {
      contents: [
        ...limitedHistory, // Histórico anterior
        { role: "user", parts: [{ text: userMessage }] } // Nova mensagem
      ],
      systemInstruction: systemInstruction,
      generationConfig: {
        maxOutputTokens: 2048, // Pede respostas mais longas
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      loadingIndicator.classList.add('hidden');

      if (result.candidates && result.candidates.length > 0) {
        // Verifica se a resposta foi bloqueada por segurança
        if(result.candidates[0].finishReason === 'SAFETY') {
          addMessageToChat('model', "Sua mensagem foi bloqueada por motivos de segurança. Por favor, reformule sua pergunta.", true);
          return;
        }

        const modelMessage = result.candidates[0].content.parts[0].text;
        addMessageToChat('model', modelMessage);
        
        // Atualiza o histórico
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
        chatHistory.push({ role: "model", parts: [{ text: modelMessage }] });

      } else if (result.promptFeedback && result.promptFeedback.blockReason) {
        // Se o *prompt* do usuário foi bloqueado
        addMessageToChat('model', "Sua mensagem foi bloqueada por motivos de segurança. Por favor, reformule sua pergunta.", true);
      } else {
        throw new Error("Resposta inesperada da API");
      }

    } catch (error) {
      console.error('Erro no Chat Griô:', error);
      loadingIndicator.classList.add('hidden');
      addMessageToChat('model', 'Desculpe, não consegui me conectar. Verifique sua chave de API ou tente novamente mais tarde.', true);
    }
  }

  chatSendButton.addEventListener('click', sendMessageToGriô);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessageToGriô();
    }
  });

});
