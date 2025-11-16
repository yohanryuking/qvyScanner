# 📲 GUÍA DE NOTIFICACIONES - QvaPay Arbitrage Monitor

## ¿Qué son las notificaciones?

El monitor puede enviarte mensajes automáticos por **WhatsApp** o **Telegram** cuando encuentra oportunidades de arbitraje en el mercado.

---

## 🎯 Opciones Disponibles

### 1️⃣ CallMeBot WhatsApp ⭐ **RECOMENDADO**

**Características:**
- ✅ 100% GRATUITO
- ✅ Configuración súper simple (2 minutos)
- ✅ Sin tarjeta de crédito
- ✅ Sin crear cuenta
- ⚠️ Límite: ~50 mensajes/día (más que suficiente)

**Configuración:**

1. **Agregar contacto:**
   - Guarda este número en tu WhatsApp: **+34 644 44 71 67**
   - Nómbralo como "CallMeBot" o similar

2. **Activar servicio:**
   - Envíale el mensaje exacto: `I allow callmebot to send me messages`
   - Espera su respuesta con tu API Key (ej: "123456")

3. **Configurar variables:**
   ```bash
   export NOTIFICACIONES_CALLMEBOT=true
   export CALLMEBOT_PHONE="5353123456"  # Tu número SIN el +
   export CALLMEBOT_API_KEY="123456"     # El que te dieron
   ```

4. **Hacer permanente (opcional):**
   ```bash
   echo "export NOTIFICACIONES_CALLMEBOT=true" >> ~/.bashrc
   echo "export CALLMEBOT_PHONE='5353123456'" >> ~/.bashrc
   echo "export CALLMEBOT_API_KEY='123456'" >> ~/.bashrc
   source ~/.bashrc
   ```

5. **¡Listo!** Ejecuta el monitor:
   ```bash
   node arbitrage/monitor.js
   ```

---

### 2️⃣ Twilio WhatsApp

**Características:**
- ✅ Profesional y muy confiable
- ✅ API oficial de WhatsApp
- ✅ Perfecto para producción
- ⚠️ Requiere cuenta Twilio
- ⚠️ Requiere tarjeta de crédito
- 💰 Costo: ~$0.005 por mensaje

**Configuración:**

1. **Crear cuenta:**
   - Regístrate en: https://www.twilio.com/
   - Verifica tu email y teléfono

2. **Activar WhatsApp Sandbox:**
   - Ve a: Console → Messaging → Try it out → Send a WhatsApp message
   - Sigue las instrucciones para conectar tu WhatsApp
   - Envía el código que te indican al número de Twilio

3. **Obtener credenciales:**
   - Account SID: En el dashboard principal
   - Auth Token: Click en "Show" en el dashboard

4. **Configurar variables:**
   ```bash
   export NOTIFICACIONES_TWILIO=true
   export TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
   export TWILIO_AUTH_TOKEN="tu_token_secreto"
   export TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
   export TWILIO_WHATSAPP_TO="whatsapp:+5353123456"
   ```

---

### 3️⃣ Telegram

**Características:**
- ✅ 100% GRATUITO
- ✅ Ilimitado
- ✅ Muy confiable
- ⚠️ Requiere usar Telegram en lugar de WhatsApp

**Configuración:**

1. **Crear bot:**
   - Abre Telegram y busca: **@BotFather**
   - Envíale: `/newbot`
   - Sigue las instrucciones y nombra tu bot
   - Guarda el **Bot Token** que te da (ej: `123456789:ABCdef...`)

2. **Obtener tu Chat ID:**
   - Busca: **@userinfobot**
   - Envíale cualquier mensaje
   - Te responderá con tu **Chat ID** (ej: `123456789`)

3. **Configurar variables:**
   ```bash
   export NOTIFICACIONES_TELEGRAM=true
   export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
   export TELEGRAM_CHAT_ID="123456789"
   ```

4. **Iniciar conversación:**
   - Busca tu bot en Telegram por el nombre que le diste
   - Envíale: `/start`
   - ¡Ya puedes recibir notificaciones!

