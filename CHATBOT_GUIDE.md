# Guía del Chatbot IA - Robinson Controles VFD

## 🤖 Características del Chatbot

El chatbot integrado en la plataforma está especializado en:
- **Variadores de Frecuencia (VFD)** - Funcionamiento, programación, mantenimiento
- **CFW500** - Parámetros, configuración, troubleshooting
- **Electricidad** - Voltaje, corriente, potencia, factor de potencia
- **Electrónica** - Componentes, circuitos, tiristores
- **Física** - Fuerzas, trabajo, energía, rendimiento
- **Matemática** - Cálculos aplicados a sistemas eléctricos
- **Bombeo Solar** - Paneles solares, MPPT, sistemas de bombeo
- **Arrancadores Suave** - Soft Start, reducción de corriente

---

## 📋 Cómo Usar el Chatbot

### 1. **Abrir el Chatbot**
- Haz clic en el botón flotante **"IA"** en la esquina inferior derecha
- El chatbot se abrirá con un saludo aleatorio y color diferente cada vez

### 2. **Hacer una Pregunta**
- Escribe tu pregunta técnica en el campo de input
- Presiona **Enter** o haz clic en el botón de envío **➤**
- El chatbot responderá en 2-3 segundos

### 3. **Botones de Control**

| Botón | Función |
|-------|---------|
| 🎤 | **Hablar** - Usa reconocimiento de voz (español) |
| 📋 | **Copiar** - Copia el último mensaje del bot al portapapeles |
| 🗑️ | **Limpiar** - Borra todo el historial de chat |
| ✖️ | **Cerrar** - Minimiza o cierra el chatbot |

### 4. **Mover el Chatbot**
- Arrastra la barra de encabezado para mover el chatbot a cualquier lugar
- El chatbot permanecerá en la nueva posición

---

## 💡 Ejemplos de Preguntas

### VFD y CFW500
```
"¿Cómo configurar la velocidad base en el CFW500?"
"¿Cuál es la diferencia entre control V/f y vectorial?"
"¿Cómo habilitar MPPT en un VFD para bombeo solar?"
"¿Qué significa P0100 en el CFW500?"
```

### Electricidad y Electrónica
```
"¿Cómo calcular la potencia en un motor trifásico?"
"¿Qué es el factor de potencia y cómo mejorarlo?"
"¿Cómo funciona un tiristor?"
"¿Cuál es la diferencia entre voltaje AC y DC?"
```

### Bombeo Solar
```
"¿Cómo dimensionar un sistema de bombeo solar?"
"¿Por qué necesito MPPT en bombeo solar?"
"¿Cuántos paneles necesito para una bomba de 2 HP?"
"¿Cómo funciona el sistema de presión constante?"
```

### Arrancadores Suave
```
"¿Cuándo usar un Soft Start vs VFD?"
"¿Cómo reduce corriente el arrancador suave?"
"¿Cuál es el tiempo típico de rampa de arranque?"
```

---

## ⚙️ Configuración del Chatbot

### Variables de Entorno Requeridas

En tu archivo `.env`, asegúrate de tener:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-tu-clave-aqui
```

### Obtener API Key de OpenAI

1. Ve a [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Crea una nueva API Key
3. Copia la clave en tu archivo `.env`
4. **NUNCA** compartas tu API Key

---

## 🎨 Características de Diseño

### Colores Aleatorios
- Cada saludo del chatbot tiene un color diferente
- Los mensajes varían en color según criterios internos
- Colores disponibles: Verde (#01F78A), Azul (#0194F2), Púrpura (#8E3EBD), etc.

### Saludos Diversos
El chatbot tiene 8 saludos diferentes, elegidos aleatoriamente:
1. "¡Hola! Soy tu asistente técnico VFD. ¿Qué necesitas saber?"
2. "¡Bienvenido! Estoy aquí para ayudarte con electricidad y VFD."
3. "¡Hola! Pregúntame sobre CFW500, bombeo solar..."
4. "¡Saludos! Especialista en VFD, arrancadores y bombeo..."
5. Y más...

### Interfaz Interactiva
- Diseño moderno similar a la referencia proporcionada
- Botones intuitivos y bien organizados
- Soporte para arrastrar y mover
- Indicador de escritura mientras el bot procesa

---

## 📊 Historial y Privacidad

- El historial del chatbot se **borra al cerrar la pestaña**
- No se guarda información personal
- Las preguntas se envían a OpenAI API para procesamiento
- Revisa la [política de privacidad de OpenAI](https://openai.com/policies/privacy-policy)

---

## 🔒 Restricciones de Seguridad

El chatbot **SOLO** responde sobre:
- Matemática, Física, Electricidad, Electrónica
- Variadores de Frecuencia (VFD)
- Arrancadores Suave (Soft Start)
- Bombas y Bombeo con Paneles Solares
- CFW500 y equipos relacionados

Si intentas hacer preguntas sobre otros temas, el chatbot responderá:
> "Disculpa, solo puedo ayudarte con temas de VFD, electricidad, electrónica, física, matemática y bombeo. ¿Tienes alguna pregunta sobre estos temas?"

---

## 🚀 Próximas Mejoras

- [ ] Historial persistente en base de datos
- [ ] Exportar conversación a PDF
- [ ] Soporte para múltiples idiomas
- [ ] Integración con tutoriales del curso
- [ ] Sistema de rated/feedback
- [ ] Preguntas frecuentes (FAQ) predefinidas

---

## ❓ Troubleshooting

### El chatbot no responde
**Solución:** Verifica que:
- Tienes conexión a internet
- La API Key de OpenAI es válida
- No has excedido el límite de uso de OpenAI

### Botón de voz no funciona
**Solución:**
- Usa un navegador moderno (Chrome, Edge, Firefox)
- Asegúrate de tener micrófono conectado
- Concede permisos de micrófono al navegador

### Mensajes muy lentos
**Solución:**
- OpenAI puede estar saturada
- Intenta más tarde
- Verifica tu conexión a internet

---

**Última actualización:** 2026-06-05  
**Versión:** 1.0
