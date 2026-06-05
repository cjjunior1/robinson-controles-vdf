# Instrucciones de Despliegue en SG (Shared Hosting)

## ✅ Cambios Realizados

### 1. **config.py** 
- ✅ Configuración modular (desarrollo, producción, testing)
- ✅ Variables de entorno para todas las credenciales
- ✅ Eliminadas claves expuestas del código

### 2. **app.py**
- ✅ Importa config.py en lugar de hardcodear valores
- ✅ Modelo User con hashing seguro de contraseñas
- ✅ Autenticación real en `/register` y `/login`
- ✅ Validación de formularios
- ✅ Sesiones con autenticación
- ✅ Ruta `/logout` para cerrar sesión
- ✅ Protección en `/dashboard`

### 3. **requirements.txt**
- ✅ Regenerado en UTF-8 (no UTF-16)
- ✅ Añadido `python-dotenv` para variables de entorno
- ✅ Limpiado de dependencias innecesarias

### 4. **Seguridad**
- ✅ Creado `.gitignore` para proteger archivos sensibles
- ✅ Creado `.env.example` con variables de configuración
- ✅ Creado `README.md` con documentación completa

### 5. **Templates**
- ✅ login.html actualizado para usar campo `email` correcto

---

## 📋 Checklist para Despliegue en SG

### Paso 1: Preparar localmente
```powershell
cd "c:\Users\Usuario\OneDrive\Documentos\Inversor Senoidal\robinson-controles-vdf"

# Crear .env local
Copy-Item .env.example .env

# Editar .env con tus credenciales (abrir con notepad .env)
```

### Paso 2: Subir a SG vía SCP
```powershell
# Crear carpeta en servidor SG
ssh -p 18765 u880-bl0vgcenqidh@ssh.nesuxglobalbusinessrd.com "mkdir -p ~/www/robinsoncontroles.nesuxglobalbusinessrd.com/public_html/venv"

# Subir archivos
scp -i "$env:USERPROFILE\.ssh\sg_key" -P 18765 -r `
  "C:\Users\Usuario\OneDrive\Documentos\Inversor Senoidal\robinson-controles-vdf\*" `
  u880-bl0vgcenqidh@ssh.nesuxglobalbusinessrd.com:~/www/robinsoncontroles.nesuxglobalbusinessrd.com/public_html/

# IMPORTANTE: NO subir .env (contiene credenciales)
```

### Paso 3: En el servidor SG
```bash
# Conectar al servidor
ssh -p 18765 u880-bl0vgcenqidh@ssh.nesuxglobalbusinessrd.com

# Navegar a la carpeta
cd ~/www/robinsoncontroles.nesuxglobalbusinessrd.com/public_html/

# Crear venv
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# CREAR .env con tus credenciales (no uploadear desde local)
nano .env
# Pegar esto y editar:
"""
FLASK_ENV=production
SECRET_KEY=clave-super-segura-aqui
DATABASE_URL=sqlite:///vfd_course.db
OPENAI_API_KEY=tu-clave-aqui
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_contrasena_app
"""

# Probar la aplicación
python3 -c "from app import app; print('✅ Aplicación cargada correctamente')"
```

### Paso 4: Configurar Gunicorn/Apache

**Con Gunicorn:**
```bash
# Instalar gunicorn (ya está en requirements.txt)
pip install gunicorn

# Ejecutar
gunicorn app:app --bind 0.0.0.0:8000 --workers 4
```

**Con Apache (si usa mod_wsgi):**
```bash
# Ver instrucciones en README.md
```

### Paso 5: Probar la aplicación

```bash
# Ver que la BD se creó
ls -la *.db

# Verificar logs
tail -f error.log
```

---

## 🔒 Seguridad en Producción

**ANTES DE DESPLEGAR:**

1. ✅ Cambiar `SECRET_KEY` en `.env` a algo único y fuerte
2. ✅ Usar `HTTPS` en producción (SSL/TLS)
3. ✅ Configurar SMTP para emails de verificación
4. ✅ Usar `FLASK_ENV=production`
5. ✅ Usar PostgreSQL en lugar de SQLite si es posible
6. ✅ Configurar backups de BD automáticos
7. ✅ Activar CSRF protection en formularios

---

## 🐛 Troubleshooting

### Error: `ModuleNotFoundError: No module named 'config'`
→ Asegurar que `config.py` está en la misma carpeta que `app.py`

### Error: `ModuleNotFoundError: No module named 'dotenv'`
→ Ejecutar: `pip install python-dotenv`

### Error: `Database locked`
→ Usar PostgreSQL en lugar de SQLite en producción

### Error: `ImportError: cannot import name 'Config'`
→ Verificar que `config.py` tiene clase `Config`

---

## 📊 Próximas Mejoras

- [ ] Email verification con confirmación
- [ ] Rol de admin para gestionar usuarios
- [ ] Quiz/Exámenes por módulo
- [ ] Sistema de certificados
- [ ] Chatbot con OpenAI API
- [ ] Estadísticas de progreso
- [ ] Envío de recordatorios por WhatsApp
- [ ] Integración con Stripe para pagos

---

**Última actualización:** 2026-06-05  
**Estado:** ✅ Listo para desplegar
