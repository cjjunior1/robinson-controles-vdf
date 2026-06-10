/**
 * VFD AI Chatbot
 * - Persistente en todas las páginas · paleta oscura propia (no se cambian colores)
 * - Botón flotante: abre/cierra y devuelve la ventana a su lugar
 * - Header: 🎤 Hablar · A-/A+ (60-200, default 100) · un solo botón Maximizar/Minimizar · X
 * - Por mensaje del bot: Escuchar (TTS) y Copiar
 * - Adjuntar archivo · Ventana arrastrable (puede salir de pantalla)
 * - Toggle Claro/Oscuro de la página (botón a la derecha)
 */

class VFDChatBot {
    constructor() {
        this.isInitialized = false;
        this.isOpen = localStorage.getItem('vfdChatOpen') === 'true';
        this.messages = JSON.parse(localStorage.getItem('vfdChatHistory')) || [];
        this.fontSize = parseInt(localStorage.getItem('vfdChatFont')) || 100; // 60-200
        this.isMaximized = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.readingId = null;
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.applyStoredTheme();
        this.createThemeToggle();
        this.createChatbotHTML();
        this.attachEventListeners();
        this.setupSpeechRecognition();
        this.applyFontSize();

        if (this.messages.length) this.renderAllMessages();
        else this.addMessage(this.buildGreeting(), 'bot', false);

        if (this.isOpen) this.show(); else this.hide();
    }

    /* ---------- Tema claro/oscuro de la página ---------- */
    applyStoredTheme() {
        if (localStorage.getItem('vfdTheme') === 'dark') document.documentElement.classList.add('vfd-dark');
    }
    createThemeToggle() {
        const btn = document.createElement('button');
        btn.id = 'vfd-theme-toggle';
        btn.type = 'button';
        btn.title = 'Cambiar tema claro/oscuro de la página';

        // Íconos de líneas finas (elegantes y nítidos)
        const sunIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4.2"></circle>
                <line x1="12" y1="2.5" x2="12" y2="5"></line>
                <line x1="12" y1="19" x2="12" y2="21.5"></line>
                <line x1="2.5" y1="12" x2="5" y2="12"></line>
                <line x1="19" y1="12" x2="21.5" y2="12"></line>
                <line x1="5.1" y1="5.1" x2="6.9" y2="6.9"></line>
                <line x1="17.1" y1="17.1" x2="18.9" y2="18.9"></line>
                <line x1="5.1" y1="18.9" x2="6.9" y2="17.1"></line>
                <line x1="17.1" y1="6.9" x2="18.9" y2="5.1"></line>
            </svg>`;
        const moonIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>
            </svg>`;

        // En oscuro mostramos el sol (para volver a claro); en claro, la luna.
        const setIcon = (dark) => { btn.innerHTML = dark ? sunIcon : moonIcon; };
        setIcon(document.documentElement.classList.contains('vfd-dark'));

        btn.addEventListener('click', () => {
            const dark = document.documentElement.classList.toggle('vfd-dark');
            localStorage.setItem('vfdTheme', dark ? 'dark' : 'light');
            setIcon(dark);
        });
        document.body.appendChild(btn);
    }

