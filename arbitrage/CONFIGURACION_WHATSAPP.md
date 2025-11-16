# 📲 Configuración de Notificaciones WhatsApp

## ✅ Estado Actual

**CONFIGURADO Y FUNCIONANDO** ✨

### Números Configurados

1. **Número 1:** +53 5356060886
   - API Key: 5906773
   - Estado: ✅ Activo

2. **Número 2:** +53 5351546383
   - API Key: 7501934
   - Estado: ✅ Activo

### Servicio Utilizado

**CallMeBot** (Gratuito)
- ✅ Sin costos
- ✅ Fácil configuración
- ⚠️ Límite: ~50 mensajes/día
- ⏱️ Entrega: 5-10 segundos

---

## 🚀 Cómo Usar

### 1. Iniciar el Monitor

```bash
cd "/home/ryuking/Code/qvpay test api/arbitrage"
node monitor.js
```

El monitor:
- 🔍 Escanea el mercado cada 30 segundos
- 📊 Calcula precios óptimos automáticamente
- 🎯 Detecta oportunidades de compra/venta
- 📲 Envía alertas a AMBOS números simultáneamente

### 2. Probar Notificaciones

```bash
node test-notificacion.js
```

Esto enviará un mensaje de prueba a ambos números.

---

## 📱 Formato de las Notificaciones

Cuando encuentre una oportunidad, recibirás:

### Ejemplo de Oportunidad de COMPRA:

```
🟢 OPORTUNIDAD DE COMPRA

💱 Moneda: BANK_CUP
📊 Tasa: 485.50 CUP/USD
🎯 Objetivo: 496.04 CUP/USD
💰 Diferencia: 10.54 CUP/USD mejor

💵 Monto: 50 USD → 24275 CUP
👤 Usuario: trader123 (4.8 ⭐)
✅ KYC: Sí
🔓 Pública: Sí

🔗 Link: https://qvapay.com/p2p/abc123xyz

⏰ 15:30:45
```

### Ejemplo de Oportunidad de VENTA:

```
🔴 OPORTUNIDAD DE VENTA

💱 Moneda: BANK_CUP
📊 Tasa: 520.00 CUP/USD
🎯 Objetivo: 510.00 CUP/USD
💰 Diferencia: 10.00 CUP/USD mejor

💵 Monto: 100 USD → 52000 CUP
👤 Usuario: comprador456 (4.9 ⭐)
✅ KYC: Sí
🔓 Pública: Sí

🔗 Link: https://qvapay.com/p2p/xyz789abc

⏰ 15:35:20
```

---

## ⚙️ Configuración Técnica

### Archivo `.env`

```bash
# Notificaciones habilitadas
NOTIFICACIONES_CALLMEBOT=true

# Número 1
CALLMEBOT_PHONE_1=5356060886
CALLMEBOT_API_KEY_1=5906773

# Número 2
CALLMEBOT_PHONE_2=5351546383
CALLMEBOT_API_KEY_2=7501934
```

### Arquitectura

```
monitor.js
    ↓
    Detecta oportunidad
    ↓
utils/notificaciones.js
    ↓
    Formatea mensaje
    ↓
CallMeBot API
    ↓
    Envía a Número 1 (paralelo)
    Envía a Número 2 (paralelo)
    ↓
    📲 WhatsApp
```

---

## 🔧 Activar CallMeBot (Si es Primera Vez)

Cada número debe seguir estos pasos:

1. **Agregar contacto:** +34 644 44 71 67
2. **Enviar mensaje:** "I allow callmebot to send me messages"
3. **Recibir API Key:** Te responderá con tu clave
4. **Configurar:** Ya está en tu `.env`

⚠️ **IMPORTANTE:** Cada número debe hacer este proceso por separado.

---

## ✅ Verificación

### Test de Notificaciones

```bash
node test-notificacion.js
```

**Salida esperada:**
```
✅ Notificación enviada a Número 1 (5356060886)
✅ Notificación enviada a Número 2 (5351546383)
📊 Enviado a 2/2 números
```

### Monitor en Funcionamiento

Cuando encuentre una oportunidad verás:

