# 📊 SISTEMA DE NOTIFICACIONES MULTI-CANAL

## ✅ Configuración Actual

### 📱 WhatsApp (CallMeBot)
- **Número 1:** 5356060886 (API Key: 5906773)
- **Número 2:** 5351546383 (API Key: 7501934)
- **Límite:** ~50 mensajes/día
- **Estado:** ✅ Activo y funcionando

### 💬 Telegram (Bot API)
- **Chat 1:** 1732171145
- **Chat 2:** 7357759140
- **Bot Token:** 8280199546:AAEn0AECY2BvjbTRtBO0i76PyQqnYh1Bj6c
- **Límite:** Ilimitado
- **Estado:** ✅ Activo y funcionando
- **Formato:** HTML enriquecido (negritas, cursivas)

## 🎯 Características del Sistema

### 1. Envío Paralelo
- Todos los mensajes se envían simultáneamente a los 4 destinos (2 WhatsApp + 2 Telegram)
- Si falla un canal, los demás continúan funcionando

### 2. Anti-Duplicados
- Sistema de caché que previene enviar la misma oferta múltiples veces
- Ahorro estimado: 90-95% de mensajes
- Duración del caché: 30 minutos

### 3. Escaneo Automático
- Frecuencia: Cada 30 segundos
- Recálculo de precios en cada escaneo
- Detección automática de oportunidades

### 4. Formato de Mensajes
- **WhatsApp:** Formato con asteriscos y guiones bajos
- **Telegram:** Conversión automática a HTML
  - `*texto*` → `<b>texto</b>` (negrita)
  - `_texto_` → `<i>texto</i>` (cursiva)

## 📋 Resumen de Destinatarios

Total de destinatarios configurados: **4**

| Canal | Destinatario | Estado | Prioridad |
|-------|--------------|--------|-----------|
| WhatsApp | 5356060886 | ✅ | Alta |
| WhatsApp | 5351546383 | ✅ | Alta |
| Telegram | Chat 1732171145 | ✅ | Alta |
| Telegram | Chat 7357759140 | ✅ | Alta |

## 🚀 Scripts de Prueba

### Probar WhatsApp
```bash
node test-notificacion.js
```

### Probar Telegram
```bash
node test-telegram.js
```

### Prueba detallada con debug
```bash
node test-telegram-debug.js
```

### Ejecutar monitor completo
```bash
node monitor.js
```

## 📊 Estadísticas de Uso

### Ventajas por Canal

**WhatsApp:**
- ✅ Muy familiar para usuarios
- ✅ Notificaciones push garantizadas
- ⚠️ Límite de ~50 mensajes/día
- ⚠️ Requiere API key personal

**Telegram:**
- ✅ Mensajes ilimitados
- ✅ Más rápido que WhatsApp
- ✅ Formato HTML enriquecido
- ✅ Sin límites de API
- ✅ Enlaces clickeables con preview

### Proyección de Uso

Con el sistema anti-duplicados:
- Oportunidades únicas detectadas: 4-8 por hora
- Notificaciones enviadas (sin caché): 96-192/día
- Notificaciones enviadas (con caché): 10-20/día
- Ahorro: ~90% de mensajes

## 🔧 Mantenimiento

### Agregar más chats de Telegram
1. Editar `.env`:
```env
TELEGRAM_CHAT_ID_3=nuevo_chat_id
```

2. Editar `utils/notificaciones.js` en `TELEGRAM_CONFIG.chats`:
```javascript
{
    chatId: process.env.TELEGRAM_CHAT_ID_3 || 'chat_id',
    nombre: 'Chat 3'
}
```

### Agregar más números de WhatsApp
1. Editar `.env`:
```env
CALLMEBOT_PHONE_3=53numero
CALLMEBOT_API_KEY_3=api_key
```

2. Editar `utils/notificaciones.js` en `CALLMEBOT_CONFIG.numeros`:
```javascript
{
    phoneNumber: process.env.CALLMEBOT_PHONE_3 || 'numero',
    apiKey: process.env.CALLMEBOT_API_KEY_3 || 'key',
    nombre: 'Número 3'
}
```

### Obtener Chat ID de Telegram
1. Envía un mensaje a tu bot en Telegram
2. Visita: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
3. Busca el valor de `"chat":{"id":...}`

## 💡 Consejos

1. **Iniciar conversación con el bot:**
   - Cada usuario debe enviar `/start` al bot antes de recibir mensajes
   - Telegram no permite que los bots inicien conversaciones

2. **Verificar estado del bot:**
   - Usa @BotFather en Telegram
   - Comando: `/mybots` → selecciona tu bot → "Bot Settings"

3. **Monitoreo continuo:**
   - Ejecuta `monitor.js` en segundo plano con `nohup` o `pm2`
   - Ejemplo: `nohup node monitor.js > monitor.log 2>&1 &`

4. **Logs y depuración:**
   - El monitor muestra estadísticas en tiempo real
   - Usa `test-telegram-debug.js` para diagnóstico completo

## 🎉 Resultado

Sistema robusto de notificaciones con:
- ✅ 4 destinos configurados y funcionando
- ✅ Redundancia (si falla un canal, otros continúan)
- ✅ Anti-duplicados inteligente
- ✅ Formato optimizado por canal
- ✅ Escaneo automático 24/7
- ✅ Sin límites prácticos (Telegram ilimitado)

---

**Última actualización:** 13 de noviembre de 2025
**Versión del sistema:** 2.0 con soporte multi-chat