---

## 🚀 Verificar Configuración

Después de configurar, ejecuta el monitor:

```bash
node arbitrage/monitor.js
```

Deberías ver algo como:

```
📲 NOTIFICACIONES:
   ✅ Habilitadas: CallMeBot WhatsApp
   🔹 CallMeBot WhatsApp: Activo
```

Si ves:
```
📲 NOTIFICACIONES:
   ⚠️  Deshabilitadas (solo mostrar en consola)
```

Significa que las variables de entorno no están configuradas correctamente.

---

## 🔧 Solución de Problemas

### CallMeBot no envía mensajes

1. **Verifica que respondió tu activación:**
   - El bot debe haberte respondido con tu API Key
   - Si no respondió, intenta de nuevo después de 5 minutos

2. **Verifica las variables:**
   ```bash
   echo $NOTIFICACIONES_CALLMEBOT  # Debe mostrar: true
   echo $CALLMEBOT_PHONE           # Debe mostrar tu número sin +
   echo $CALLMEBOT_API_KEY         # Debe mostrar tu key
   ```

3. **El número debe estar sin +:**
   - ✅ Correcto: `5353123456`
   - ❌ Incorrecto: `+5353123456`
   - ❌ Incorrecto: `+53 53123456`

### Twilio no envía mensajes

1. **Verifica que completaste el Sandbox:**
   - Debes haber enviado el código de activación al número de Twilio
   - Tu número debe aparecer como "Verified" en el dashboard

2. **Formato del número:**
   - ✅ Correcto: `whatsapp:+5353123456`
   - ❌ Incorrecto: `5353123456`

### Telegram no envía mensajes

1. **Iniciaste conversación con el bot:**
   - Debes buscar el bot y enviarle `/start`
   - Si no lo haces, el bot no puede enviarte mensajes

2. **Chat ID correcto:**
   - Verifica que sea tu Chat ID personal
   - No uses el nombre de usuario, debe ser el número

---

## 💡 Tips y Recomendaciones

### Usar múltiples servicios

Puedes habilitar varios servicios a la vez para redundancia:

```bash
export NOTIFICACIONES_CALLMEBOT=true
export NOTIFICACIONES_TELEGRAM=true
# ... configurar ambos
```

El monitor intentará enviar por ambos canales.

### Modo silencioso

Si solo quieres ver en consola sin notificaciones:

```bash
# No exportes ninguna variable o ponlas en false
export NOTIFICACIONES_CALLMEBOT=false
export NOTIFICACIONES_TELEGRAM=false
export NOTIFICACIONES_TWILIO=false
```

### Ejecutar con PM2

Para que el monitor corra 24/7 en segundo plano:

```bash
pm2 start arbitrage/monitor.js --name "qvapay-monitor"
pm2 logs qvapay-monitor  # Ver logs y notificaciones
```

---

## 📊 Ejemplo de Notificación

Cuando el monitor encuentra una oportunidad, recibirás:

```
🟢 *OPORTUNIDAD DE COMPRA*

💱 *Moneda:* BANK_CUP
📊 *Tasa:* 490.00 CUP/USD
🎯 *Objetivo:* 496.04 CUP/USD
💰 *Diferencia:* 6.04 CUP/USD mejor

💵 *Monto:* 50 USD → 24,500 CUP
👤 *Usuario:* @trader123 (4.8 ⭐)
✅ *KYC:* Sí
🔓 *Pública:* Sí

🔗 *Link:* https://qvapay.com/p2p/abc123

⏰ 13:45:30
```

Puedes hacer click en el enlace para ir directo a la oferta.

---

## 📖 Más Ayuda

### Ver instrucciones en consola:

```bash
node arbitrage/configurar-notificaciones.js
```

### CallMeBot Documentation:
https://www.callmebot.com/blog/free-api-whatsapp-messages/

### Twilio WhatsApp:
https://www.twilio.com/whatsapp

### Telegram Bots:
https://core.telegram.org/bots

---

**¿Preguntas?** Revisa el `README.md` principal o el código en `utils/notificaciones.js`
