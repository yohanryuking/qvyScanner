# 💰 Calculadora de Precios de Arbitraje - QvaPay P2P

Sistema oficial para calcular precios óptimos de compra y venta basándose en el análisis inteligente del mercado P2P de QvaPay.

## 🚀 Uso Rápido

### 🔍 Monitor de Oportunidades (Recomendado)
```bash
node arbitrage/monitor.js
```
**El monitor escanea el mercado cada 30 segundos y te alerta cuando encuentra oportunidades. Incluye notificaciones por WhatsApp/Telegram.**### Estadísticas Generadas

Para cada moneda con suficientes ofertas (≥3):
- 📊 Promedio y mediana de tasas
- 📏 Mínimo y máximo (rango)
- 📐 Desviación estándar
- 🎯 Margen adaptable calculado
- 💰 Precio recomendado de compra
- 💸 Precio recomendado de venta
- 📈 Ganancia potenc---

## 📊 Ejemplos de Salida

### Monitor de Oportunidades

```
╔═══════════════════════════════════════════════════════╗
║     🔍 MONITOR DE OPORTUNIDADES - QvaPay P2P        ║
╚═══════════════════════════════════════════════════════╝

⚙️  CONFIGURACIÓN:
   • Intervalo: 30 segundos
   • Monedas: BANK_CUP, BOLSATM
   • Filtros: Solo KYC, públicas, no-VIP

═══════════════════════════════════════════════════════
🔍 ESCANEO #3 - 13/11/2025, 1:15:45
═══════════════════════════════════════════════════════

📊 PRECIOS DE REFERENCIA:
   BANK_CUP:
     🟢 Comprar hasta: 496.04 CUP/USD
     🔴 Vender desde: 522.22 CUP/USD

🎉 ¡2 OPORTUNIDADES ENCONTRADAS!

╔═══════════════════════════════════════════════════════╗
║              🟢 OPORTUNIDAD DE COMPRA                ║
╚═══════════════════════════════════════════════════════╝

💱 Moneda: BANK_CUP
📊 Tasa: 490.00 CUP/USD
🎯 Precio objetivo: 496.04 CUP/USD
💰 Diferencia: 6.04 CUP/USD mejor que objetivo

💵 Monto: 50 USD → 24,500 CUP
👤 Usuario: @trader123 (Rating: 4.8 ⭐)
✅ KYC verificado
🔓 Pública

🔗 https://qvapay.com/p2p/offer/abc123xyz

═══════════════════════════════════════════════════════
⏰ Próximo escaneo en 30 segundos...
═══════════════════════════════════════════════════════
```

### Calculadora de Precios

