# Robinson Controles VFD - Plataforma de Cursos Online

Especialización completa en Programación de Variadores de Frecuencia WEG CFW500.

## 🚀 Instalación Rápida

### Requisitos
- Python 3.8+
- pip
- Virtual Environment

### Pasos

1. **Clonar o descargar el proyecto:**
```bash
cd robinson-controles-vdf
```

2. **Crear ambiente virtual:**
```bash
python -m venv venv
```

3. **Activar ambiente virtual:**

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

4. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno:**
```bash
# Copiar archivo ejemplo
cp .env.example .env

# Editar .env con tus credenciales
```

6. **Ejecutar la aplicación:**
```bash
python app.py
```

La aplicación estará disponible en: `http://localhost:5000`

## 📁 Estructura del Proyecto

```
robinson-controles-vdf/
├── app.py                 # Aplicación principal
├── config.py              # Configuración de la app
├── requirements.txt       # Dependencias
├── .env.example           # Variables de entorno (ejemplo)
├── .gitignore             # Archivos ignorados por Git
├── Procfile               # Para despliegue en Heroku/SG
├── templates/             # Plantillas HTML
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── modulo.html
│   └── course_dashboard.html
└── static/                # Archivos estáticos
    └── css/
        └── style.css
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con Werkzeug
- ✅ Variables de entorno para credenciales
- ✅ CSRF protection con Flask
- ✅ SQLAlchemy para prevenir SQL injection
- ✅ `.gitignore` para proteger archivos sensibles

## 🌐 Despliegue en SG

### Pasos para subir a SG (Shared Hosting):

1. **Preparar archivos:**
```bash
# Asegurar que .env NO se sube
# Crear archivo .env en el servidor manualmente
```

2. **Subir vía SCP o FTP:**
```bash
scp -r * usuario@servidor:/ruta/publica/
```

3. **En el servidor SG:**
```bash
# Entrar al servidor
ssh usuario@servidor

# Crear venv
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
nano .env
# Pegar configuración necesaria

# Ejecutar con gunicorn
gunicorn app:app --bind 0.0.0.0:8000
```

4. **Configurar Apache/Nginx:**
Ver archivo `Procfile` para referencia.

## 📚 Módulos del Curso

12 módulos completos sobre:
1. Introducción a los VFD
2. Función de un VFD
3. Principios de Funcionamiento
4. Diferencia VFD y Soft Start
5. Aplicaciones de VFD
6. Programación Básica CFW500
7. Bombeo Solar con VFD
8. Sistema de Presión Constante
9. Resistencia de Frenado
10. Control por Comunicación
11. Control Vectorial
12. Ventajas del uso de VFD

## 🛠️ Tecnologías

- Flask 3.0.0
- SQLAlchemy 2.0
- SQLite/PostgreSQL
- Bootstrap 5.3
- Python 3.8+

## ⚠️ Notas Importantes

- **CAMBIAR SECRET_KEY en producción** antes de desplegar
- **NUNCA commitear .env** a Git
- **Usar HTTPS** en producción
- **Configurar SMTP** para emails de verificación

## 📞 Soporte

Para dudas o reportes de bugs, contactar al equipo de Robinson Controles.

---
**Última actualización:** 2026-06-05
