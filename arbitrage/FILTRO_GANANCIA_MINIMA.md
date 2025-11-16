# 🎯 FILTRO DE GANANCIA MÍNIMA

## Cambio Implementado

Se agregó un filtro de **ganancia mínima de 10 CUP** para evitar notificaciones de oportunidades con ganancia muy baja.

## ⚙️ Configuración

```javascript
// En monitor.js
const GANANCIA_MINIMA_CUP = 10; // Ganancia mínima por transacción para notificar
```

## 🔍 Cómo Funciona

### Antes del Filtro
El sistema notificaba cualquier oportunidad donde:
- **Compra:** Tasa oferta ≤ Precio calculado de compra
- **Venta:** Tasa oferta ≥ Precio calculado de venta

**Problema:** Con precios dinámicos, a veces detectaba oportunidades con ganancias muy bajas (0.5-2 CUP por operación).

### Después del Filtro
Ahora el sistema calcula:
```javascript
gananciaTotalCUP = diferencia * cantidad_USD
```

Y solo notifica si:
```javascript
gananciaTotalCUP >= 10 CUP
```

## 📊 Ejemplos

### ❌ Oportunidad Rechazada (No notifica)
- Diferencia: 0.52 CUP/USD
- Cantidad: 10 USD
- **Ganancia total: 5.2 CUP** ⚠️ Menor a 10 CUP → No notifica

### ✅ Oportunidad Aceptada (Notifica)
- Diferencia: 0.52 CUP/USD
- Cantidad: 25 USD
- **Ganancia total: 13 CUP** ✅ Mayor a 10 CUP → Notifica

### ✅ Oportunidad Aceptada (Notifica)
- Diferencia: 7.29 CUP/USD
- Cantidad: 150 USD
- **Ganancia total: 1093.5 CUP** ✅ Mayor a 10 CUP → Notifica

## 💡 Ventajas del Filtro

1. **Menos Spam:**
   - Solo recibes oportunidades que valen la pena
   - Reducción estimada: 30-50% de notificaciones

2. **Mejor ROI:**
   - Filtras ofertas pequeñas con ganancia insignificante
   - Te enfocas en oportunidades rentables

3. **Ahorro de Tiempo:**
   - No pierdes tiempo revisando ofertas de bajo valor
   - Las notificaciones son más relevantes

4. **Uso Eficiente del Límite de WhatsApp:**
   - Con 50 msg/día en CallMeBot, cada mensaje cuenta
   - El filtro asegura que cada mensaje valga la pena

## 🔧 Ajustar el Filtro

Si quieres cambiar el mínimo de ganancia, edita `monitor.js`:

```javascript
// Para 15 CUP mínimo
const GANANCIA_MINIMA_CUP = 15;

// Para 20 CUP mínimo
const GANANCIA_MINIMA_CUP = 20;

// Para 5 CUP mínimo (más sensible)
const GANANCIA_MINIMA_CUP = 5;
```

## 📈 Impacto Estimado

Con el filtro de 10 CUP:
- **Antes:** 20-30 notificaciones/día
- **Después:** 10-20 notificaciones/día
- **Reducción:** ~40% menos notificaciones
- **Calidad:** 100% oportunidades > 10 CUP de ganancia

## 📱 Formato de Notificación

Las notificaciones ahora incluyen la ganancia total:

```
🔴 OPORTUNIDAD DE VENTA

💱 Moneda: BANK_CUP
📊 Tasa: 510.00 CUP/USD
🎯 Objetivo: 503.00 CUP/USD
💰 Diferencia: 7.00 CUP/USD
💎 Ganancia total: 1050.00 CUP  ← NUEVO

💵 Monto: 150 USD → 76500 CUP
👤 Usuario: usuario123 (4.9 ⭐)
✅ KYC: Sí
🔓 Pública: Sí

🔗 Link: https://qvapay.com/p2p/uuid
```

## 🎯 Conclusión

El filtro de ganancia mínima asegura que:
- ✅ Solo recibas oportunidades rentables
- ✅ Ahorres tiempo y mensajes de WhatsApp
- ✅ Te enfoques en las mejores ofertas
- ✅ El sistema sea más eficiente

---

**Implementado:** 13 de noviembre de 2025  
**Valor por defecto:** 10 CUP  
**Ajustable:** Sí, en `monitor.js`