```
╔═══════════════════════════════════════════════════════╗
║     💰 CALCULADORA DE PRECIOS - ARBITRAJE P2P       ║
╚═══════════════════════════════════════════════════════╝ y %)
- 📋 Cantidad de ofertas analizadas
- 🔍 Spread real del mercado

### 🔍 Monitor de Oportunidades

El monitor automático:
- 🔄 Escanea el mercado cada 30 segundos
- 🎯 Recalcula precios óptimos en cada escaneo
- 🔍 Compara todas las ofertas con precios objetivo
- 🚨 Alerta solo de oportunidades rentables
- 🔗 Proporciona enlace directo a la oferta en QvaPay

**Criterios de detección:**
- **Compra:** Ofertas con tasa ≤ precio calculado de compra
- **Venta:** Ofertas con tasa ≥ precio calculado de ventandado)
```bash
node arbitrage/monitor.js
```
**El monitor escanea el mercado cada 30 segundos y te alerta cuando encuentra oportunidades de compra/venta a precios favorables.**

### 📊 Calcular Precios (Puntual)
```bash
node arbitrage/calcular-precios.js
```

## 🎯 Objetivo

Sistema automatizado con **margen adaptable** que analiza las primeras 100 ofertas del mercado para calcular precios óptimos de compra/venta con ganancias de **20-25 CUP por USD**.

Sistema automatizado con **margen adaptable** que analiza las primeras 100 ofertas del mercado para calcular precios óptimos de compra/venta con ganancias de **20-25 CUP por USD**.

## 💡 Estrategia (Margen Adaptable)

El sistema calcula automáticamente el margen óptimo basándose en el **spread real del mercado**:

### Ofertas de Compra
**Precio = Promedio - Margen Adaptable**

### Ofertas de Venta
**Precio = Promedio + Margen Adaptable**

**Margen Adaptable** = (Spread Real del Mercado / 2) × Factor de Seguridad (0.5)

Esto asegura ganancias robustas de 20-25 CUP por USD, ajustándose automáticamente a las condiciones del mercado.

---

## 📋 Archivos Disponibles

### 🔍 Monitor de Oportunidades (NUEVO)
**Archivo:** `monitor.js`

- **Escanea:** Mercado cada 30 segundos automáticamente
- **Detecta:** Oportunidades de compra/venta en tiempo real
- **Alerta:** Solo ofertas que cumplan con precios óptimos
- **Muestra:** Detalles + enlace directo a la oferta
- ✅ **Características:**
  - Monitoreo continuo y automático
  - Alertas en tiempo real
  - Enlaces directos a ofertas en QvaPay
  - Filtros de calidad integrados
  - Cálculo automático de precios objetivo

**Uso recomendado para:**
- Encontrar oportunidades en tiempo real
- Trading activo de arbitraje
- No perder ofertas rentables

---

### ⭐ Script Principal (Uso Diario)
**Archivo:** `calcular-precios.js`

- **Analiza:** Primeras 100 ofertas (páginas 1-2)
- **Velocidad:** ~0.5 segundos
- **Margen:** Adaptable (spread_real)
- **Resultado:** 20-25 CUP de ganancia por USD
- ✅ **Características:**
  - Rápido y preciso
  - Margen se ajusta automáticamente
  - Ofertas más recientes del mercado
  - Salida limpia y formateada
  - Filtros de calidad integrados

**Uso recomendado para:**
- Ver precios actuales del mercado
- Análisis puntual de precios
- Cálculos de arbitraje confiables

---

### 📊 Análisis Detallado (Debugging)
**Archivo:** `1-arbitraje-pagina-1.js`

- Analiza las primeras 100 ofertas (páginas 1-2)
- Versión detallada con todas las estadísticas
- ✅ **Ventajas:**
  - Mismo algoritmo que el script principal
  - Más información estadística
  - Transparencia en cálculos
  - Útil para debugging
  
**Casos de uso:**
- Debugging y análisis detallado
- Cuando necesitas ver todos los cálculos
- Validación del método oficial

---

## 📊 Algoritmo de Margen Adaptable

El sistema calcula el margen óptimo automáticamente:

### Método: spread_real

```javascript
// 1. Encontrar mejor oferta de COMPRA (más alta)
mejorCompra = max(ofertas_compra.map(o => o.tasa))

// 2. Encontrar mejor oferta de VENTA (más baja)
mejorVenta = min(ofertas_venta.map(o => o.tasa))

// 3. Calcular spread real del mercado
spreadReal = mejorCompra - mejorVenta

// 4. Calcular margen adaptable
margen = (spreadReal / 2) × factorSeguridad

// Factor de Seguridad = 0.25 (conservador)
// Esto asegura ganancias de 10-15 CUP por USD
```

### Precios Finales

```javascript
// Calcular promedio del mercado (sin outliers)
promedioMercado = calcularPromedio(ofertas)

// Aplicar margen adaptable
precioCompra = promedioMercado - margen
precioVenta = promedioMercado + margen

// Ganancia potencial
ganancia = precioVenta - precioCompra
```

### Ejemplo Real

**Datos del mercado BANK_CUP:**
- Mejor compra: 520.00 CUP
- Mejor venta: 465.78 CUP
- Spread real: 54.22 CUP

**Cálculo:**
```
margen = (54.22 / 2) × 0.5 = 13.56 CUP
promedio = 508.68 CUP

precioCompra = 508.68 - 13.56 = 495.12 CUP
precioVenta = 508.68 + 13.56 = 522.24 CUP

ganancia = 522.24 - 495.12 = 27.12 CUP ✅
```

---

## 🎯 Ejemplo Práctico

### Escenario Real: BANK_CUP

**Entrada:** Primeras 100 ofertas del mercado (páginas 1-2)

**Filtrado:**
- 100 ofertas obtenidas
- 73 eliminadas (VIP, sin KYC, privadas)
- **27 ofertas válidas analizadas**
  - 24 BANK_CUP
  - 3 otras

**Análisis BANK_CUP (24 ofertas):**
```
📊 Estadísticas del mercado:
   Promedio: 508.68 CUP/USD
   Mediana: 505.00 CUP/USD
   Rango: 465.78 - 520.00 CUP
   