    /* ---------- HTML ---------- */
    createChatbotHTML() {
        const c = document.createElement('div');
        c.id = 'vfd-chatbot-container';
        c.innerHTML = `
            <button class="vfd-chatbot-toggle" id="vfdChatToggle" type="button" title="Abrir / cerrar asistente">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="vfd-badge">IA</span>
            </button>

            <div class="vfd-chatbot-window vfd-hidden" id="vfdChatWindow">
                <div class="vfd-chatbot-header" id="vfdChatHeader">
                    <div class="vfd-header-top">
                        <div class="vfd-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="8" width="18" height="12" rx="3"></rect>
                                <path d="M12 8V4M8 14h.01M16 14h.01"></path>
                            </svg>
                        </div>
                        <div class="vfd-header-title">
                            <h6>Robin</h6>
                            <small>Asistente Técnico VFD · En línea</small>
                        </div>
                    </div>
                    <div class="vfd-header-controls">
                        <button class="vfd-mic-btn" id="vfdMicBtn" type="button" title="Hablar">🎤 <span id="vfdMicLabel">Hablar</span></button>
                        <div class="vfd-controls-right">
                            <div class="vfd-font-control">
                                <button id="vfdFontMinus" type="button" title="Reducir letra">A−</button>
                                <span id="vfdFontVal">100%</span>
                                <button id="vfdFontPlus" type="button" title="Aumentar letra">A+</button>
                            </div>
                            <button class="vfd-icon-btn" id="vfdMaxBtn" type="button" title="Maximizar / Minimizar">⤢</button>
                            <button class="vfd-icon-btn vfd-close" id="vfdCloseBtn" type="button" title="Cerrar">✕</button>
                        </div>
                    </div>
                </div>

                <div class="vfd-chatbot-body" id="vfdChatBody"></div>

                <div class="vfd-chatbot-input-area">
                    <input type="file" id="vfdFileInput" accept="image/*,.pdf,.doc,.docx,.txt" style="display:none;">
                    <button class="vfd-attach-btn" id="vfdAttachBtn" type="button">📎 Adjuntar archivo</button>
                    <div class="vfd-input-container">
                        <input type="text" id="vfdChatInput" class="vfd-input" placeholder="Escribe tu pregunta...">
                        <button class="vfd-send-btn" id="vfdSendBtn" type="button" title="Enviar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"></path></svg>
                        </button>
                    </div>
                    <div class="vfd-typing-indicator" id="vfdTyping" style="display:none;">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(c);
    }

    attachEventListeners() {
        const $ = (id) => document.getElementById(id);

        $('vfdChatToggle').addEventListener('click', () => this.toggleChat());
        $('vfdCloseBtn').addEventListener('click', () => this.hide());
        $('vfdMaxBtn').addEventListener('click', () => this.toggleMaximize());

        $('vfdFontMinus').addEventListener('click', () => this.changeFont(-10));
        $('vfdFontPlus').addEventListener('click', () => this.changeFont(10));

        $('vfdSendBtn').addEventListener('click', () => this.sendMessage());
        $('vfdChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
        });

        $('vfdMicBtn').addEventListener('click', () => this.toggleMic());
        $('vfdAttachBtn').addEventListener('click', () => $('vfdFileInput').click());
        $('vfdFileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        const header = $('vfdChatHeader');
        header.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }

    /* ---------- Abrir / cerrar / maximizar ---------- */
    toggleChat() { this.isOpen ? this.hide() : this.show(); }

    show() {
        this.clearInlinePosition();           // vuelve a su lugar (abajo-derecha)
        document.getElementById('vfdChatWindow').classList.remove('vfd-hidden');
        this.isOpen = true;
        localStorage.setItem('vfdChatOpen', 'true');
    }
    hide() {
        document.getElementById('vfdChatWindow').classList.add('vfd-hidden');
        this.isOpen = false;
        localStorage.setItem('vfdChatOpen', 'false');
    }

    toggleMaximize() {
        const win = document.getElementById('vfdChatWindow');
        this.isMaximized = !this.isMaximized;
        win.classList.toggle('vfd-maximized', this.isMaximized);
        if (this.isMaximized) this.clearInlinePosition();
        document.getElementById('vfdMaxBtn').textContent = this.isMaximized ? '⤡' : '⤢';
    }

    /* ---------- Tamaño de letra (60-200, default 100) ---------- */
    changeFont(delta) {
        this.fontSize = Math.min(200, Math.max(60, this.fontSize + delta));
        this.applyFontSize();
        localStorage.setItem('vfdChatFont', this.fontSize);
    }
    applyFontSize() {
        document.getElementById('vfdChatBody').style.fontSize = (13 * this.fontSize / 100) + 'px';
        document.getElementById('vfdFontVal').textContent = this.fontSize + '%';
    }

    /* ---------- Arrastre (movilidad) ---------- */
    startDrag(e) {
        if (e.target.closest('button')) return;
        const win = document.getElementById('vfdChatWindow');
        // Movible también cuando está maximizado
        this.isDragging = true;
        const r = win.getBoundingClientRect();
        this.dragOffset.x = e.clientX - r.left;
        this.dragOffset.y = e.clientY - r.top;
        e.preventDefault();
    }
    drag(e) {
        if (!this.isDragging) return;
        const win = document.getElementById('vfdChatWindow');
        win.style.left = (e.clientX - this.dragOffset.x) + 'px';
        win.style.top = (e.clientY - this.dragOffset.y) + 'px';
        win.style.right = 'auto';
        win.style.bottom = 'auto';
    }
    stopDrag() { this.isDragging = false; }
    clearInlinePosition() {
        const win = document.getElementById('vfdChatWindow');
        win.style.left = win.style.top = win.style.right = win.style.bottom = '';
    }

    /* ---------- Mensajes ---------- */
    buildGreeting() {
        const h = new Date().getHours();
        const saludo = h < 6 ? 'Buenas noches' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
        const frases = [
            'Pregúntame sobre VFD, CFW500, bombeo solar o electricidad.',
            '¿Listo para resolver dudas de variadores y control de motores?',
            'Estoy aquí para ayudarte con tus dudas técnicas de VFD.',
            'Consúltame sobre programación del CFW500 o sistemas de presión.'
        ];
        return `${saludo} 👋 Soy Robin, tu Asistente Técnico VFD. ${frases[Math.floor(Math.random() * frases.length)]}`;
    }

    addMessage(text, sender, save = true) {
        const msg = { id: Date.now().toString() + Math.random().toString(16).slice(2), text, sender };
        document.getElementById('vfdChatBody').appendChild(this.renderMessage(msg));
        this.scrollToBottom();
        if (save) { this.messages.push(msg); this.saveMessages(); }
        return msg;
    }

    renderAllMessages() {
        const body = document.getElementById('vfdChatBody');
        body.innerHTML = '';
        this.messages.forEach(m => body.appendChild(this.renderMessage(m)));
        this.scrollToBottom();
    }

    renderMessage(msg) {
        const wrap = document.createElement('div');
        wrap.className = 'vfd-message ' + msg.sender;

        if (msg.sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'vfd-avatar';
            avatar.textContent = '🤖';
            wrap.appendChild(avatar);
        }

        const bubble = document.createElement('div');
        bubble.className = 'vfd-bubble';

        const textDiv = document.createElement('div');
        textDiv.textContent = msg.text;
        bubble.appendChild(textDiv);

        if (msg.sender === 'bot') {
            const actions = document.createElement('div');
            actions.className = 'vfd-msg-actions';

            const listen = document.createElement('button');
            listen.type = 'button';
            listen.className = 'vfd-msg-btn listen';
            listen.innerHTML = '▶ Escuchar';
            listen.addEventListener('click', () => this.toggleListen(msg, listen));

            const copy = document.createElement('button');
            copy.type = 'button';
            copy.className = 'vfd-msg-btn copy';
            copy.innerHTML = '📋 Copiar';
            copy.addEventListener('click', () => this.copyText(msg.text, copy));

            actions.appendChild(listen);
            actions.appendChild(copy);
            bubble.appendChild(actions);
        }

        wrap.appendChild(bubble);
        return wrap;
    }

    scrollToBottom() {
        const body = document.getElementById('vfdChatBody');
        body.scrollTop = body.scrollHeight;
    }

    async sendMessage(text) {
        const input = document.getElementById('vfdChatInput');
        const message = (text || input.value).trim();
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';
        this.showTyping();

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            this.addMessage(data.success ? data.message : `Error: ${data.error || 'Error desconocido'}`, 'bot');
        } catch (e) {
            this.addMessage('Disculpa, hubo un error de conexión. Intenta de nuevo.', 'bot');
        }
        this.hideTyping();
    }

    showTyping() { document.getElementById('vfdTyping').style.display = 'flex'; }
    hideTyping() { document.getElementById('vfdTyping').style.display = 'none'; }

    /* ---------- Voz (Hablar) ---------- */
    setupSpeechRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { this.recognition = null; return; }
        this.recognition = new SR();
        this.recognition.lang = 'es-ES';
        this.recognition.interimResults = true;
        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            document.getElementById('vfdChatInput').value = transcript;
            if (event.results[event.results.length - 1].isFinal) {
                this.stopMic();
                this.sendMessage(transcript);
            }
        };
        this.recognition.onerror = () => this.stopMic();
        this.recognition.onend = () => this.stopMic();
    }
    toggleMic() {
        if (!this.recognition) { alert('Tu navegador no soporta reconocimiento de voz'); return; }
        if (this.isRecording) { this.recognition.stop(); this.stopMic(); }
        else {
            try { this.recognition.start(); this.isRecording = true; document.getElementById('vfdMicBtn').classList.add('active'); document.getElementById('vfdMicLabel').textContent = 'Detener'; }
            catch (e) { /* ya activo */ }
        }
    }
    stopMic() {
        this.isRecording = false;
        const btn = document.getElementById('vfdMicBtn');
        if (btn) { btn.classList.remove('active'); document.getElementById('vfdMicLabel').textContent = 'Hablar'; }
    }

    /* ---------- Escuchar (TTS) por mensaje ---------- */
    toggleListen(msg, btn) {
        if (this.readingId === msg.id) { this.stopTTS(); return; }
        this.stopTTS();
        if (!('speechSynthesis' in window)) return;
        const u = new SpeechSynthesisUtterance(msg.text);
        u.lang = 'es-ES';
        u.rate = 0.97;
        u.onend = () => this.stopTTS();
        this.readingId = msg.id;
        this.readingBtn = btn;
        btn.innerHTML = '■ Detener';
        speechSynthesis.speak(u);
    }
    stopTTS() {
        speechSynthesis.cancel();
        if (this.readingBtn) this.readingBtn.innerHTML = '▶ Escuchar';
        this.readingId = null;
        this.readingBtn = null;
    }

    /* ---------- Copiar ---------- */
    copyText(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '✓ Copiado';
            setTimeout(() => { btn.innerHTML = orig; }, 1500);
        });
    }

    /* ---------- Adjuntar archivo ---------- */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.addMessage(`📎 Archivo: ${file.name}`, 'user');
        event.target.value = '';
    }

    saveMessages() { localStorage.setItem('vfdChatHistory', JSON.stringify(this.messages)); }
}

(function () {
    const start = () => { window.vfdChatBot = new VFDChatBot(); window.vfdChatBot.init(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
