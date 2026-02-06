/**
 * CEEL AI Chatbot
 * Handles chatbot functionality for both mobile and desktop
 */

(function() {
    'use strict';
  
    // Configuration
    const PROXY_URL = 'https://neosupport.sqnc-office.workers.dev';
    const QUESTION_ROTATION_INTERVAL = 7000; // 7 seconds
  
    // DOM Elements
    let chatbotModal, chatbotBackdrop, chatbotInput, chatbotSend, chatbotMessages, chatbotRecommendations;
    let supportBar, supportQuestion, supportChatButton;
    let desktopChatbotButton;
    let chatbotToast, chatbotToastClose, chatbotCheckoutButton;
    let chatbotDefaultQuestions;
    let isChatbotOpen = false;
    let isTyping = false;
    let questionRotationInterval = null;
    let currentQuestionIndex = 0;
    let availableDefaultQuestions = [];
    let toastIntervalTimer = null;
    let toastAutoHideTimer = null;
  
    // Product data
    let chatbotProductData = null;
    let ceelProductsJson = null;
  
    // Initialize
    function init() {
      // Load product data
      const productInfoScript = document.getElementById('chatbot-product-info');
      if (productInfoScript) {
        try {
          chatbotProductData = JSON.parse(productInfoScript.textContent);
          console.log('[Chatbot] Product info loaded:', Object.keys(chatbotProductData.products || {}).length, 'products');
        } catch (e) {
          console.error('[Chatbot] Error parsing product info:', e);
        }
      }
  
      // Load CEEL products JSON data
      const ceelProductsScript = document.getElementById('ceel-products-json');
      if (ceelProductsScript) {
        try {
          ceelProductsJson = JSON.parse(ceelProductsScript.textContent);
          console.log('[Chatbot] CEEL products JSON loaded:', ceelProductsJson?.length || 0, 'products');
          // Enrich product data with JSON info
          enrichProductDataWithJson();
        } catch (e) {
          console.error('[Chatbot] Error parsing CEEL products JSON:', e);
        }
      }
  
      // Get DOM elements
      chatbotModal = document.getElementById('chatbotModal');
      chatbotBackdrop = document.getElementById('chatbotModalBackdrop');
      chatbotInput = document.getElementById('chatbotInput');
      chatbotSend = document.getElementById('chatbotSend');
      chatbotMessages = document.getElementById('chatbotMessages');
      chatbotRecommendations = document.getElementById('chatbotRecommendations');
      supportBar = document.getElementById('chatbotSupportBar');
      supportQuestion = document.getElementById('chatbotSupportQuestion');
      supportChatButton = document.getElementById('chatbotSupportChatButton');
      desktopChatbotButton = document.querySelector('.header-actions__chatbot-button');
      chatbotToast = document.getElementById('chatbotToast');
      chatbotToastClose = document.getElementById('chatbotToastClose');
      chatbotCheckoutButton = document.getElementById('chatbotCheckoutButton');
      chatbotDefaultQuestions = document.getElementById('chatbotDefaultQuestions');
  
      // Setup event listeners
      setupEventListeners();
  
      // Start question rotation
      startQuestionRotation();
  
      // Add welcome message based on current product
      if (chatbotMessages && chatbotMessages.children.length === 0) {
        addWelcomeMessage();
      }
    }
  
    // Add welcome message based on current product
    function addWelcomeMessage() {
      if (!chatbotMessages) return;
      
      const productHandle = getCurrentProductHandle();
      let welcomeMessage = 'Zdravo! Kako mogu da vam pomognem danas?';
      
      if (productHandle && chatbotProductData) {
        const product = chatbotProductData.products[productHandle];
        if (product && product.title) {
          welcomeMessage = `Zdravo! Kako mogu da vam pomognem sa ${product.title}? Možete da me pitate bilo šta o ovom proizvodu, ili šta vam odgovara za vaše potrebe u negi kože, rastu kose ili oralnom zdravlju.`;
        }
      }
      
      addMessage(welcomeMessage, false);
    }
  
    // Setup event listeners
    function setupEventListeners() {
      // Mobile support bar - make entire bar clickable
      if (supportBar) {
        supportBar.addEventListener('click', (e) => {
          // Don't trigger if clicking the chat button (it has its own handler)
          if (!e.target.closest('.chatbot-support-bar__chat-button')) {
            openChatbot();
          }
        });
      }
  
      // Mobile support bar chat button
      if (supportChatButton) {
        supportChatButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent double trigger
          openChatbot();
        });
      }
  
      // Desktop chatbot button
      if (desktopChatbotButton) {
        desktopChatbotButton.addEventListener('click', openChatbot);
      }
  
      // Modal close
      const closeButton = document.getElementById('chatbotModalClose');
      if (closeButton) {
        closeButton.addEventListener('click', closeChatbot);
      }
  
      // Backdrop click
      if (chatbotBackdrop) {
        chatbotBackdrop.addEventListener('click', closeChatbot);
      }
  
      // Send button
      if (chatbotSend) {
        chatbotSend.addEventListener('click', sendMessage);
      }
  
      // Input enter key
      if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });
      }
  
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isChatbotOpen) {
          closeChatbot();
        }
      });
      
      // Scroll indicator
      const scrollIndicator = document.getElementById('chatbotScrollIndicator');
      if (scrollIndicator) {
        scrollIndicator.addEventListener('click', scrollToBottom);
      }
      
      // Update scroll indicator on scroll
      const scrollContainer = document.querySelector('.chatbot-modal__content');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updateScrollIndicator);
      }
  
      // Toast close button
      if (chatbotToastClose) {
        chatbotToastClose.addEventListener('click', hideToast);
      }

      // Check if toast should be shown and schedule next appearance
      checkAndShowToast();
    }
  
    // Check if toast should be shown based on 5-minute interval
    function checkAndShowToast() {
      const STORAGE_KEY = 'chatbotToastLastShown';
      const FIVE_MINUTES = 300000; // 5 minutes in milliseconds
      
      const now = Date.now();
      const lastShown = localStorage.getItem(STORAGE_KEY);
      
      if (!lastShown) {
        // First time - show immediately and record time
        showToast();
        localStorage.setItem(STORAGE_KEY, now.toString());
        scheduleNextToast();
      } else {
        const timeSinceLastShown = now - parseInt(lastShown, 10);
        
        if (timeSinceLastShown >= FIVE_MINUTES) {
          // 5 minutes have passed - show immediately
          showToast();
          localStorage.setItem(STORAGE_KEY, now.toString());
          scheduleNextToast();
        } else {
          // Less than 5 minutes have passed - schedule for remaining time
          const remainingTime = FIVE_MINUTES - timeSinceLastShown;
          setTimeout(() => {
            if (!isChatbotOpen) {
              showToast();
              localStorage.setItem(STORAGE_KEY, Date.now().toString());
            }
            scheduleNextToast();
          }, remainingTime);
        }
      }
    }
    
    // Show toast notification
    function showToast() {
      if (!chatbotToast) return;
      
      // Don't show if chatbot is already open
      if (isChatbotOpen) {
        return;
      }
      
      // Show toast
      if (!isChatbotOpen && chatbotToast) {
        const isMobile = window.innerWidth < 750;
        
        // Show toast on both mobile and desktop
        chatbotToast.classList.add('show');
        
        if (isMobile) {
          // Add glow animation to support bar on mobile
          if (supportBar) {
            supportBar.classList.add('chatbot-support-bar--glow');
          }
        } else {
          // Add pulsate animation to desktop icon
          if (desktopChatbotButton) {
            desktopChatbotButton.classList.add('header-actions__chatbot-button--pulse');
          }
        }
        
        // Auto-hide after 18 seconds
        if (toastAutoHideTimer) {
          clearTimeout(toastAutoHideTimer);
        }
        toastAutoHideTimer = setTimeout(() => {
          hideToast();
        }, 18000);
        
        // Update last shown time
        localStorage.setItem('chatbotToastLastShown', Date.now().toString());
      }
    }
    
    // Schedule next toast to appear after 5 minutes
    function scheduleNextToast() {
      // Clear any existing timer
      if (toastIntervalTimer) {
        clearInterval(toastIntervalTimer);
      }
      
      // Set timer for 5 minutes (300,000 milliseconds)
      toastIntervalTimer = setInterval(() => {
        // Only show if chatbot is not open
        if (!isChatbotOpen) {
          showToast();
        }
      }, 300000); // 5 minutes
    }
  
    // Hide toast notification
    function hideToast() {
      if (!chatbotToast) return;
      
      const isMobile = window.innerWidth < 750;
      
      chatbotToast.classList.add('hiding');
      
      if (isMobile) {
        // Remove glow from support bar
        if (supportBar) {
          supportBar.classList.remove('chatbot-support-bar--glow');
        }
      } else {
        // Remove pulsate from desktop icon
        if (desktopChatbotButton) {
          desktopChatbotButton.classList.remove('header-actions__chatbot-button--pulse');
        }
      }
      
      setTimeout(() => {
        chatbotToast.classList.remove('show', 'hiding');
      }, 300);
    }
  
    // Open chatbot
    function openChatbot() {
      if (!chatbotModal) return;
      
      isChatbotOpen = true;
      chatbotModal.setAttribute('aria-hidden', 'false');
      chatbotModal.style.display = 'flex';
      
      if (chatbotBackdrop) {
        chatbotBackdrop.style.display = 'block';
      }
  
      // Focus input
      if (chatbotInput) {
        setTimeout(() => chatbotInput.focus(), 100);
      }
  
      // Stop question rotation
      stopQuestionRotation();
      
      // Hide toast when opening chatbot
      hideToast();
      
      // Clear auto-hide timer if chatbot is opened
      if (toastAutoHideTimer) {
        clearTimeout(toastAutoHideTimer);
        toastAutoHideTimer = null;
      }
      
      // Remove animations
      if (supportBar) {
        supportBar.classList.remove('chatbot-support-bar--glow');
        // Only hide support bar on mobile when chatbot opens
        if (window.innerWidth < 750) {
          supportBar.style.display = 'none';
        }
      }
      if (desktopChatbotButton) {
        desktopChatbotButton.classList.remove('header-actions__chatbot-button--pulse');
      }
      
      // Add welcome message if chat is empty
      if (chatbotMessages && chatbotMessages.children.length === 0) {
        addWelcomeMessage();
      }
      
      // Show default questions
      showDefaultQuestions();
      
      // Initialize scroll indicator
      updateScrollIndicator();
    }
  
    // Close chatbot
    function closeChatbot() {
      if (!chatbotModal) return;
      
      isChatbotOpen = false;
      chatbotModal.setAttribute('aria-hidden', 'true');
      chatbotModal.style.display = 'none';
      
      if (chatbotBackdrop) {
        chatbotBackdrop.style.display = 'none';
      }
  
      // Show support bar again on mobile when closing chatbot
      if (supportBar && window.innerWidth < 750) {
        supportBar.style.display = 'block';
      }
  
      // Resume question rotation
      startQuestionRotation();
    }
  
    // Get current product handle
    function getCurrentProductHandle() {
      const path = window.location.pathname;
      const productMatch = path.match(/\/products\/([^\/]+)/);
      return productMatch ? productMatch[1] : null;
    }
  
    // Get product-specific questions
    function getProductQuestions() {
      if (!chatbotProductData) return [];
      
      const productHandle = getCurrentProductHandle();
      if (!productHandle) return [];
      
      const product = chatbotProductData.products[productHandle];
      return product ? (product.questions || []) : [];
    }
  
    // Get general questions
    function getGeneralQuestions() {
      return chatbotProductData?.generalQuestions || [];
    }
  
    // Show default questions
    function showDefaultQuestions() {
      if (!chatbotDefaultQuestions || !chatbotProductData) return;
      
      const productHandle = getCurrentProductHandle();
      let questions = [];
      
      if (productHandle) {
        // Product-specific questions
        const product = chatbotProductData.products[productHandle];
        if (product && product.questions) {
          questions = [...product.questions];
        }
      } else {
        // General questions
        questions = getGeneralQuestions();
      }
      
      // Limit to 4-5 questions
      questions = questions.slice(0, 5);
      availableDefaultQuestions = questions;
      
      renderDefaultQuestions();
    }
  
    // Render default questions
    function renderDefaultQuestions() {
      if (!chatbotDefaultQuestions) return;
      
      chatbotDefaultQuestions.innerHTML = '';
      
      if (availableDefaultQuestions.length === 0) {
        chatbotDefaultQuestions.classList.add('hidden');
        return;
      }
      
      chatbotDefaultQuestions.classList.remove('hidden');
      
      availableDefaultQuestions.forEach(question => {
        const button = document.createElement('button');
        button.className = 'chatbot-modal__default-question';
        button.textContent = question;
        button.addEventListener('click', () => {
          handleDefaultQuestionClick(question);
        });
        chatbotDefaultQuestions.appendChild(button);
      });
    }
  
    // Handle default question click
    function handleDefaultQuestionClick(question) {
      // Remove clicked question from available questions
      availableDefaultQuestions = availableDefaultQuestions.filter(q => q !== question);
      renderDefaultQuestions();
      
      // Send the question as a user message
      if (chatbotInput) {
        chatbotInput.value = question;
      }
      sendMessage();
    }
  
    // Start question rotation
    function startQuestionRotation() {
      if (!supportQuestion) return;
      
      stopQuestionRotation();
      
      const productHandle = getCurrentProductHandle();
      const questions = productHandle ? getProductQuestions() : getGeneralQuestions();
      
      if (questions.length === 0) return;
      
      // Set initial question
      updateQuestion(questions, 0);
      
      // Rotate questions with transition delay
      questionRotationInterval = setInterval(() => {
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        updateQuestion(questions, currentQuestionIndex);
      }, QUESTION_ROTATION_INTERVAL);
    }
  
    // Stop question rotation
    function stopQuestionRotation() {
      if (questionRotationInterval) {
        clearInterval(questionRotationInterval);
        questionRotationInterval = null;
      }
    }
  
    // Update question text with smooth transition
    function updateQuestion(questions, index) {
      if (!supportQuestion || !questions[index]) return;
      
      const questionText = supportQuestion.querySelector('.chatbot-support-bar__question-text');
      if (!questionText) return;
      
      const newQuestion = questions[index];
      
      // Fade out current question
      questionText.classList.add('fade-out');
      questionText.classList.remove('fade-in', 'scrolling');
      
      // After fade out, update text and fade in
      setTimeout(() => {
        questionText.textContent = newQuestion;
        questionText.classList.remove('fade-out');
        questionText.classList.add('fade-in');
        
        // Check if text is truncated and needs scrolling
        setTimeout(() => {
          checkAndApplyScrolling(questionText);
        }, 100);
      }, 300);
    }
  
    // Check if text is truncated and apply scrolling animation
    function checkAndApplyScrolling(questionText) {
      if (!questionText || !supportQuestion) return;
      
      // Reset scrolling class
      questionText.classList.remove('scrolling');
      
      // Force a reflow to get accurate measurements
      void questionText.offsetWidth;
      
      // Check if text is wider than container
      const container = supportQuestion;
      const textWidth = questionText.scrollWidth;
      const containerWidth = container.offsetWidth;
      
      // Add some padding to account for icons and chat button
      const availableWidth = containerWidth - 120; // Approximate space for icons and button
      
      if (textWidth > availableWidth) {
        // Text is truncated, apply scrolling animation
        const extraWidth = textWidth - availableWidth;
        const scrollDistance = extraWidth + 50; // Add some extra space for smooth scroll
        
        // Calculate animation duration based on text length (longer text = longer duration)
        const duration = Math.max(8, Math.min(20, 8 + (scrollDistance / 30)));
        
        questionText.style.setProperty('--scroll-duration', `${duration}s`);
        questionText.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
        questionText.classList.add('scrolling');
      }
    }
  
    // Add message to chat
    function addMessage(text, isUser = false) {
      if (!chatbotMessages) return;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-modal__message chatbot-modal__message--${isUser ? 'user' : 'ai'}`;
      
      const bubble = document.createElement('div');
      bubble.className = 'chatbot-modal__message-bubble';
      
      if (isUser) {
        bubble.textContent = text;
      } else {
        bubble.innerHTML = formatMarkdown(text);
      }
      
      const time = document.createElement('div');
      time.className = 'chatbot-modal__message-time';
      time.textContent = new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
      
      messageDiv.appendChild(bubble);
      messageDiv.appendChild(time);
      chatbotMessages.appendChild(messageDiv);
      
      // Scroll to the start of the new message (not bottom)
      if (!isUser) {
        // For AI messages, scroll to the start of the message
        setTimeout(() => {
          const scrollContainer = document.querySelector('.chatbot-modal__content');
          if (scrollContainer) {
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => updateScrollIndicator(), 300);
          }
        }, 100);
      } else {
        // For user messages, scroll to bottom
        const scrollContainer = document.querySelector('.chatbot-modal__content');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
          updateScrollIndicator();
        }
      }
    }
    
    // Update scroll indicator visibility
    function updateScrollIndicator() {
      const scrollContainer = document.querySelector('.chatbot-modal__content');
      if (!scrollContainer) return;
      
      const scrollIndicator = document.getElementById('chatbotScrollIndicator');
      if (!scrollIndicator) return;
      
      const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 50;
      
      if (isAtBottom) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }
    
    // Scroll to bottom when clicking scroll indicator
    function scrollToBottom() {
      const scrollContainer = document.querySelector('.chatbot-modal__content');
      if (!scrollContainer) return;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
      updateScrollIndicator();
    }
  
    // Format markdown text
    function formatMarkdown(text) {
      if (!text) return '';
      
      // Escape HTML
      let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Convert **text** to <strong>text</strong>
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Convert *text* to <em>text</em>
      formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
      
      // Convert double newlines to paragraphs
      formatted = formatted.split(/\n\n+/).map(para => {
        para = para.replace(/\n/g, '<br>');
        return para.trim() ? `<p>${para.trim()}</p>` : '';
      }).join('');
      
      return formatted;
    }
  
    // Show typing indicator
    function showTyping() {
      if (!chatbotMessages || isTyping) return;
      
      isTyping = true;
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chatbot-modal__typing';
      typingDiv.id = 'typingIndicator';
      typingDiv.innerHTML = '<span class="chatbot-modal__typing-dot"></span><span class="chatbot-modal__typing-dot"></span><span class="chatbot-modal__typing-dot"></span>';
      chatbotMessages.appendChild(typingDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  
    // Hide typing indicator
    function hideTyping() {
      const typing = document.getElementById('typingIndicator');
      if (typing) {
        typing.remove();
      }
      isTyping = false;
    }
  
    // Enrich product data with JSON information
    function enrichProductDataWithJson() {
      if (!chatbotProductData || !ceelProductsJson || !chatbotProductData.products) return;
      
      let enrichedCount = 0;
      
      // Match JSON products with Shopify products by name similarity
      ceelProductsJson.forEach(jsonProduct => {
        const jsonName = jsonProduct.naziv?.toLowerCase().trim();
        if (!jsonName) return;
        
        // Extract main part of JSON name (before dash/colon)
        const jsonMainTitle = jsonName.split(/[–\-:]/)[0].trim();
        
        // Try to find matching Shopify product
        Object.keys(chatbotProductData.products).forEach(handle => {
          const shopifyProduct = chatbotProductData.products[handle];
          const shopifyTitle = shopifyProduct.title?.toLowerCase().trim();
          
          if (!shopifyTitle) return;
          
          // Extract main part of title (before dash/colon) for comparison
          const shopifyMainTitle = shopifyTitle.split(/[–\-:]/)[0].trim();
          
          // Normalize for comparison (remove common words, special chars)
          const normalize = (str) => {
            return str
              .replace(/[^\w\s]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .toLowerCase();
          };
          
          const normalizedJson = normalize(jsonMainTitle);
          const normalizedShopify = normalize(shopifyMainTitle);
          
          // Check if titles match (multiple strategies)
          const isMatch = 
            normalizedJson === normalizedShopify ||
            normalizedShopify.includes(normalizedJson) ||
            normalizedJson.includes(normalizedShopify) ||
            shopifyTitle.includes(jsonMainTitle) ||
            jsonName.includes(shopifyMainTitle) ||
            // Check if key words match (at least 2-3 words)
            (normalizedJson.split(' ').filter(word => 
              word.length > 3 && normalizedShopify.includes(word)
            ).length >= 2);
          
          if (isMatch) {
            // Enrich product with JSON data (always use JSON if available, it's more detailed)
            if (jsonProduct.sastojci && jsonProduct.sastojci.trim() !== '') {
              shopifyProduct.sastojci_detaljno = jsonProduct.sastojci;
            }
            
            if (jsonProduct.upotreba && jsonProduct.upotreba.trim() !== '') {
              shopifyProduct.upotreba_detaljno = jsonProduct.upotreba;
            }
            
            if (jsonProduct.opis && jsonProduct.opis.trim() !== '') {
              // Only update description if current one is empty or very short
              if (!shopifyProduct.description || shopifyProduct.description.trim().length < 50) {
                shopifyProduct.description = jsonProduct.opis;
              }
            }
            
            enrichedCount++;
            console.log('[Chatbot] ✅ Enriched product:', handle, '(', shopifyProduct.title, ') with JSON data');
          }
        });
      });
      
      console.log('[Chatbot] 📦 Enriched', enrichedCount, 'products with JSON data');
    }
  
    // Get curated product info
    function getCuratedProductInfo(productHandle) {
      if (!chatbotProductData || !productHandle) return null;
      return chatbotProductData.products[productHandle] || null;
    }
  
    // Get system instructions
    function getSystemInstructions() {
      if (!chatbotProductData) return [];
      return chatbotProductData.instructions?.rules || [];
    }
  
    // Build system prompt
    function buildSystemPrompt(productHandle) {
      const instructions = chatbotProductData?.instructions;
      let systemPrompt = instructions?.systemPrompt || `Ti si korisni asistent za ${window.Shop?.shop || 'CEEL'}. Odgovaraj na pitanja o našim proizvodima na srpskom jeziku (latinica).`;
      
      // Add rules
      const rules = getSystemInstructions();
      if (rules.length > 0) {
        systemPrompt += '\n\n=== PRAVILA ===\n';
        rules.forEach((rule, i) => {
          systemPrompt += `${i + 1}. ${rule}\n`;
        });
      }
      
      // Add product info if on product page
      if (productHandle) {
        const product = getCuratedProductInfo(productHandle);
        if (product) {
          systemPrompt += '\n\n=== INFORMACIJE O PROIZVODU ===\n';
          systemPrompt += `Naziv: ${product.title || 'N/A'}\n`;
          
          if (product.description) {
            const description = typeof product.description === 'string' 
              ? product.description.trim() 
              : String(product.description || '').trim();
            if (description !== '') {
              systemPrompt += `\nOpis:\n${description}\n`;
            }
          }
          
          // Add ingredients - prioritize detailed, then regular, then active
          // Helper function to safely check and trim strings
          const safeTrim = (value) => {
            if (!value) return '';
            if (typeof value !== 'string') return String(value).trim();
            return value.trim();
          };
          
          const sastojciDetaljno = safeTrim(product.sastojci_detaljno);
          const ingredients = safeTrim(product.ingredients);
          const activeIngredients = safeTrim(product.active_ingredients);
          const kakoSeKoristi = safeTrim(product.kako_se_koristi);
          const upotrebaDetaljno = safeTrim(product.upotreba_detaljno);
          
          if (sastojciDetaljno !== '') {
            systemPrompt += `\nSastojci (detaljno):\n${sastojciDetaljno}\n`;
          } else if (ingredients !== '') {
            systemPrompt += `\nSastojci:\n${ingredients}\n`;
          }
          
          if (activeIngredients !== '') {
            systemPrompt += `\nAktivni sastojci:\n${activeIngredients}\n`;
          }
          
          // Always add note about explaining ingredients benefits
          if (ingredients !== '' || sastojciDetaljno !== '' || activeIngredients !== '') {
            systemPrompt += `\nNAPOMENA O SASTOJCIMA: Kada korisnik pita o sastojcima, UVEK objasni zašto su ti sastojci dobri - njihove prednosti, kako pomažu koži/kosi, i zašto su važni. Koristi informacije iz gornjih sastojaka da objasniš benefite.\n`;
          }
          
          // Add usage information - prioritize detailed, then regular
          if (upotrebaDetaljno !== '') {
            systemPrompt += `\nKAKO SE KORISTI (DETALJNO):\n${upotrebaDetaljno}\n`;
            systemPrompt += `\nNAPOMENA: Kada korisnik pita "Kako se koristi?" ili "Kako da koristim ovaj proizvod?", UVEK koristi informacije iz gornjeg dela "KAKO SE KORISTI (DETALJNO)" da daš tačan i detaljan odgovor!\n`;
          } else if (kakoSeKoristi !== '') {
            systemPrompt += `\nKako se koristi:\n${kakoSeKoristi}\n`;
            systemPrompt += `\nNAPOMENA: Kada korisnik pita "Kako se koristi?" ili "Kako da koristim ovaj proizvod?", UVEK koristi informacije iz gornjeg dela "Kako se koristi" da daš tačan odgovor!\n`;
          }
          
          if (product.tags && product.tags.length > 0) {
            systemPrompt += `\nTagovi: ${product.tags.join(', ')}\n`;
          }
          
          if (product.collections && product.collections.length > 0) {
            systemPrompt += `\nKategorije: ${product.collections.join(', ')}\n`;
          }
          
          if (product.price) {
            systemPrompt += `\nCena: ${(product.price / 100).toFixed(2)} RSD\n`;
          }
          
          // Bundle info - IMPORTANT: Always recommend sets if available
          if (product.containing_bundles && product.containing_bundles.length > 0) {
            systemPrompt += `\nVAŽNO - DOSTUPNI SETOVI/BUNDLE-OVI:\n`;
            systemPrompt += `Trenutni proizvod je deo sledećih setova. UVEK preporuči set umesto pojedinačnog proizvoda jer setovi nude:\n`;
            systemPrompt += `- Bolju vrednost (obično jeftiniji)\n`;
            systemPrompt += `- Kompletnu negu (sve što je potrebno u jednom paketu)\n`;
            systemPrompt += `- Veću uštedu novca\n\n`;
            product.containing_bundles.forEach((bundle, i) => {
              const bundlePrice = (bundle.price / 100).toFixed(2);
              const currentPrice = (product.price / 100).toFixed(2);
              systemPrompt += `${i + 1}. ${bundle.title} - ${bundlePrice} RSD (trenutni proizvod: ${currentPrice} RSD)\n`;
            });
            systemPrompt += `\nNAPOMENA: Kada korisnik pokazuje interes za ovaj proizvod, UVEK spomeni set i objasni zašto je set bolji izbor!\n`;
          }
          
          // Check for 2+1 offers (would be in special_offers or tags)
          const hasSpecialOffer = product.tags && product.tags.some(tag => 
            tag.toLowerCase().includes('2+1') || 
            tag.toLowerCase().includes('gratis') ||
            tag.toLowerCase().includes('akcija')
          );
          
          if (hasSpecialOffer) {
            systemPrompt += `\nSPECIJALNA PONUDA: Ovaj proizvod ima 2+1 gratis ponudu!\n`;
            systemPrompt += `UVEK spomeni ovu ponudu kao bolji izbor - korisnik dobija treći proizvod besplatno, što znači značajnu uštedu.\n`;
          }
          
          systemPrompt += '\n=== KRAJ INFORMACIJA O PROIZVODU ===\n';
        }
      }
      
      return systemPrompt;
    }
  
    // Extract products mentioned in AI response
    function extractProductsFromAIResponse(aiMessage) {
      if (!chatbotProductData || !chatbotProductData.products) return [];
      
      const foundProducts = [];
      const foundSets = [];
      const messageLower = aiMessage.toLowerCase();
      const currentProductHandle = getCurrentProductHandle();
      
      // Check all products to see if they're mentioned in the response
      Object.keys(chatbotProductData.products).forEach(handle => {
        const product = chatbotProductData.products[handle];
        const title = (product.title || '').toLowerCase();
        
        if (!title) return;
        
        // Skip if it's the current product page
        if (handle === currentProductHandle) return;
        
        // Extract main title part (before dash/colon)
        const mainTitle = title.split(/[–\-:]/)[0].trim();
        const titleWords = mainTitle.split(/\s+/).filter(w => w.length > 2);
        
        // Check if product title or key words are mentioned
        let isMentioned = false;
        const isSet = title.includes('set') || title.includes('bundle') || title.includes('komplet');
        
        // Check for exact title match or main title match
        if (messageLower.includes(mainTitle) || messageLower.includes(title)) {
          isMentioned = true;
        } else {
          // Check if at least 2-3 key words from title are mentioned
          const mentionedWords = titleWords.filter(word => 
            messageLower.includes(word) && word.length > 3
          );
          
          // For sets, check for "set" keyword near product name - prioritize sets
          if (isSet) {
            const setKeywords = ['set', 'bundle', 'komplet', 'paket'];
            const hasSetKeyword = setKeywords.some(kw => messageLower.includes(kw));
            
            // Check if product-specific words are mentioned along with set keyword
            if (hasSetKeyword && mentionedWords.length >= 1) {
              isMentioned = true;
            }
            // Also check if any key ingredient/concern words match set description
            const setKeywordsInMessage = ['kolagen', 'retinol', 'vitamin', 'hijaluron', 'ružmarin', 'akne', 'suva koža', 'rast kose'];
            if (setKeywordsInMessage.some(kw => messageLower.includes(kw)) && mentionedWords.length >= 1) {
              isMentioned = true;
            }
          } else {
            // For individual products, need at least 2 matching words
            if (mentionedWords.length >= 2) {
              isMentioned = true;
            }
          }
        }
        
        if (isMentioned) {
          if (isSet) {
            foundSets.push(product);
          } else {
            foundProducts.push(product);
          }
        }
      });
      
      // Remove duplicates
      const uniqueSets = [];
      const uniqueProducts = [];
      const seenHandles = new Set();
      
      // Prioritize sets - add them first
      foundSets.forEach(product => {
        if (!seenHandles.has(product.handle)) {
          seenHandles.add(product.handle);
          uniqueSets.push(product);
        }
      });
      
      foundProducts.forEach(product => {
        if (!seenHandles.has(product.handle)) {
          seenHandles.add(product.handle);
          uniqueProducts.push(product);
        }
      });
      
      // Return sets first, then products (max 5 total, but prioritize sets)
      const result = [...uniqueSets, ...uniqueProducts];
      return result.slice(0, 5);
    }
  
    // Analyze user message for product recommendations
    function analyzeForRecommendations(userMessage) {
      if (!chatbotProductData) return [];
      
      const messageLower = userMessage.toLowerCase();
      const products = chatbotProductData.products;
      const scoredProducts = [];
      
      // Check if user is asking for recommendations
      const recommendationTriggers = [
        'preporuči', 'preporuka', 'preporučujete', 'preporučite',
        'koji proizvod', 'koji proizvodi', 'šta preporučujete',
        'šta mi odgovara', 'šta bi mi odgovaralo', 'šta je najbolje',
        'potreban', 'potrebno', 'trebam', 'tražim', 'traže',
        'za akne', 'za suvu kožu', 'za masnu kožu', 'za rast kose',
        'za oralno zdravlje', 'za zube', 'za kosu', 'za kožu'
      ];
      
      const isAskingForRecommendations = recommendationTriggers.some(trigger => 
        messageLower.includes(trigger)
      );
      
      // If not asking for recommendations, don't show any
      if (!isAskingForRecommendations) {
        return [];
      }
      
      // Keywords for different concerns with more specific matching
      const concernKeywords = {
        'akne': ['akne', 'pimple', 'zgaravice', 'upaljena koža', 'upala', 'crvenilo kože'],
        'suva_koza': ['suva koža', 'dehidratisana koža', 'peckanje kože', 'isušena koža'],
        'masna_koza': ['masna koža', 'sjaj kože', 'ulje na koži', 'masna'],
        'osetljiva_koza': ['osetljiva koža', 'iritacija kože', 'crvenilo', 'peckanje'],
        'rast_kose': ['rast kose', 'gubitak kose', 'ćelavost', 'kosa', 'dlake', 'opadanje kose'],
        'oralno_zdravlje': ['zubi', 'oralno zdravlje', 'usna duplja', 'beljenje zuba', 'karijes', 'zubni kamenac', 'zubni', 'oralna higijena']
      };
      
      // Extract concerns from message
      const mentionedConcerns = [];
      Object.keys(concernKeywords).forEach(concern => {
        if (concernKeywords[concern].some(keyword => messageLower.includes(keyword))) {
          mentionedConcerns.push(concern);
        }
      });
      
      // If no specific concerns mentioned, don't recommend
      if (mentionedConcerns.length === 0) {
        return [];
      }
      
      // Score each product - only if it matches mentioned concerns
      Object.keys(products).forEach(handle => {
        const product = products[handle];
        let score = 0;
        let hasRelevantMatch = false;
        
        const titleLower = (product.title || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const ingredients = (product.ingredients || '').toLowerCase();
        const activeIngredients = (product.active_ingredients || '').toLowerCase();
        const tags = (product.tags || []).join(' ').toLowerCase();
        const collections = (product.collections || []).join(' ').toLowerCase();
        
        // Check each mentioned concern
        mentionedConcerns.forEach(concern => {
          const keywords = concernKeywords[concern];
          
          // High score: ingredients match concern keywords
          keywords.forEach(keyword => {
            if (messageLower.includes(keyword)) {
              if (ingredients.includes(keyword) || activeIngredients.includes(keyword)) {
                score += 20;
                hasRelevantMatch = true;
              }
              // Medium score: description or title matches
              if (description.includes(keyword)) {
                score += 12;
                hasRelevantMatch = true;
              }
              if (titleLower.includes(keyword)) {
                score += 10;
                hasRelevantMatch = true;
              }
              // Lower score: tags or collections match
              if (tags.includes(keyword) || collections.includes(keyword)) {
                score += 6;
                hasRelevantMatch = true;
              }
            }
          });
        });
        
        // Only add products with meaningful matches
        if (hasRelevantMatch && score >= 10) {
          scoredProducts.push({ handle, product, score });
        }
      });
      
      // Sort by score and get top 3-5, but only if scores are meaningful
      scoredProducts.sort((a, b) => b.score - a.score);
      
      // Only return products if we have at least one with a good score
      if (scoredProducts.length === 0 || scoredProducts[0].score < 10) {
        return [];
      }
      
      // Get top products, but limit to those with at least 50% of the top score
      const topScore = scoredProducts[0].score;
      const minScore = Math.max(10, topScore * 0.5);
      const relevantProducts = scoredProducts.filter(item => item.score >= minScore);
      
      // Return 3-5 products, but only if they're actually relevant
      return relevantProducts.slice(0, 5).map(item => item.product);
    }
  
    // Check for bundles
    function findBundlesForProducts(products) {
      if (!chatbotProductData || products.length < 2) return [];
      
      const bundles = [];
      const productHandles = products.map(p => p.handle);
      
      Object.keys(chatbotProductData.products).forEach(handle => {
        const product = chatbotProductData.products[handle];
        if (product.bundle_components && product.bundle_components.length > 0) {
          const componentHandles = product.bundle_components.map(c => c.handle);
          // Check if at least 2 recommended products are in this bundle
          const matchingProducts = productHandles.filter(h => componentHandles.includes(h));
          if (matchingProducts.length >= 2) {
            // Check if bundle is cheaper than individual products
            const individualPrice = products
              .filter(p => matchingProducts.includes(p.handle))
              .reduce((sum, p) => sum + (p.price || 0), 0);
            
            if (product.price && product.price < individualPrice) {
              bundles.push(product);
            }
          }
        }
      });
      
      return bundles;
    }
  
    // Display current product
    function displayCurrentProduct(product) {
      if (!chatbotRecommendations) return;
      
      // Check if current product is already shown
      const existingCard = chatbotRecommendations.querySelector(`[data-product-handle="${product.handle}"]`);
      if (!existingCard) {
        // Create card for current product
        const card = createRecommendationCard(product, false);
        chatbotRecommendations.appendChild(card);
      }
      
      // Always ensure show class is added (in case it was removed)
      chatbotRecommendations.classList.add('show');
    }
  
    // Display product recommendations
    function displayRecommendations(products, bundles = []) {
      if (!chatbotRecommendations) return;
      
      const productHandle = getCurrentProductHandle();
      
      // If bundles exist and are cheaper, show bundles first
      if (bundles.length > 0) {
        bundles.forEach(bundle => {
          // Don't add if it's the current product or already exists
          if (bundle.handle !== productHandle) {
            const existingCard = chatbotRecommendations.querySelector(`[data-product-handle="${bundle.handle}"]`);
            if (!existingCard) {
              const card = createRecommendationCard(bundle, true);
              chatbotRecommendations.appendChild(card);
            }
          }
        });
      }
      
      // Show individual products (limit to 3-5 total)
      const maxProducts = bundles.length > 0 ? 3 : 5;
      products.slice(0, maxProducts).forEach(product => {
        // Don't add if it's the current product (already shown) or already exists
        if (product.handle !== productHandle) {
          const existingCard = chatbotRecommendations.querySelector(`[data-product-handle="${product.handle}"]`);
          if (!existingCard) {
            const card = createRecommendationCard(product, false);
            chatbotRecommendations.appendChild(card);
          }
        }
      });
      
      chatbotRecommendations.classList.add('show');
      
      // Keep default questions visible after showing recommendations
      if (availableDefaultQuestions.length > 0) {
        renderDefaultQuestions();
      }
    }
  
    // Create recommendation card
    function createRecommendationCard(product, isBundle = false) {
      const card = document.createElement('div');
      card.className = 'chatbot-modal__recommendation-card';
      card.dataset.productHandle = product.handle;
      card.dataset.isBundle = isBundle;
      
      // Get product image URL
      const imageUrl = `/products/${product.handle}.js`;
      
      card.innerHTML = `
        <img class="chatbot-modal__recommendation-image" src="" alt="${product.title}" style="display: none;">
        <div class="chatbot-modal__recommendation-info">
          <h4 class="chatbot-modal__recommendation-title">${product.title}${isBundle ? ' (Bundle)' : ''}</h4>
          <div class="chatbot-modal__recommendation-price">${(product.price / 100).toFixed(2)} RSD</div>
          <button class="chatbot-modal__recommendation-button" data-variant-id="${product.variants && product.variants[0] ? product.variants[0].id : ''}">
            Dodaj u korpu
          </button>
        </div>
      `;
      
      // Add click handler
      const button = card.querySelector('.chatbot-modal__recommendation-button');
      if (button) {
        button.addEventListener('click', () => addToCart(product, isBundle));
      }
      
      // Load product image
      fetch(imageUrl)
        .then(res => res.json())
        .then(data => {
          const img = card.querySelector('.chatbot-modal__recommendation-image');
          if (img && data.featured_image) {
            // Use featured_image URL from product JSON
            img.src = data.featured_image;
            img.style.display = 'block';
          } else if (img && data.images && data.images.length > 0) {
            // Fallback to first image
            img.src = data.images[0];
            img.style.display = 'block';
          }
        })
        .catch(() => {
          // If image fails, hide image element
          const img = card.querySelector('.chatbot-modal__recommendation-image');
          if (img) {
            img.style.display = 'none';
          }
        });
      
      return card;
    }
  
    // Add to cart
    async function addToCart(product, isBundle = false) {
      if (!product || !product.variants || product.variants.length === 0) {
        alert('Proizvod nije dostupan.');
        return;
      }
      
      const variantId = product.variants[0].id;
      const button = event?.target || document.querySelector(`[data-product-handle="${product.handle}"] .chatbot-modal__recommendation-button`);
      
      if (button) {
        button.disabled = true;
        button.textContent = 'Dodavanje...';
      }
      
      try {
        let items = [];
        
        if (isBundle && product.bundle_components) {
          // Add bundle components
          for (const component of product.bundle_components) {
            const componentProduct = chatbotProductData.products[component.handle];
            if (componentProduct && componentProduct.variants && componentProduct.variants[0]) {
              items.push({
                id: componentProduct.variants[0].id,
                quantity: 1
              });
            }
          }
        } else {
          // Add single product
          items.push({
            id: variantId,
            quantity: 1
          });
        }
        
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
        
        if (response.ok) {
          if (button) {
            button.textContent = 'Dodato!';
            setTimeout(() => {
              button.disabled = false;
              button.textContent = 'Dodaj u korpu';
            }, 2000);
          }
          
          // Update cart count
          updateCartCount();
          
          // Show checkout button
          if (chatbotCheckoutButton) {
            chatbotCheckoutButton.style.display = 'block';
            chatbotCheckoutButton.classList.add('show');
            // Scroll to checkout button
            setTimeout(() => {
              chatbotCheckoutButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }
          
          // Dispatch cart update event
          document.dispatchEvent(new CustomEvent('cart:refresh'));
        } else {
          throw new Error('Greška pri dodavanju u korpu');
        }
      } catch (error) {
        console.error('Cart add error:', error);
        alert('Greška pri dodavanju proizvoda u korpu. Pokušajte ponovo.');
        if (button) {
          button.disabled = false;
          button.textContent = 'Dodaj u korpu';
        }
      }
    }
  
    // Update cart count
    async function updateCartCount() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        // Update cart icon if exists
        const cartBubble = document.querySelector('.cart-bubble__text');
        if (cartBubble) {
          cartBubble.textContent = cart.item_count;
        }
      } catch (error) {
        console.error('Cart count update error:', error);
      }
    }
  
    // Call OpenAI API
    async function callOpenAI(userMessage) {
      if (!PROXY_URL) {
        throw new Error('Chatbot proxy URL nije konfigurisan.');
      }
      
      const productHandle = getCurrentProductHandle();
      const systemPrompt = buildSystemPrompt(productHandle);
      
      // Analyze for recommendations
      const recommendations = analyzeForRecommendations(userMessage);
      const bundles = findBundlesForProducts(recommendations);
      
      try {
        // Build messages array
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ];
        
        console.log('[Chatbot] Sending request to:', PROXY_URL);
        console.log('[Chatbot] System prompt length:', systemPrompt.length);
        console.log('[Chatbot] User message:', userMessage);
        
        const response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          })
        });
        
        console.log('[Chatbot] Response status:', response.status, response.statusText);
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Chatbot] Response error:', response.status, errorText);
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 200)}`);
        }
        
        const data = await response.json();
        console.log('[Chatbot] Response data:', data);
        
        // Check if response has error
        if (data.error) {
          const errorMessage = data.error?.message || data.error || 'Greška pri komunikaciji sa AI servisom';
          console.error('[Chatbot] API error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        // Check if response has choices
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('[Chatbot] Invalid response structure:', data);
          throw new Error('Neočekivan odgovor od AI servisa - nema choices ili message');
        }
        
        const aiMessage = data.choices[0].message.content;
        
        if (!aiMessage || aiMessage.trim() === '') {
          console.error('[Chatbot] Empty AI message');
          throw new Error('AI servis je vratio prazan odgovor');
        }
        
        console.log('[Chatbot] ✅ AI response received:', aiMessage.substring(0, 100) + '...');
        
        // Add AI response
        addMessage(aiMessage, false);
        
        // Always show current product add to cart if on product page
        const productHandle = getCurrentProductHandle();
        const productsToShow = [];
        const setsToShow = [];
        
        if (productHandle && chatbotProductData) {
          const currentProduct = chatbotProductData.products[productHandle];
          if (currentProduct && currentProduct.variants && currentProduct.variants.length > 0) {
            // Show current product
            displayCurrentProduct(currentProduct);
            
            // Find set that contains this product - check containing_bundles first
            if (currentProduct.containing_bundles && currentProduct.containing_bundles.length > 0) {
              currentProduct.containing_bundles.forEach(bundle => {
                // bundle can be an object with handle or just a handle string
                const bundleHandle = bundle.handle || bundle;
                const bundleProduct = chatbotProductData.products[bundleHandle];
                if (bundleProduct) {
                  setsToShow.push(bundleProduct);
                }
              });
            } else {
              // Fallback: search all products for sets containing this product
              Object.keys(chatbotProductData.products).forEach(handle => {
                const product = chatbotProductData.products[handle];
                const isSet = (product.title || '').toLowerCase().includes('set') || 
                             (product.title || '').toLowerCase().includes('bundle') || 
                             (product.title || '').toLowerCase().includes('komplet');
                
                if (isSet && product.bundle_components) {
                  // Check if current product is in this bundle
                  const containsCurrent = product.bundle_components.some(comp => comp.handle === productHandle);
                  if (containsCurrent) {
                    setsToShow.push(product);
                  }
                }
              });
            }
            
            // Show only the set that contains current product
            if (setsToShow.length > 0) {
              displayRecommendations([], setsToShow);
            }
          }
        } else {
          // Not on product page - only show products/sets explicitly mentioned by AI
          const mentionedProducts = extractProductsFromAIResponse(aiMessage);
          if (mentionedProducts.length > 0) {
            // Separate sets from individual products
            const sets = mentionedProducts.filter(p => {
              const title = (p.title || '').toLowerCase();
              return title.includes('set') || title.includes('bundle') || title.includes('komplet');
            });
            const products = mentionedProducts.filter(p => {
              const title = (p.title || '').toLowerCase();
              return !title.includes('set') && !title.includes('bundle') && !title.includes('komplet');
            });
            
            displayRecommendations(products, sets);
          } else if (recommendations.length > 0) {
            // Fallback to original recommendations if no products extracted from AI
            displayRecommendations(recommendations, bundles);
          }
        }
        
        // Keep default questions visible after response
        if (availableDefaultQuestions.length > 0) {
          renderDefaultQuestions();
        }
      } catch (error) {
        console.error('[Chatbot] ❌ Error details:', error);
        console.error('[Chatbot] Error message:', error.message);
        console.error('[Chatbot] Error stack:', error.stack);
        
        // Show more specific error message
        let errorMessage = 'Izvinite, došlo je do greške. Molimo pokušajte ponovo.';
        
        if (error.message) {
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Problem sa internet konekcijom. Proverite konekciju i pokušajte ponovo.';
          } else if (error.message.includes('Server error')) {
            errorMessage = 'Problem sa serverom. Molimo pokušajte za nekoliko trenutaka.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Zahtev je istekao. Molimo pokušajte ponovo.';
          } else {
            // Don't show technical errors to user, but log them
            console.error('[Chatbot] Technical error:', error.message);
          }
        }
        
        addMessage(errorMessage, false);
        
        // Keep default questions visible even on error
        if (availableDefaultQuestions.length > 0) {
          renderDefaultQuestions();
        }
      }
    }
  
    // Send message
    async function sendMessage() {
      if (!chatbotInput || !chatbotInput.value.trim() || isTyping) return;
      
      const message = chatbotInput.value.trim();
      chatbotInput.value = '';
      
      // Add user message
      addMessage(message, true);
      
      // Hide recommendations
      if (chatbotRecommendations) {
        chatbotRecommendations.classList.remove('show');
      }
      
      // Show typing indicator
      showTyping();
      
      // Disable send button
      if (chatbotSend) {
        chatbotSend.disabled = true;
      }
      
      try {
        await callOpenAI(message);
      } catch (error) {
        console.error('Send message error:', error);
        addMessage('Izvinite, došlo je do greške. Molimo pokušajte ponovo.', false);
      } finally {
        hideTyping();
        if (chatbotSend) {
          chatbotSend.disabled = false;
        }
        if (chatbotInput) {
          chatbotInput.focus();
        }
      }
    }
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  
  