🧮 Cálculo de margen adaptable:
   Spread real: 54.22 CUP
   Factor seguridad: 0.5
   Margen calculado: 13.56 CUP
```

**Resultados:**
```
💰 Precio de COMPRA: 495.12 CUP/USD
💸 Precio de VENTA: 522.24 CUP/USD
📈 Ganancia potencial: 27.12 CUP/USD (5.33%)
```

**Operación de ejemplo:**
1. Compro 10 USD pagando 4,951 CUP
2. Vendo 10 USD cobrando 5,222 CUP
3. **Ganancia neta: 271 CUP**
4. **ROI: 5.33%** por operación

---

## 🔧 Funcionalidades

### Filtros Automáticos de Calidad

```javascript
✅ Ofertas incluidas:
- Estado: 'open' (activas)
- KYC: Verificado (confiables)
- Visibilidad: Públicas
- Monedas: BANK_CUP y BOLSATM

❌ Ofertas excluidas:
- Ofertas VIP (si no eres VIP)
- Sin KYC verificado
- Ofertas privadas
- Otras monedas
- Outliers (valores extremos)
```

**Resultado:** ~70% de ofertas son filtradas, quedando solo las de mayor calidad

### Análisis por Moneda

El sistema analiza automáticamente:
- ✅ **BANK_CUP** (Transferencias bancarias CUP) - Principal
- ✅ **BOLSATM** (Cajeros automáticos) - Secundaria
- ℹ️ Otras monedas disponibles si cumplen filtros

### Estadísticas Generadas

Para cada moneda con suficientes ofertas (≥3):
- 📊 Promedio y mediana de tasas
- � Mínimo y máximo (rango)
- � Desviación estándar
- 🎯 Margen adaptable calculado
- 💰 Precio recomendado de compra
- 💸 Precio recomendado de venta
- 📈 Ganancia potencial (CUP y %)
- 📋 Cantidad de ofertas analizadas
- 🔍 Spread real del mercado

---

## 📁 Estructura del Proyecto

```
arbitrage/
├── README.md                      # Este archivo (documentación)
├── monitor.js                     # 🔍 MONITOR (alertas tiempo real)
├── calcular-precios.js           # ⭐ Cálculo de precios (puntual)
├── 1-arbitraje-pagina-1.js       # Análisis detallado (debugging)
└── utils/
    ├── calcular-precios.js       # Lógica de margen adaptable
    └── filtros.js                # Filtros de calidad
```

### Archivos Clave

**`monitor.js`** 🔍 (314 líneas)
- Monitor automático de oportunidades
- Escaneo cada 30 segundos
- Alertas en tiempo real
- Enlaces directos a ofertas en QvaPay
- Detección inteligente de oportunidades

**`calcular-precios.js`** ⭐ (158 líneas)
- Script principal para ver precios
- Salida limpia y formateada
- Más rápido (~0.5s)
- Análisis puntual del mercado

**`1-arbitraje-pagina-1.js`** (162 líneas)
- Análisis detallado con todas las estadísticas
- Útil para debugging y validación
- Misma lógica que el script oficial

**`utils/calcular-precios.js`** (335 líneas)
- Funciones compartidas de cálculo
- 3 métodos de margen: spread_real, percentil, desviacion
- Eliminación de outliers
- Cálculos estadísticos avanzados

**`utils/filtros.js`** (201 líneas)
- Filtros de calidad automáticos
- Solo ofertas CUP (BANK_CUP, BOLSATM)
- Validación de KYC
- Exclusión de VIP/privadas

---

## 🚀 Guía de Uso

### 🔍 Monitor de Oportunidades (Recomendado para Trading)

```bash
# Iniciar monitor automático cada 30 segundos
node arbitrage/monitor.js
```

**¿Qué hace?**
1. Calcula precios óptimos cada 30 segundos
2. Escanea todas las ofertas del mercado
3. Detecta oportunidades de compra/venta
4. Te muestra solo las ofertas rentables con enlace directo

**Criterios de alerta:**
- **Compra:** Ofertas ≤ precio objetivo de compra
- **Venta:** Ofertas ≥ precio objetivo de venta

**Presiona `Ctrl+C` para detener el monitor**

---

### ⭐ Cálculo de Precios (Análisis Puntual)

```bash
# Ver precios actuales del mercado
node arbitrage/calcular-precios.js
```

---

### 📊 Análisis Detallado (Debugging)

```bash
# Ver todas las estadísticas y detalles
node arbitrage/1-arbitraje-pagina-1.js
```

### Uso Programático

```javascript
const { calcularPrecios } = require('./arbitrage/calcular-precios');

