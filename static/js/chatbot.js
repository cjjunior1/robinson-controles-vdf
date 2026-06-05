/**
 * VFD AI Chatbot - Enhanced Version
 * Características:
 * - Persistencia en todas las páginas
 * - Toggle show/hide
 * - Zoom de texto (60-200px)
 * - Text-to-Speech con pausa/resume
 * - Copiar mensajes
 * - Adjuntar archivos e imágenes
 * - Interfaz mejorada con tema oscuro
 */

class VFDChatBot {
    constructor() {
        this.isInitialized = false;
        this.isOpen = localStorage.getItem('vfdChatOpen') === 'true';
        this.fontSize = parseInt(localStorage.getItem('vfdChatFontSize')) || 14;
        this.messages = [];
        this.utterance = null;
        this.isSpeaking = false;
        this.conversationHistory = JSON.parse(localStorage.getItem('vfdChatHistory')) || [];
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.greetings = [
            "¡Hola! 👋 Soy tu asistente técnico especializado.",
            "¡Bienvenido! 🤖 Aquí para ayudarte con VFD y electrónica.",
            "¡Saludos! ⚡ Tu experto en VFD al servicio.",
            "¡Hola! 🔧 Listos para resolver tus dudas técnicas.",
            "¡Bienvenido! 💡 Especializado en Variadores y Control.",
            "¡Saludos! 🎯 Pregúntame sobre CFW500 y bombeo solar.",
            "¡Hola! 🚀 Aquí para dominar juntos el VFD.",
            "¡Bienvenido! ⚙️ Tu socio técnico en VFD."
        ];

        this.greetingColors = ['#01F78A', '#0194F2', '#8E3EBD', '#FF6B9D', '#00D9FF', '#FFD700', '#FF8C42', '#FF1493'];
        this.messageColors = ['#01F78A', '#0194F2', '#8E3EBD', '#FF6B9D', '#00D9FF', '#FFD700', '#FF8C42', '#FF1493'];
        
        document.addEventListener('DOMContentLoaded', () => this.init());
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        this.createChatbotHTML();
        this.attachEventListeners();
        this.setupSpeechRecognition();
        this.restoreMessages();
        
        if (this.isOpen) {
            this.show();
        }
    }

