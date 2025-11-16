## 📲 NOTIFICACIONES TELEGRAM - GESTOR ESCALONADO

### ✅ Implementación Completa

Se ha integrado el sistema de notificaciones de Telegram al gestor escalonado de ofertas con las siguientes funcionalidades:

#### 🔔 Tipos de Notificaciones

1. **Oferta Creada** (`notificarOfertaCreada`)
   - Se envía cada vez que se crea una nueva oferta
   - Incluye: ID, monto, tasa, moneda, hora
   - Emoji: 🔴 para venta, 🟢 para compra

2. **Oferta Renovada** (`notificarOfertaRenovada`)
   - Se envía cuando una oferta sin peer se renueva (después de 10 min)
   - Incluye: ID anterior, ID nuevo, monto, tasa, tiempo sin peer
   - Emoji: 🔄

3. **Peer Detectado** (`notificarPeerDetectado`)
   - Se envía cuando alguien toma una oferta
   - Incluye: ID oferta, monto, tasa, username del peer, hora
   - Emoji: 🎉 🔴 o 🟢

#### 🗂️ Sistema de Caché

Para evitar notificaciones duplicadas de peers:
- **Estructura**: `Map<string, {peer_uuid, timestamp}>`
- **Key**: `${ofertaId}-${peerUuid}`
- **TTL**: 30 minutos (se limpia automáticamente)
- **Limpieza**: Se ejecuta cada vez que se notifica un peer

#### 🎯 Características

- ✅ **Sin duplicados**: Un peer en una oferta solo se notifica una vez
- ✅ **Tiempo real**: Notificaciones inmediatas cuando ocurren eventos
- ✅ **Formato HTML**: Mensajes con formato en Telegram (negrita, cursiva)
- ✅ **Robusto**: Maneja errores sin detener el gestor
- ✅ **Multi-chat**: Envía a todos los chats configurados en `utils/notificaciones.js`

#### 📝 Ejemplo de Notificaciones

**Oferta Creada:**
```
🔴 OFERTA CREADA - VENTA

🆔 ID: a1b2c3d4...
💰 Monto: 10 USD → 5070 CUP
📊 Tasa: 507.00 CUP/USD
💵 Moneda: BANK_CUP
⏰ 18:45:32
```

**Peer Detectado:**
```
🔴 PEER DETECTADO - VENTA

🆔 Oferta: a1b2c3d4...
💰 Monto: 10 USD → 5070 CUP
📊 Tasa: 507.00 CUP/USD
👤 Peer: @usuario123
⏰ 18:50:15
```

**Oferta Renovada:**
```
🔄 OFERTA RENOVADA - VENTA

🆔 ID anterior: x9y8z7w6...
🆔 ID nueva: a1b2c3d4...
💰 Monto: 10 USD → 5070 CUP
📊 Tasa: 507.00 CUP/USD
⏱️  Sin peer por: 10 minutos
⏰ 19:00:45
```

#### ⚙️ Configuración

Las notificaciones están configuradas en `arbitrage/utils/notificaciones.js`:

```javascript
const TELEGRAM_CONFIG = {
    enabled: true,
    botToken: '8280199546:AAEn0AECY2BvjbTRtBO0i76PyQqnYh1Bj6c',
    chats: [
        { chatId: '1732171145', nombre: 'Chat 1' },
        { chatId: '7357759140', nombre: 'Chat 2' }
    ]
};
```

#### 🚀 Uso

El gestor escalonado ahora notifica automáticamente:

```bash
node arbitrage/gestor-ofertas-escalonado.js
```

Todas las notificaciones se envían en paralelo sin bloquear el flujo del gestor.

#### 📊 Estadísticas

El contador de peers detectados se incrementa automáticamente:
- Se muestra en las estadísticas del gestor
- Se registra en `estadisticas.peersDetectados`

---

**Fecha**: 15 de noviembre de 2025
**Estado**: ✅ Implementado y funcional