// Obtener precios actualizados
const precios = await calcularPrecios();

// Acceder a datos de BANK_CUP
const bankCup = precios.BANK_CUP;
if (bankCup && bankCup.precios) {
    console.log(`Comprar a: ${bankCup.precios.compra} CUP`);
    console.log(`Vender a: ${bankCup.precios.venta} CUP`);
    console.log(`Ganancia: ${bankCup.precios.gananciaPotencial} CUP`);
    
    // Estadísticas
    console.log(`Ofertas: ${bankCup.estadisticas.cantidad}`);
    console.log(`Promedio: ${bankCup.estadisticas.promedio} CUP`);
}
```

---

## ⚠️ Advertencias Importantes

### Riesgos del Arbitraje

1. **Volatilidad del Mercado**
   - Los precios pueden cambiar rápidamente
   - Tu oferta puede quedarse sin ejecutarse

2. **Competencia**
   - Otros usuarios también hacen arbitraje
   - Las mejores ofertas se toman rápido

3. **Liquidez**
   - Puede no haber suficientes compradores/vendedores
   - Especialmente en monedas menos populares

4. **Comisiones**
   - QvaPay cobra comisiones en algunas operaciones
   - Debes considerarlas en tu ganancia

5. **Tiempo de Ejecución**
   - Las operaciones P2P no son instantáneas
   - Requieren coordinación con el otro usuario

### Recomendaciones

✅ **Hacer:**
- Empezar con montos pequeños
- Probar en mercados líquidos (BANK_CUP)
- Monitorear el mercado constantemente
- Ajustar el margen según la volatilidad (factor 0.4-0.6)
- Verificar el KYC de los usuarios
- Usar el método más apropiado según tu caso

❌ **No hacer:**
- Operar con todo tu capital de una vez
- Ignorar las comisiones en tus cálculos
- Crear ofertas en mercados ilíquidos
- Confiar ciegamente en los promedios
- Olvidar actualizar los precios regularmente

---

## 📊 Métricas de Rendimiento

### Script Oficial (`calcular-precios.js`)
- ⚡ Velocidad: **~0.5s**
- 📊 Ofertas: **100** (páginas 1-2)
- 🎯 Precisión: **Alta**
- 💾 Peticiones API: **2** (paralelas)
- 💰 Ganancia: **20-25 CUP/USD**
- 🎨 Formato: Limpio y profesional

### Análisis Detallado (`1-arbitraje-pagina-1.js`)
- ⚡ Velocidad: ~0.5s
- 📊 Ofertas: 100
- 🎯 Precisión: Alta
- 💾 Peticiones: 2
- 💰 Ganancia: 20-25 CUP/USD
- 📈 Info adicional: Todas las estadísticas

---

## 🔄 Monitoreo Automático

### Con el Monitor Integrado (Recomendado)

```bash
# Iniciar monitor (escanea cada 30 segundos)
node arbitrage/monitor.js

# Dejar corriendo en background con PM2
pm2 start arbitrage/monitor.js --name "qvapay-monitor"
pm2 save
pm2 startup
```

**Ventajas:**
- ✅ Alertas en tiempo real
- ✅ Solo muestra oportunidades rentables
- ✅ Enlaces directos a ofertas
- ✅ Recalcula precios automáticamente

### Monitoreo con PM2

```bash
# Instalar PM2
npm install -g pm2

# Crear script de monitoreo
# monitor.js
const { calcularPrecios } = require('./arbitrage/calcular-precios');

async function monitorear() {
    while (true) {
        await calcularPrecios();
        await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000));
    }
}

monitorear();

### Monitoreo con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar el monitor
pm2 start arbitrage/monitor.js --name "qvapay-monitor"

# Ver logs en tiempo real
pm2 logs qvapay-monitor

# Detener
pm2 stop qvapay-monitor

# Reiniciar
pm2 restart qvapay-monitor

# Guardar configuración
pm2 save

# Iniciar al arranque del sistema
pm2 startup
```
```

---

## � Salida de Ejemplo

