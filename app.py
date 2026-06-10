import os 
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from config import config
from openai import OpenAI
from manual_search import cargar_manual, contexto_para_prompt

app = Flask(__name__)
app.config.from_object(config[os.environ.get('FLASK_ENV', 'development')])

db = SQLAlchemy(app)

class User(db.Model):
    """Modelo de Usuario con autenticación segura"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    whatsapp = db.Column(db.String(20), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    def set_password(self, password):
        """Hash la contraseña antes de guardar"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica si la contraseña es correcta"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'

with app.app_context():
    db.create_all()

# Cargar el Manual de Usuario en memoria al arrancar (para el bot y la página)
cargar_manual()

# Contenido específico de cada módulo
temas = [
    {
        "id": 1,
        "titulo": "Introducción a los VFD",
        "descripcion": "Un Variador de Frecuencia (VFD) es un dispositivo electrónico que controla la velocidad de un motor eléctrico variando la frecuencia y el voltaje de alimentación.",
        "objetivos": [
            "Conocer qué es un Variador de Frecuencia",
            "Identificar las partes principales de un VFD",
            "Entender la diferencia entre VFD y arranque directo"
        ],
        "imagen": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 2,
        "titulo": "Función de un VFD",
        "descripcion": "El VFD convierte la corriente alterna de entrada en corriente continua y luego la reconvierte en corriente alterna con frecuencia y voltaje variables para controlar la velocidad del motor.",
        "objetivos": [
            "Comprender la conversión AC-DC-AC",
            "Identificar las etapas de rectificación, filtrado e inversión",
            "Conocer los componentes internos del VFD"
        ],
        "imagen": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 3,
        "titulo": "Principios de Funcionamiento",
        "descripcion": "El principio fundamental se basa en la relación entre frecuencia y velocidad del motor: N = (120 × f) / P, donde N es RPM, f es frecuencia y P es número de polos.",
        "objetivos": [
            "Entender la relación frecuencia-velocidad",
            "Conocer el control V/f (Voltaje/Frecuencia)",
            "Comprender el PWM (Modulación por Ancho de Pulso)"
        ],
        "imagen": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 4,
        "titulo": "Diferencia entre VFD y Soft Start",
        "descripcion": "El Soft Start solo controla el voltaje durante el arranque para reducir la corriente inicial, mientras que el VFD controla tanto frecuencia como voltaje permitiendo variar la velocidad continuamente.",
        "objetivos": [
            "Diferenciar arranque suave vs control de velocidad",
            "Identificar cuándo usar cada tecnología",
            "Comparar costos y aplicaciones"
        ],
        "imagen": "https://images.unsplash.com/photo-1565514020179-026b92b2d0b5?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 5,
        "titulo": "Aplicaciones de VFD y Soft Start",
        "descripcion": "Los VFD se usan en bombas, ventiladores, compresores, cintas transportadoras y máquinas herramientas. Los Soft Start se aplican en bombas, compresores y molinos donde solo se necesita control de arranque.",
        "objetivos": [
            "Identificar aplicaciones típicas de VFD",
            "Conocer aplicaciones de Soft Start",
            "Seleccionar la tecnología adecuada según la aplicación"
        ],
        "imagen": "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 6,
        "titulo": "Programación Básica de VFD (CFW500)",
        "descripcion": "El WEG CFW500 se programa mediante su keypad HMI o por software. Los parámetros se organizan en grupos P0000 a P9999 para configurar entradas, salidas, rampas y protecciones.",
        "objetivos": [
            "Navegar por el Keypad HMI del CFW500",
            "Configurar parámetros básicos (P0000 a P0200)",
            "Configurar entradas y salidas digitales"
        ],
        "imagen": "https://images.unsplash.com/photo-1555664424-778a69022365?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 7,
        "titulo": "Bombeo Solar con VFD",
        "descripcion": "Los VFD para bombeo solar convierten la energía DC de los paneles solares en AC para alimentar la bomba. El CFW500 tiene función MPPT integrada para maximizar la energía solar captada.",
        "objetivos": [
            "Entender el principio del bombeo solar",
            "Configurar el modo MPPT en el CFW500",
            "Dimensionar paneles y bomba correctamente"
        ],
        "imagen": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 8,
        "titulo": "Sistema de Presión Constante con VFD",
        "descripcion": "Usando un sensor de presión (transductor 4-20mA) y el control PID interno del CFW500, se mantiene la presión constante en sistemas de bombeo variando la velocidad del motor automáticamente.",
        "objetivos": [
            "Configurar el control PID del CFW500",
            "Conectar el transductor de presión",
            "Ajustar parámetros P, I y D del controlador"
        ],
        "imagen": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 9,
        "titulo": "Resistencia de Frenado: Cuándo utilizarlas",
        "descripcion": "Las resistencias de frenado disipan la energía regenerativa que genera el motor al desacelerar cargas inerciales. Son necesarias en aplicaciones con paradas rápidas o cargas descendentes.",
        "objetivos": [
            "Entender el frenado regenerativo",
            "Calcular la resistencia de frenado necesaria",
            "Configurar los parámetros de frenado en el CFW500"
        ],
        "imagen": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 10,
        "titulo": "Controlar un VFD por Comunicación",
        "descripcion": "El CFW500 soporta Modbus RTU (RS485) y puede conectarse a PLCs, HMIs o sistemas SCADA. Permite control remoto, monitoreo de parámetros y diagnóstico en tiempo real.",
        "objetivos": [
            "Configurar Modbus RTU en el CFW500",
            "Conectar el VFD a un PLC o computadora",
            "Leer y escribir parámetros vía comunicación"
        ],
        "imagen": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 11,
        "titulo": "Control Vectorial en VFD",
        "descripcion": "El control vectorial (o de campo orientado) permite control preciso de torque y velocidad incluso a bajas RPM, separando las componentes de corriente de magnetización y torque del motor.",
        "objetivos": [
            "Entender la diferencia entre control V/f y vectorial",
            "Configurar el modo vectorial en el CFW500",
            "Realizar la auto-sintonización del motor"
        ],
        "imagen": "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": 12,
        "titulo": "Ventajas del uso de VFD",
        "descripcion": "Los VFD ofrecen ahorro energético (hasta 60% en bombas y ventiladores), control preciso de velocidad, arranque suave, protección del motor, y reducción de estrés mecánico en el sistema.",
        "objetivos": [
            "Calcular el ahorro energético con VFD",
            "Identificar beneficios operativos",
            "Justificar la inversión en VFD para proyectos"
        ],
        "imagen": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        whatsapp = request.form.get('whatsapp', '').strip()
        
        # Validación
        if not all([name, email, password, whatsapp]):
            flash('Todos los campos son obligatorios.', 'error')
            return redirect(url_for('register'))
        
        if len(password) < 6:
            flash('La contraseña debe tener al menos 6 caracteres.', 'error')
            return redirect(url_for('register'))
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            flash('Este email ya está registrado.', 'error')
            return redirect(url_for('register'))
        
        # Crear nuevo usuario
        try:
            new_user = User(name=name, email=email, whatsapp=whatsapp)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            flash('¡Registro exitoso! Por favor inicia sesión.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash('Error al registrar. Intenta de nuevo.', 'error')
            return redirect(url_for('register'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        
        if not email or not password:
            flash('Email y contraseña son obligatorios.', 'error')
            return redirect(url_for('login'))
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['user_name'] = user.name
            flash(f'¡Bienvenido, {user.name}!', 'success')
            return redirect(url_for('course_dashboard'))
        else:
            flash('Email o contraseña incorrectos.', 'error')
            return redirect(url_for('login'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Sesión cerrada.', 'success')
    return redirect(url_for('index'))

@app.route('/modulo/<int:modulo_id>')
def modulo(modulo_id):
    if modulo_id < 1 or modulo_id > 12:
        return redirect(url_for('modulo', modulo_id=1))
    
    modulo_actual = temas[modulo_id - 1]
    modulo_anterior = modulo_id - 1 if modulo_id > 1 else None
    modulo_siguiente = modulo_id + 1 if modulo_id < 12 else None
    progreso = int(((modulo_id - 1) / 12) * 100)
    
    return render_template('modulo.html', 
                         modulo=modulo_actual, 
                         temas=temas, 
                         modulo_anterior=modulo_anterior,
                         modulo_siguiente=modulo_siguiente,
                         progreso=progreso)

@app.route('/manual')
def manual():
    """Página 'Manual de Usuario' del WEG CFW500 (contenido del PDF)."""
    data = cargar_manual()
    return render_template('manual.html',
                           titulo=data['title'],
                           paginas=data['pages'],
                           total=data.get('total_pages', len(data['pages'])))

@app.route('/dashboard')
def course_dashboard():
    if 'user_id' not in session:
        flash('Debes iniciar sesión primero.', 'error')
        return redirect(url_for('login'))
    return redirect(url_for('modulo', modulo_id=1))

# ============ CHATBOT CON IA ============

# Cliente OpenAI se inicializará en la función chatbot cuando se necesite
client = None

SYSTEM_PROMPT = """Eres Robin, un asistente técnico experto en electricidad, electrónica, física, matemática y especialmente en Variadores de Frecuencia (VFD), arrancadores suave, bombas y bombeo con paneles solares. Si te preguntan tu nombre, eres Robin.

TEMAS PERMITIDOS:
- Variadores de Frecuencia (VFD) - CFW500, WEG, funcionamiento, programación
- Control de motores eléctricos
- Bombeo solar con paneles fotovoltaicos
- Sistemas de presión constante
- Arrancadores suave (Soft Start)
- Bombas centrífugas, sumergibles, etc.
- Electricidad (voltaje, corriente, potencia, factor de potencia)
- Electrónica (componentes, circuitos, transistores, tiristores)
- Física (fuerzas, trabajo, energía, rendimiento)
- Matemática aplicada a estas áreas

RESTRICCIONES:
- Solo responde preguntas relacionadas con los temas listados
- Si la pregunta NO está relacionada, di amablemente: "Disculpa, solo puedo ayudarte con temas de VFD, electricidad, electrónica, física, matemática y bombeo. ¿Tienes alguna pregunta sobre estos temas?"
- Respuestas claras, concisas y técnicas
- Usa ejemplos prácticos cuando sea posible
- Sugiere consultar módulos del curso cuando sea relevante

ESTILO:
- Profesional pero amigable
- Técnico pero accesible
- Máximo 3-4 párrafos por respuesta
- Incluye fórmulas cuando sea necesario

MANUAL DE USUARIO (MUY IMPORTANTE):
- Tienes acceso al Manual de Usuario del WEG CFW500. Cuando la pregunta esté
  relacionada, recibirás fragmentos del manual; cada uno empieza con su ubicación,
  por ejemplo: [Página 96 del visor (ref. manual 8-1)].
- Responde SIEMPRE basándote en esos fragmentos. NO inventes valores, códigos ni páginas.
- Cuando te pregunten por un parámetro, comando o función, usa EXACTAMENTE este formato:
  • Parámetro/Comando: <código y nombre, ej. P0202 – Tipo de Control>
  • Función: <qué hace; incluye opciones/rango y ajuste de fábrica si aparecen>
  • Página: <número de Página del visor> (y la ref. del manual si está, ej. 8-1)
- La "Página del visor" es la que el alumno puede abrir en la sección "Manual de
  Usuario" del sitio; cítala siempre con ese número para que pueda ir directo a ella.
- Sé conciso y certero. Si la información NO está en los fragmentos recibidos, dilo
  claramente ("No lo encuentro en el manual") y nunca inventes la página.
"""

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """Endpoint para comunicación con el chatbot IA"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Mensaje vacío'}), 400
        
        api_key = app.config.get('OPENAI_API_KEY', '').strip()
        if not api_key:
            return jsonify({'error': 'API Key de OpenAI no configurada. Crea un archivo .env con OPENAI_API_KEY.'}), 500
        
        # Inicializar cliente OpenAI
        try:
            openai_client = OpenAI(api_key=api_key)
        except Exception as e:
            return jsonify({'error': f'Error al inicializar OpenAI: {str(e)}'}), 500
        
        # Buscar en el Manual de Usuario los fragmentos relevantes a la pregunta
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        contexto = contexto_para_prompt(user_message, k=6)
        if contexto:
            messages.append({
                "role": "system",
                "content": (
                    "Fragmentos del Manual de Usuario del WEG CFW500 relevantes a la "
                    "pregunta del alumno. Úsalos como fuente principal y cita la página:\n\n"
                    + contexto
                )
            })
        messages.append({"role": "user", "content": user_message})

        # Llamar a OpenAI API (gpt-4o-mini: más preciso siguiendo el manual)
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=700,
            temperature=0.2
        )
        
        bot_message = response.choices[0].message.content
        
        return jsonify({
            'success': True,
            'message': bot_message
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Error en el chatbot: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
