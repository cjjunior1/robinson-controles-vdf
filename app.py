import os from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'clave_secreta_local')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///vfd_course.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)

with app.app_context():
    db.create_all()

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
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        flash('Registro exitoso. (Validación de email pendiente de configurar)', 'success')
        return redirect(url_for('index'))
    return render_template('register.html')

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

@app.route('/dashboard')
def course_dashboard():
    return redirect(url_for('modulo', modulo_id=1))

if __name__ == '__main__':
    app.run(debug=True)