```
╔═══════════════════════════════════════════════════════╗
║     � CALCULADORA DE PRECIOS - ARBITRAJE P2P       ║
╚═══════════════════════════════════════════════════════╝

📥 Obteniendo ofertas del mercado...
   ✅ 100 ofertas obtenidas

🔍 Filtrando ofertas...
   ✅ 27 ofertas válidas (eliminadas 73)

💰 Calculando precios óptimos...

╔═══════════════════════════════════════════════════════╗
║              📊 PRECIOS RECOMENDADOS                 ║
╚═══════════════════════════════════════════════════════╝

� BANK_CUP
   📊 24 ofertas analizadas
   
   Precios recomendados:
   🟢 COMPRAR a:  501.90 CUP  
   � VENDER a:   515.46 CUP  
   💵 Ganancia:   13.56 CUP por dólar (2.70%)
   
   � Margen adaptable calculado: 6.78 CUP
      (Spread mercado: 54.22 CUP, Factor seguridad: 0.25)
   
   � Estadísticas del mercado:
      Promedio: 508.68 CUP | Mediana: 505.00 CUP
      Rango: 465.78 - 520.00 CUP
───────────────────────────────────────────────────────

╔═══════════════════════════════════════════════════════╗
║                    📋 RESUMEN                        ║
╚═══════════════════════════════════════════════════════╝

⏱️  Tiempo de análisis: 0.52s
📊 Ofertas analizadas: 27
� Monedas: 1

┌──────────────┬────────────┬────────────┬──────────────┐
│   MONEDA     │  COMPRA    │   VENTA    │   GANANCIA   │
├──────────────┼────────────┼────────────┼──────────────┤
│ BANK_CUP     │    497.99  │    523.95  │ 25.96 CUP    │
└──────────────┴────────────┴────────────┴──────────────┘

⚠️  IMPORTANTE:
   • Precios basados en las primeras 100 ofertas del mercado
   • El margen se adapta automáticamente al spread real
   • Considera las comisiones de QvaPay en tus cálculos
   • Recomendación: Ejecutar cada 30-60 minutos para precios actualizados

═══════════════════════════════════════════════════════

✅ Análisis completado exitosamente
```

---

## 🎓 Conceptos Clave

### Arbitraje
Aprovechar diferencias de precio en el mercado para obtener ganancias. El sistema calcula automáticamente el margen óptimo basado en el spread real.

### Margen Adaptable
El margen se calcula automáticamente según las condiciones del mercado:
- **Spread alto** (mercado volátil) → Margen mayor
- **Spread bajo** (mercado estable) → Margen menor
- **Factor de seguridad 0.5** → Spread completo (20-25 CUP ganancia)

### Spread Real
Diferencia entre la mejor oferta de compra y la mejor de venta en el mercado. Indica la liquidez y volatilidad.

### Tasa de Cambio
Relación entre dos monedas. Ej: 510.97 CUP/USD = 510.97 pesos cubanos por cada dólar.

### Outliers (Valores Extremos)
Ofertas con precios muy fuera del rango normal. El sistema las elimina automáticamente para mejor precisión.

### Factor de Seguridad
Multiplicador que controla el nivel de riesgo:
- **0.4** = Conservador (15-20 CUP)
- **0.5** = Balanceado (20-25 CUP) ← **ACTUAL**
- **0.6** = Agresivo (25-30 CUP)

---

## ⚠️ Advertencias y Mejores Prácticas

### Riesgos del Arbitraje

1. **Volatilidad del Mercado**
   - Los precios cambian constantemente
   - Actualiza precios cada 30-60 minutos
   - El margen adaptable ayuda a mitigar este riesgo

2. **Competencia**
   - Muchos usuarios hacen arbitraje
   - Las ofertas se ejecutan rápido
   - Sé ágil en aceptar/crear ofertas

3. **Liquidez**
   - BANK_CUP tiene alta liquidez ✅
   - BOLSATM tiene liquidez media ⚠️
   - Otras monedas pueden ser ilíquidas ❌

4. **Comisiones de QvaPay**
   - Verifica las comisiones actuales
   - Incluye comisiones en tu cálculo de ganancia real

5. **Tiempo de Ejecución**
   - Operaciones P2P no son instantáneas
   - Requieren coordinación con el comprador/vendedor
   - Factor tiempo en tu estrategia

### ✅ Mejores Prácticas

