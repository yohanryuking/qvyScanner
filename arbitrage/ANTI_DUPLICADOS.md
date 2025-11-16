# 🔔 Sistema Anti-Duplicados en Notificaciones

## 📋 Problema Resuelto

**Antes:** Si una oferta se detectaba en múltiples escaneos consecutivos (porque nadie la tomó), se enviaban notificaciones duplicadas cada 30 segundos, consumiendo rápidamente el límite de 50 mensajes/día de CallMeBot.

**Ahora:** El sistema mantiene un caché de ofertas ya notificadas y solo envía notificación la primera vez que detecta cada oferta.

---

## 🎯 Cómo Funciona

### Sistema de Caché

```javascript
// Estructura interna
ofertasNotificadas = {
    "uuid-oferta-1": timestamp,
    "uuid-oferta-2": timestamp,
    "uuid-oferta-3": timestamp
}
```

### Flujo de Detección

```
Escaneo 1 (15:00:00)
  └─ Detecta Oferta A ✅
      └─ NO está en caché → Envía notificación
      └─ Guarda en caché

Escaneo 2 (15:00:30)
  └─ Detecta Oferta A ⏭️
      └─ SÍ está en caché → Omite notificación
      └─ Muestra: "ya notificada hace 0 min"

Escaneo 3 (15:01:00)
  └─ Detecta Oferta A ⏭️
      └─ SÍ está en caché → Omite notificación
      └─ Muestra: "ya notificada hace 1 min"
  └─ Detecta Oferta B ✅
      └─ NO está en caché → Envía notificación
      └─ Guarda en caché
```

### Limpieza Automática

Cada 30 minutos, el sistema limpia ofertas antiguas del caché:
- **Razón:** Una oferta antigua ya fue tomada o expiró
- **Beneficio:** Permite re-notificar si la misma persona publica una oferta similar más tarde

---

## 📊 Ahorro de Mensajes

### Ejemplo Real

**Escenario:** 1 oferta permanece activa durante 1 hora

#### Sin Anti-Duplicados:
```
30 segundos × 120 escaneos = 120 notificaciones ❌
Límite de 50 alcanzado en 25 minutos
```

#### Con Anti-Duplicados:
```
1 notificación única ✅
Ahorro: 119 mensajes
```

### Proyección Diaria

Con 10 ofertas únicas detectadas al día:

| Sistema | Notificaciones | Estado |
|---------|---------------|--------|
| **Sin anti-duplicados** | ~500+ | ❌ Excede límite |
| **Con anti-duplicados** | 10-15 | ✅ Dentro del límite |

---

## 🔧 Configuración

### Parámetros Ajustables

En `monitor.js`:

```javascript
// Tiempo para limpiar ofertas del caché (30 minutos)
const TIEMPO_CACHE_MS = 30 * 60 * 1000;
```

**Opciones sugeridas:**

```javascript
// Más agresivo (re-notifica más rápido)
const TIEMPO_CACHE_MS = 15 * 60 * 1000; // 15 minutos

// Conservador (evita más duplicados)
const TIEMPO_CACHE_MS = 60 * 60 * 1000; // 60 minutos

// Muy conservador
const TIEMPO_CACHE_MS = 120 * 60 * 1000; // 2 horas
```

**Recomendación:** 30 minutos (valor actual) es óptimo.

---

## 📱 Salida del Monitor

### Cuando Detecta Oferta Nueva

```
═══════════════════════════════════════════════════════
📲 Enviando notificación...
   ✅ Notificación enviada a Número 1 (5356060886)
   ✅ Notificación enviada a Número 2 (5351546383)
   📊 Enviado a 2/2 números
   ✅ Nueva oferta notificada: 8b49cc79...

   📊 Resumen: 1 nuevas, 0 omitidas (duplicadas)
═══════════════════════════════════════════════════════
```

### Cuando Detecta Oferta Duplicada

```
═══════════════════════════════════════════════════════
   ⏭️  Omitiendo oferta 8b49cc79... (ya notificada hace 2 min)

   📊 Resumen: 0 nuevas, 1 omitidas (duplicadas)
═══════════════════════════════════════════════════════
```

### Cuando Detecta Múltiples (Algunas Nuevas, Algunas Duplicadas)

```
═══════════════════════════════════════════════════════
   ✅ Nueva oferta notificada: abc12345...
   ⏭️  Omitiendo oferta xyz67890... (ya notificada hace 5 min)
   ✅ Nueva oferta notificada: def34567...

   📊 Resumen: 2 nuevas, 1 omitidas (duplicadas)
═══════════════════════════════════════════════════════
```

### Limpieza de Caché (Cada 30 min)