    createChatbotHTML() {
        const container = document.createElement('div');
        container.id = 'vfd-chatbot-container';
        container.innerHTML = `
            <div class="vfd-chatbot-widget">
                <!-- Botón Toggle -->
                <button class="vfd-chatbot-toggle" id="vfdChatToggle" title="Abrir/Cerrar Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="vfd-badge" id="vfdBadge">IA</span>
                </button>

                <!-- Ventana del Chat -->
                <div class="vfd-chatbot-window" id="vfdChatWindow">
                    <!-- Header -->
                    <div class="vfd-chatbot-header" id="vfdChatHeader">
                        <div class="vfd-header-content">
                            <div class="vfd-header-title">
                                <h6>Asistente Técnico VFD</h6>
                                <small>Powered by OpenAI</small>
                            </div>
                            <div class="vfd-header-actions">
                                <!-- Botones de Zoom -->
                                <button class="vfd-icon-btn" id="vfdZoomMinus" title="Reducir letra">
                                    <span>−</span>
                                </button>
                                <button class="vfd-icon-btn" id="vfdZoomPlus" title="Aumentar letra">
                                    <span>+</span>
                                </button>
                                <!-- Cerrar -->
                                <button class="vfd-icon-btn" id="vfdCloseBtn" title="Cerrar">
                                    <span>✕</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Contenedor de Mensajes -->
                    <div class="vfd-chatbot-body" id="vfdChatBody" style="font-size: ${this.fontSize}px;">
                        <div class="vfd-message vfd-welcome-message">
                            <div class="vfd-message-content bot">
                                ${this.getRandomGreeting()}
                            </div>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="vfd-chatbot-input-area">
                        <!-- File Input (Hidden) -->
                        <input type="file" id="vfdFileInput" accept="image/*,.pdf,.doc,.docx,.txt" style="display:none;">
                        
                        <!-- Input Box -->
                        <div class="vfd-input-container">
                            <input type="text" id="vfdChatInput" class="vfd-input" placeholder="Escribe tu pregunta...">
                            <button class="vfd-send-btn" id="vfdSendBtn" title="Enviar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5950899 3.34915502,10.7521873 3.50612381,10.7521873 L16.6915026,11.5376742 C16.6915026,11.5376742 17.1624089,11.5376742 17.1624089,12.0089664 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Action Buttons -->
                        <div class="vfd-actions-row">
                            <!-- Micrófono -->
                            <button class="vfd-action-btn" id="vfdMicBtn" title="Grabar pregunta">
                                <span>🎤</span>
                            </button>
                            <!-- Adjuntar Archivo -->
                            <button class="vfd-action-btn" id="vfdAttachBtn" title="Adjuntar archivo/imagen">
                                <span>📎</span>
                            </button>
                            <!-- TTS Play/Stop -->
                            <button class="vfd-action-btn" id="vfdTTSBtn" title="Leer en voz alta">
                                <span>🔊</span>
                            </button>
                            <!-- Copiar -->
                            <button class="vfd-action-btn" id="vfdCopyBtn" title="Copiar último mensaje">
                                <span>📋</span>
                            </button>
                            <!-- Historial -->
                            <button class="vfd-action-btn" id="vfdHistoryBtn" title="Ver conversación">
                                <span>📜</span>
                            </button>
                            <!-- Limpiar -->
                            <button class="vfd-action-btn" id="vfdClearBtn" title="Limpiar chat">
                                <span>🗑️</span>
                            </button>
                        </div>

                        <!-- Indicador de carga -->
                        <div class="vfd-typing-indicator" id="vfdTyping" style="display:none;">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('vfdChatToggle');
        const closeBtn = document.getElementById('vfdCloseBtn');
        const sendBtn = document.getElementById('vfdSendBtn');
        const input = document.getElementById('vfdChatInput');
        const micBtn = document.getElementById('vfdMicBtn');
        const attachBtn = document.getElementById('vfdAttachBtn');
        const ttsBtn = document.getElementById('vfdTTSBtn');
        const copyBtn = document.getElementById('vfdCopyBtn');
        const clearBtn = document.getElementById('vfdClearBtn');
        const zoomPlus = document.getElementById('vfdZoomPlus');
        const zoomMinus = document.getElementById('vfdZoomMinus');
        const fileInput = document.getElementById('vfdFileInput');
        const header = document.getElementById('vfdChatHeader');

        // Toggle
        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.hide());

        // Enviar mensaje
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Micrófono
        micBtn.addEventListener('click', () => this.startListening());

        // Adjuntar archivo
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // TTS
        ttsBtn.addEventListener('click', () => this.toggleTTS());

        // Copiar
        copyBtn.addEventListener('click', () => this.copyLastMessage());

        // Limpiar
        clearBtn.addEventListener('click', () => this.clearChat());

        // Zoom
        zoomPlus.addEventListener('click', () => this.zoomIn());
        zoomMinus.addEventListener('click', () => this.zoomOut());

        // Drag
        header.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        // Cerrar al hacer Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        const window = document.getElementById('vfdChatWindow');
        window.style.display = 'flex';
        this.isOpen = true;
        localStorage.setItem('vfdChatOpen', 'true');
    }

    hide() {
        const window = document.getElementById('vfdChatWindow');
        window.style.display = 'none';
        this.isOpen = false;
        localStorage.setItem('vfdChatOpen', 'false');
    }

    addMessage(text, sender, customColor = null) {
        const body = document.getElementById('vfdChatBody');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'vfd-message';
        
        const color = customColor || (sender === 'bot' ? this.getRandomColor(this.messageColors) : null);
        const style = color ? `color: ${color};` : '';
        
        messageDiv.innerHTML = `
            <div class="vfd-message-content ${sender}" style="${style}">
                ${this.escapeHtml(text)}
            </div>
        `;
        
        body.appendChild(messageDiv);
        body.scrollTop = body.scrollHeight;
        
        this.messages.push({ text, sender, color });
        this.saveMessages();
    }

    async sendMessage() {
        const input = document.getElementById('vfdChatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(data.message, 'bot');
            } else {
                this.addMessage(`Error: ${data.error || 'Error desconocido'}`, 'bot');
            }
        } catch (error) {
            this.addMessage('Disculpa, hubo un error. Intenta de nuevo.', 'bot');
        }
        
        this.hideTypingIndicator();
    }

    showTypingIndicator() {
        const indicator = document.getElementById('vfdTyping');
        indicator.style.display = 'flex';
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('vfdTyping');
        indicator.style.display = 'none';
    }

    startListening() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz');
            return;
        }
        
        this.recognition.start();
        document.getElementById('vfdMicBtn').classList.add('active');
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        
        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('vfdChatInput').value = transcript;
        };
        
        this.recognition.onend = () => {
            document.getElementById('vfdMicBtn').classList.remove('active');
        };
    }

    toggleTTS() {
        const lastMessage = this.messages.filter(m => m.sender === 'bot').pop();
        if (!lastMessage) return;
        
        if (this.isSpeaking) {
            this.stopTTS();
        } else {
            this.speakMessage(lastMessage.text);
        }
    }

    speakMessage(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            
            utterance.onstart = () => {
                this.isSpeaking = true;
                document.getElementById('vfdTTSBtn').classList.add('active');
            };
            
            utterance.onend = () => {
                this.stopTTS();
            };
            
            this.utterance = utterance;
            speechSynthesis.speak(utterance);
        }
    }

    stopTTS() {
        speechSynthesis.cancel();
        this.isSpeaking = false;
        document.getElementById('vfdTTSBtn').classList.remove('active');
    }

    copyLastMessage() {
        const lastMessage = this.messages.filter(m => m.sender === 'bot').pop();
        if (!lastMessage) return;
        
        navigator.clipboard.writeText(lastMessage.text).then(() => {
            const btn = document.getElementById('vfdCopyBtn');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>✓</span>';
            setTimeout(() => { btn.innerHTML = original; }, 2000);
        });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const filename = file.name;
            this.addMessage(`📎 Archivo: ${filename}`, 'user');
        };
        reader.readAsDataURL(file);
    }

    clearChat() {
        if (confirm('¿Limpiar todo el historial de conversación?')) {
            document.getElementById('vfdChatBody').innerHTML = `
                <div class="vfd-message vfd-welcome-message">
                    <div class="vfd-message-content bot">
                        ${this.getRandomGreeting()}
                    </div>
                </div>
            `;
            this.messages = [];
            localStorage.removeItem('vfdChatHistory');
        }
    }

    zoomIn() {
        if (this.fontSize < 200) {
            this.fontSize += 10;
            this.updateFontSize();
        }
    }

    zoomOut() {
        if (this.fontSize > 60) {
            this.fontSize -= 10;
            this.updateFontSize();
        }
    }

    updateFontSize() {
        document.getElementById('vfdChatBody').style.fontSize = this.fontSize + 'px';
        localStorage.setItem('vfdChatFontSize', this.fontSize);
    }

    saveMessages() {
        localStorage.setItem('vfdChatHistory', JSON.stringify(this.messages));
    }

    restoreMessages() {
        if (this.conversationHistory.length > 0) {
            const body = document.getElementById('vfdChatBody');
            body.innerHTML = '';
            
            this.conversationHistory.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'vfd-message';
                const style = msg.color ? `color: ${msg.color};` : '';
                messageDiv.innerHTML = `
                    <div class="vfd-message-content ${msg.sender}" style="${style}">
                        ${this.escapeHtml(msg.text)}
                    </div>
                `;
                body.appendChild(messageDiv);
            });
            
            body.scrollTop = body.scrollHeight;
        }
    }

    startDrag(e) {
        if (e.target.closest('.vfd-chatbot-header')) {
            this.isDragging = true;
            const chatWindow = document.getElementById('vfdChatWindow');
            const rect = chatWindow.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
        }
    }

    drag(e) {
        if (!this.isDragging) return;
        
        const chatWindow = document.getElementById('vfdChatWindow');
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        chatWindow.style.left = x + 'px';
        chatWindow.style.top = y + 'px';
    }

    stopDrag() {
        this.isDragging = false;
    }

    getRandomGreeting() {
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        const color = this.getRandomColor(this.greetingColors);
        return `<span style="color: ${color};">${greeting}</span>`;
    }

    getRandomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando esté listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.vfdChatBot = new VFDChatBot();
    });
} else {
    window.vfdChatBot = new VFDChatBot();
}