**DO (Hacer):**
- ✅ Empezar con montos pequeños para probar
- ✅ Enfocarse en BANK_CUP (más líquido)
- ✅ Monitorear precios regularmente (30-60 min)
- ✅ Verificar KYC de usuarios antes de operar
- ✅ Usar el script oficial (`calcular-precios.js`)
- ✅ Considerar comisiones en tus cálculos
- ✅ Mantener registro de operaciones exitosas
- ✅ Ajustar factor de seguridad según experiencia

**DON'T (No hacer):**
- ❌ Operar con todo tu capital de una vez
- ❌ Ignorar las comisiones
- ❌ Crear ofertas en mercados ilíquidos
- ❌ Confiar ciegamente en los precios sin verificar
- ❌ Olvidar actualizar precios regularmente
- ❌ Operar sin KYC verificado
- ❌ Usar métodos lentos para decisiones rápidas

### 🎯 Estrategia Recomendada

1. **Inicio (Semana 1-2)**
   - Usar script oficial cada 30-60 min
   - Operar solo BANK_CUP
   - Montos pequeños (10-20 USD)
   - Objetivo: Aprender el mercado

2. **Intermedio (Mes 1-2)**
   - Automatizar con cron/PM2
   - Escalar montos gradualmente
   - Explorar BOLSATM si funciona bien
   - Objetivo: Operaciones consistentes

3. **Avanzado (Mes 3+)**
   - Ajustar factor de seguridad según resultados
   - Considerar Método 3 para análisis profundos
   - Optimizar timing de operaciones
   - Objetivo: Maximizar ganancias

---

## 📊 Comparación de Archivos

| Aspecto | Oficial | Detallado |
|---------|---------|-----------|
| **Velocidad** | ⚡⚡⚡ 0.5s | ⚡⚡⚡ 0.5s |
| **Ofertas** | 100 (1-2) | 100 (1-2) |
| **Ganancia** | 20-25 CUP | 20-25 CUP |
| **Precisión** | Alta | Alta |
| **Uso** | Producción | Debugging |
| **Salida** | Limpia | Completa |

### ¿Cuál usar?

- **Uso diario:** → `calcular-precios.js` ⭐
- **Ver detalles/debugging:** → `1-arbitraje-pagina-1.js`

---

## 🔧 Configuración Avanzada

### Ajustar Factor de Seguridad

Editar en `arbitrage/utils/calcular-precios.js`:

```javascript
// Conservador (15-20 CUP)
factorSeguridad: 0.4

// Balanceado (20-25 CUP) ← ACTUAL
factorSeguridad: 0.5

// Agresivo (25-30 CUP)
factorSeguridad: 0.6
```

### Cambiar Método de Margen

Editar en `calcular-precios.js`:

```javascript
const precios = calcularPreciosPorMoneda(ofertas, {
    // Spread real (recomendado) ← ACTUAL
    metodoMargen: 'spread_real',
    
    // Percentiles 25-75
    // metodoMargen: 'percentil',
    
    // Desviación estándar
    // metodoMargen: 'desviacion',
    
    factorSeguridad: 0.5,
    eliminarOutliersFlag: true
});
```

### Incluir Más Monedas

Editar en `arbitrage/utils/filtros.js`:

```javascript
// Desactivar filtro solo-CUP
const ofertas = aplicarFiltrosEstandar(ofertasOriginales, {
    incluirVIP: false,
    requiereKYC: true,
    soloPublicas: true,
    soloCUP: false  // ← Cambiar a false
});
```

---

## 📝 Changelog

### v2.1.0 - 13 Nov 2025 ⭐ ACTUAL
- ✅ **NUEVO:** Monitor automático de oportunidades (`monitor.js`)
- ✅ Escaneo del mercado cada 30 segundos
- ✅ Alertas en tiempo real con enlaces directos
- ✅ Detección inteligente de oportunidades de compra/venta
- ✅ Documentación actualizada con instrucciones del monitor

### v2.0.0 - 13 Nov 2025
- ✅ Simplificación del proyecto (solo archivos esenciales)
- ✅ Eliminados archivos de prueba y métodos alternativos
- ✅ Mantenidos: Script oficial + análisis detallado
- ✅ Documentación actualizada y simplificada
- ✅ Factor de seguridad 0.5 (20-25 CUP ganancia)