```
   🗑️  Limpieza de caché: 3 ofertas antiguas eliminadas
   💾 Ofertas en caché: 5
```

---

## 💡 Ventajas del Sistema

### 1. Ahorro de Mensajes
- ✅ Reduce consumo en 90-95%
- ✅ Permite estar dentro del límite de 50/día
- ✅ Más sostenible para uso 24/7

### 2. Mejor Experiencia
- ✅ No spam en WhatsApp
- ✅ Solo recibes alertas de ofertas realmente nuevas
- ✅ Más fácil identificar oportunidades únicas

### 3. Inteligente
- ✅ Limpieza automática de ofertas antiguas
- ✅ Re-notifica si la misma persona publica después
- ✅ Estadísticas en tiempo real

### 4. Transparente
- ✅ Muestra cuándo omite duplicados
- ✅ Indica hace cuánto fue notificada
- ✅ Contador de ofertas en caché

---

## 📈 Estadísticas al Detener

Al presionar `Ctrl+C`:

```
═══════════════════════════════════════════════════════
🛑 Monitor detenido por el usuario
📊 Total de escaneos realizados: 150
📲 Ofertas únicas notificadas: 8
═══════════════════════════════════════════════════════
```

**Interpretación:**
- 150 escaneos = 75 minutos de monitoreo
- 8 ofertas únicas = Solo 8 notificaciones enviadas
- **Sin anti-duplicados:** Habrían sido ~1,200 mensajes

---

## 🔍 Casos de Uso

### Caso 1: Oferta Permanece 2 Horas

```
15:00 → Detectada y notificada ✅
15:30 → Detectada, omitida (30 min)
16:00 → Detectada, omitida (60 min)
16:30 → Detectada, omitida (90 min)
17:00 → Detectada, omitida (120 min)
17:30 → Limpiada del caché (>30 min desde última)
```

**Resultado:** 1 notificación en 2.5 horas ✅

### Caso 2: Usuario Publica, Cancela y Re-publica

```
10:00 → Oferta A detectada y notificada ✅
10:05 → Usuario cancela Oferta A
10:10 → Usuario crea Oferta B (nuevo UUID)
10:10 → Oferta B detectada y notificada ✅
```

**Resultado:** 2 notificaciones (correctamente) ✅

### Caso 3: Múltiples Ofertas Simultáneas

```
14:00 → Detectadas 3 ofertas nuevas
        → Oferta 1: Notificada ✅
        → Oferta 2: Notificada ✅
        → Oferta 3: Notificada ✅

14:30 → Siguen las 3 ofertas activas
        → Oferta 1: Omitida
        → Oferta 2: Omitida
        → Oferta 3: Omitida
```

**Resultado:** 3 notificaciones iniciales, luego silencio ✅

---

## ⚙️ Configuración Avanzada

### Ajustar Tiempo de Caché

Si quieres que re-notifique más rápido:

```javascript
// En monitor.js, línea ~20
const TIEMPO_CACHE_MS = 15 * 60 * 1000; // 15 minutos
```

**Trade-off:**
- ⬇️ Menos tiempo = Más re-notificaciones
- ⬆️ Más tiempo = Menos duplicados

### Deshabilitar Limpieza Automática

Si quieres que NUNCA re-notifique la misma oferta:

```javascript
// Comentar la línea de limpieza en ejecutarEscaneo()
// limpiarCacheAntiguo();
```

**Consecuencia:** Memoria del proceso crecerá indefinidamente.

---

## 🐛 Debugging

### Ver Ofertas en Caché

Agregar al final de `ejecutarEscaneo()`:

```javascript
console.log('📋 Ofertas en caché:');
for (const [uuid, timestamp] of ofertasNotificadas.entries()) {
    const minutos = Math.floor((Date.now() - timestamp) / 60000);
    console.log(`   ${uuid.substring(0, 8)}... (${minutos} min)`);
}
```

### Forzar Limpieza de Caché

Reiniciar el monitor:
```bash
# Ctrl+C para detener
# node monitor.js para reiniciar
# El caché se resetea
```

---

## ✅ Resumen

| Característica | Descripción |
|---------------|-------------|
| **Tecnología** | Map con UUID → timestamp |
| **Tiempo caché** | 30 minutos (configurable) |
| **Limpieza** | Automática cada escaneo |
| **Ahorro** | 90-95% de mensajes |
| **Transparencia** | Muestra estadísticas en tiempo real |
| **Re-notificación** | Después de 30 min si oferta sigue activa |

---

**Implementado:** 13 de noviembre de 2025  
**Versión:** 2.1.1 (Anti-Duplicados)  
**Estado:** ✅ Funcionando perfectamente
