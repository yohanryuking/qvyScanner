# 🤖 GESTOR AUTOMÁTICO DE OFERTAS P2P

Sistema inteligente que publica y gestiona ofertas automáticamente basándose en los precios óptimos detectados por el monitor.

## 🎯 Funcionalidades

### 1. Publicación Automática
- Publica ofertas con precios óptimos calculados dinámicamente
- Crea ofertas de compra y venta según configuración
- Actualiza precios en cada escaneo

### 2. Gestión Inteligente
- **Detección de Interés (Peer):**
  - Si una oferta tiene peer → Notifica
  - Si tiene peer, la oferta está activa y no se toca
  
- **Renovación Automática:**
  - Si una oferta lleva **> 20 minutos** sin peer
  - La elimina y crea una nueva con precios actualizados
  - Evita tener ofertas "muertas" en el mercado

### 3. Notificaciones
- Alerta cuando alguien acepta tu oferta (peer detectado)
- Informa cuando renueva ofertas antiguas
- Estadísticas de gestión en tiempo real

## ⚙️ Configuración

```javascript
// config-gestor-ofertas.js
{
  // Ofertas a mantener activas
  ofertas: [
    {
      tipo: 'venta',           // 'compra' o 'venta'
      moneda: 'BANK_CUP',      // Moneda
      cantidadUSD: 100,        // Cantidad fija de USD
      detallesPago: [          // Info de pago
        { name: 'Método', value: 'Transferencia Bancaria' },
        { name: 'Banco', value: 'Banco Popular' }
      ],
      habilitada: true
    }
  ],
  
  // Configuración de gestión
  gestion: {
    tiempoMaximoSinPeer: 20,  // Minutos antes de renovar
    intervaloEscaneo: 30,      // Segundos entre escaneos
    soloKYC: true,             // Requerir KYC
    privada: false             // Oferta privada o pública
  }
}
```

## 📊 Flujo de Trabajo

```
┌─────────────────────────────────────┐
│   ESCANEO (cada 30 seg)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Calcular precios óptimos          │
│   (spread_real + factor seguridad)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Obtener MIS ofertas activas       │
└──────────────┬──────────────────────┘
               │
               ▼
      ┌────────┴────────┐
      │ ¿Tiene ofertas? │
      └────────┬────────┘
           NO  │  SÍ
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌──────────┐   ┌─────────────────┐
│ CREAR    │   │ ¿Tiene PEER?    │
│ OFERTAS  │   └────────┬────────┘
└──────────┘        NO  │  SÍ
                   ┌────┴────┐
                   │         │
                   ▼         ▼
           ┌──────────┐  ┌──────────┐
           │ ¿>20min? │  │ NOTIFICAR│
           └────┬─────┘  │ PEER!    │
             NO │  SÍ    └──────────┘
           ┌────┴────┐
           │         │
           ▼         ▼
      ┌────────┐ ┌──────────┐
      │ ESPERAR│ │ ELIMINAR │
      └────────┘ │ Y CREAR  │
                 │ NUEVA    │
                 └──────────┘
```

## 🔄 Ejemplo de Operación

### Ciclo 1 (0 min)
```
✅ Creada oferta VENTA 100 USD a 510 CUP/USD
   UUID: abc123...
   Estado: open
   Peer: null
```

### Ciclo 10 (5 min)
```
⏳ Oferta abc123... - Sin peer (5 min de edad)
   Esperando...
```

### Ciclo 40 (20 min)
```
⏰ Oferta abc123... - Sin peer (20 min de edad)
   Esperando...
```

### Ciclo 42 (21 min)
```
🔄 Oferta abc123... - Sin peer (21 min)
   ❌ ELIMINANDO oferta antigua
   ✅ CREADA nueva oferta def456... a 512 CUP/USD (precio actualizado)
```

### Cuando hay peer
```
🎉 ¡ALERTA! Oferta def456... tiene PEER
   👤 Usuario: comprador123
   💰 Monto: 100 USD → 51200 CUP
   🔗 Link: https://qvapay.com/p2p/def456...
```

## 📱 Notificaciones

El sistema envía notificaciones por WhatsApp y Telegram en estos casos:

1. **Peer Detectado (ALTA PRIORIDAD):**
```
🎉 ¡OFERTA ACEPTADA!

Alguien aceptó tu oferta de VENTA:
💰 100 USD → 51200 CUP
👤 Usuario: comprador123
⭐ Rating: 4.9
🔗 VER: https://qvapay.com/p2p/...
```

2. **Oferta Renovada:**
```
🔄 Oferta renovada

Oferta sin peer por >20 min
❌ Eliminada: abc123...
✅ Nueva: def456...
📊 Precio: 510 → 512 CUP/USD
```

## 🛠️ Archivos del Sistema

```
arbitrage/
  ├── gestor-ofertas.js           # Sistema principal
  ├── config-gestor-ofertas.js    # Configuración
  ├── utils/
  │   ├── api-ofertas.js         # Wrapper de APIs P2P
  │   └── notificaciones.js      # Ya existente
  └── monitor-con-gestor.js      # Monitor integrado
```

## ⚠️ Consideraciones Importantes

### 1. Capital Disponible
- El sistema verifica que tengas saldo suficiente
- Si no hay saldo, no crea la oferta y notifica

### 2. Límites de la API
- Respeta rate limits de QvaPay
- Máximo X ofertas activas simultáneas

### 3. Precios Dinámicos
- Se recalculan en cada escaneo
- Las ofertas nuevas usan los precios más recientes
- Factor de seguridad aplicado

### 4. Gestión de Errores
- Si falla crear oferta → Log + Notificación
- Si falla eliminar oferta → Reintento + Log
- Errores de API → Espera y reintenta

## 📈 Métricas

El gestor muestra estadísticas:

```
📊 ESTADÍSTICAS DEL GESTOR:
   ✅ Ofertas activas: 2
   🎉 Peers detectados hoy: 5
   🔄 Ofertas renovadas: 3
   ⏰ Tiempo promedio sin peer: 15 min
   💰 Total operado hoy: 500 USD
```

## 🚀 Inicio Rápido

1. **Configurar ofertas:**
```bash
nano config-gestor-ofertas.js
```

2. **Ejecutar gestor:**
```bash
node gestor-ofertas.js
```

3. **Ejecutar con monitor integrado:**
```bash
node monitor-con-gestor.js
```

## 🔐 Seguridad

- El token se mantiene seguro (no se muestra en logs)
- Solo gestiona TUS ofertas (filtro `my: true`)
- Notificaciones encriptadas en tránsito

---

**Estado:** En desarrollo  
**Próximos pasos:** Implementar gestor-ofertas.js