### v1.5.0 - 13 Nov 2025
- ✅ Factor de seguridad aumentado a 0.5
- ✅ Ganancia objetivo ajustada: 20-25 CUP por USD
- ✅ Precios alineados con estrategia real del mercado

### v1.4.0 - 13 Nov 2025
- ✅ Método 1 establecido como oficial
- ✅ Creado script principal simplificado (`calcular-precios.js`)
- ✅ Documentación completa actualizada

---

## 📞 Soporte y Contacto

### Documentación
- 📖 Este README contiene toda la información necesaria
- 💻 Código comentado en cada archivo
- 📊 Salidas descriptivas y claras

### Próximos Pasos

1. ✅ **Ejecutar script oficial**
   ```bash
   node arbitrage/calcular-precios.js
   ```

2. ✅ **Verificar resultados**
   - Comprobar precios de compra/venta
   - Validar ganancia potencial (20-25 CUP)

3. ✅ **Crear ofertas de prueba**
   - Empezar con montos pequeños (10 USD)
   - Usar precios calculados por el sistema
   - Empezar con montos pequeños (10 USD)
   - Usar precios calculados por el sistema

4. ✅ **Monitorear y ajustar**
   - Ejecutar cada 30-60 minutos
   - Evaluar resultados reales
   - Ajustar factor de seguridad si es necesario

5. ✅ **Automatizar** (opcional)
   - Configurar cron job
   - O usar PM2 para monitoreo continuo

---

**🎯 Sistema de Arbitraje P2P - QvaPay**  
**📅 Última actualización:** 13 de noviembre de 2025  
**📌 Versión:** 2.1.0 (Monitor Automático)  
**💚 Estado:** Producción - Listo para usar

---

**Desarrollado con 💙 para operaciones exitosas en QvaPay**

---

## 📲 Notificaciones WhatsApp

El monitor incluye soporte para notificaciones en tiempo real por WhatsApp usando **CallMeBot** (gratuito).

### ✅ Ya Configurado

Las notificaciones están **pre-configuradas** con tu número:
- 📱 Teléfono: +53 5356060886
- 🔑 API Key: 5906773
- ✅ Habilitado por defecto

### 🔧 Activar CallMeBot (Primera vez)

1. **Agregar contacto:** +34 644 44 71 67 a WhatsApp
2. **Enviar mensaje:** "I allow callmebot to send me messages"
3. **Recibir confirmación:** Te responderá con tu API Key
4. **¡Listo!** Ya está todo configurado

### 🧪 Probar Notificaciones

```bash
# Enviar mensaje de prueba
node arbitrage/test-notificacion.js
```

Recibirás un mensaje de prueba en WhatsApp en 5-10 segundos.

### 📱 Cómo Funciona

Cuando el monitor encuentra una oportunidad:
1. 🔍 Detecta oferta con precio favorable
2. 📲 Envía mensaje a tu WhatsApp automáticamente
3. 🔗 Incluye enlace directo a la oferta
4. ⚡ Puedes actuar inmediatamente

### �� Formato del Mensaje

```
🟢 OPORTUNIDAD DE COMPRA

💱 Moneda: BANK_CUP
📊 Tasa: 485.50 CUP/USD
🎯 Objetivo: 496.04 CUP/USD
💰 Ahorro: 10.54 CUP/USD mejor

💵 Monto: 50 USD → 24275 CUP
👤 Usuario: trader123 (4.8 ⭐)
✅ KYC verificado
🔓 Pública

🔗 https://qvapay.com/p2p/offer/abc123

⏰ 01:15:45
```

### ⚙️ Configuración Avanzada

Si quieres cambiar el número o API key, edita `.env`:

```bash
NOTIFICACIONES_CALLMEBOT=true
CALLMEBOT_PHONE=5356060886
CALLMEBOT_API_KEY=5906773
```

### 💡 Consejos

- ✅ Deja el monitor corriendo en segundo plano
- ✅ Activa sonido de notificaciones en WhatsApp
- ✅ Actúa rápido cuando recibas una alerta
- ⚠️ CallMeBot puede tardar 5-10 segundos en entregar
- ⚠️ Hay límite de ~50 mensajes por día (gratuito)

### 🔄 Alternativas

El sistema también soporta:
- **Twilio WhatsApp** (de pago, más rápido)
- **Telegram** (gratuito, ilimitado)

Ver `utils/notificaciones.js` para más opciones.