```
🎉 ¡1 OPORTUNIDAD(ES) ENCONTRADA(S)!

🟢 OPORTUNIDAD 1: COMPRA BANK_CUP
─────────────────────────────────────
💰 PUEDES COMPRAR USD más barato...
[detalles de la oferta]
─────────────────────────────────────

📲 Enviando notificación...
   ✅ Notificación enviada a Número 1 (5356060886)
   ✅ Notificación enviada a Número 2 (5351546383)
   📊 Enviado a 2/2 números
```

---

## 💡 Consejos de Uso

### Para Aprovechar las Oportunidades:

1. ✅ **Activa sonido** en WhatsApp para esas conversaciones
2. ✅ **Mantén el monitor corriendo** 24/7
3. ✅ **Actúa rápido** cuando recibas una alerta
4. ✅ **Click directo** en el enlace para ver la oferta
5. ⚠️ **Verifica siempre** los detalles antes de aceptar

### Para el Monitor:

```bash
# Ejecutar en background con PM2
pm2 start monitor.js --name "qvapay-monitor"

# Ver logs en tiempo real
pm2 logs qvapay-monitor

# Detener
pm2 stop qvapay-monitor

# Reiniciar
pm2 restart qvapay-monitor
```

---

## 📊 Estadísticas

### Límites de CallMeBot (Gratuito)

- **Mensajes por día:** ~50
- **Mensajes por hora:** ~10
- **Delay entre mensajes:** 5-10 segundos
- **Costo:** $0.00 (Gratis)

### Uso Estimado

Con escaneo cada 30 segundos:
- **Si encuentra 1 oportunidad/hora:** ~48 mensajes/día ✅
- **Si encuentra 2 oportunidades/hora:** ~96 mensajes/día ⚠️

💡 **Recomendación:** Si llegas al límite, considera:
1. Aumentar intervalo de escaneo a 60 segundos
2. Usar Telegram como backup (ilimitado)
3. Upgrade a Twilio WhatsApp (de pago)

---

## 🔄 Alternativas

Si CallMeBot no funciona o llegas al límite:

### Opción 1: Telegram (Recomendado)

- ✅ Gratis e ilimitado
- ✅ Más rápido que CallMeBot
- ✅ Permite multimedia
- 📖 Ver documentación en `utils/notificaciones.js`

### Opción 2: Twilio WhatsApp

- ✅ Profesional y confiable
- ✅ Sin límites
- ⚠️ De pago (~$0.005 por mensaje)
- 📖 Ver documentación en `utils/notificaciones.js`

---

## 🐛 Solución de Problemas

### No recibo notificaciones

1. **Verificar configuración:**
   ```bash
   node test-notificacion.js
   ```

2. **Revisar que CallMeBot esté activado:**
   - Revisa que hayas enviado "I allow callmebot to send me messages"
   - Espera la confirmación con tu API Key

3. **Verificar números:**
   - Deben ser sin espacios ni guiones
   - Sin el símbolo +
   - Ejemplo: 5356060886 ✅
   - Ejemplo incorrecto: +53 5356060886 ❌

### Las notificaciones llegan tarde

- CallMeBot puede tardar 5-10 segundos
- Es normal y parte del servicio gratuito
- Para notificaciones instantáneas, usar Twilio

### Solo llega a un número

- Verificar que ambos números tengan CallMeBot activado
- Cada número debe enviar el mensaje de activación por separado
- Verificar API Keys en `.env`

---

## 📞 Soporte

**Archivos importantes:**
- `monitor.js` - Monitor principal
- `utils/notificaciones.js` - Lógica de notificaciones
- `.env` - Configuración
- `test-notificacion.js` - Script de prueba

**Para más información:**
- CallMeBot: https://www.callmebot.com/blog/free-api-whatsapp-messages/
- Documentación QvaPay: En el README.md principal

---

## ✅ Checklist de Configuración

- [x] CallMeBot activado en Número 1
- [x] CallMeBot activado en Número 2
- [x] API Keys configuradas en `.env`
- [x] Test de notificaciones exitoso
- [x] Monitor funcionando
- [x] Notificaciones llegando a ambos números

**Estado:** 🟢 TODO CONFIGURADO Y FUNCIONANDO

---

**Última actualización:** 13 de noviembre de 2025
**Versión:** 2.1.0
