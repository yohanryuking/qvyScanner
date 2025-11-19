# 🎯 CONFIGURACIÓN DE GESTORES ESCALONADOS - LÍMITE 15 OFERTAS

## 🚨 Limitación Importante de QvaPay

**QvaPay permite un máximo de 15 ofertas activas por usuario.** Esta limitación afecta directamente a los gestores escalonados de compras y ventas.

## 🎯 Modos de Distribución

Los gestores escalonados ahora respetan esta limitación y ofrecen 3 modos de distribución configurables:

### 1. Modo Mixto (Recomendado) 🟢
```javascript
modoDistribucion: 'mixto'
```
- **8 ofertas de compra** + **7 ofertas de venta**
- Ideal para usuarios que hacen arbitraje bidireccional
- Permite comprar USD barato y vender USD caro simultáneamente

### 2. Modo Solo Ventas 🔴
```javascript
modoDistribucion: 'solo-ventas'
```
- **15 ofertas de venta únicamente**
- Para usuarios que solo venden USD (tienen USD y quieren CUP)
- Máxima capacidad de ventas escalonadas

### 3. Modo Solo Compras 🟢
```javascript
modoDistribucion: 'solo-compras'
```
- **15 ofertas de compra únicamente**
- Para usuarios que solo compran USD (tienen CUP y quieren USD)
- Máxima capacidad de compras escalonadas

## ⚙️ Configuración

### Archivo: `config-gestor-ofertas.js`

```javascript
gestores: {
    // Modo de distribución de ofertas activas (máximo 15 total)
    // 'mixto': 8 compras + 7 ventas (recomendado)
    // 'solo-ventas': 15 ventas (solo para vendedores)
    // 'solo-compras': 15 compras (solo para compradores)
    modoDistribucion: 'mixto',

    // Configuración por modo (NO MODIFICAR)
    modos: {
        mixto: {
            maxCompras: 8,
            maxVentas: 7,
            descripcion: '8 ofertas de compra + 7 ofertas de venta'
        },
        'solo-ventas': {
            maxCompras: 0,
            maxVentas: 15,
            descripcion: '15 ofertas de venta únicamente'
        },
        'solo-compras': {
            maxCompras: 15,
            maxVentas: 0,
            descripcion: '15 ofertas de compra únicamente'
        }
    }
}
```

## 📊 Cómo Funciona

### Distribución de Capital

Cada gestor calcula automáticamente cuánto capital asignar por oferta:

```
Capital Disponible ÷ Número Máximo de Ofertas = Capital por Oferta
```

**Ejemplo Modo Mixto:**
- Balance USD: $1000
- Gestor Ventas: máximo 7 ofertas
- Capital por oferta de venta: $1000 ÷ 7 = ~$142.86

### Verificación de Límites

En cada ciclo, los gestores:
1. **Consultan todas las ofertas activas** (total del usuario)
2. **Verifican el modo configurado**
3. **Calculan espacios disponibles** para su tipo de oferta
4. **Se detienen si alcanzan el límite** de su categoría

## 🚀 Estrategias Recomendadas

### Para Principiantes
```javascript
modoDistribucion: 'mixto'  // 8 compras + 7 ventas
```
- Permite aprender ambos lados del arbitraje
- Balancea riesgo y oportunidad

### Para Vendedores Experimentados
```javascript
modoDistribucion: 'solo-ventas'  // 15 ventas
```
- Máxima capacidad de ventas escalonadas
- Ideal cuando tienes mucho USD para vender

### Para Compradores Experimentados
```javascript
modoDistribucion: 'solo-compras'  // 15 compras
```
- Máxima capacidad de compras escalonadas
- Ideal cuando tienes mucho CUP para comprar USD

## 📈 Monitoreo

Los gestores muestran información detallada en cada ciclo:

```
📊 Total ofertas activas: 12/15
🎯 Modo configurado: mixto (8 ofertas de compra + 7 ofertas de venta)
📈 Límite ventas: 7 ofertas
📊 Espacios disponibles: 3 ofertas
💵 Capital por oferta: $142.86
```

## ⚠️ Consideraciones Importantes

1. **Límite Global**: 15 ofertas activas en total, sin importar el tipo
2. **Sincronización**: Ambos gestores deben usar la misma configuración
3. **Balance**: El modo mixto es recomendado para la mayoría de usuarios
4. **Cambio de Modo**: Puedes cambiar el modo en cualquier momento, pero considera cancelar ofertas manualmente si es necesario

## 🔧 Cambio de Modo

Para cambiar el modo de distribución:

1. Edita `config-gestor-ofertas.js`
2. Cambia el valor de `modoDistribucion`
3. Reinicia los gestores
4. Considera cancelar ofertas existentes si cambias a un modo más restrictivo

```javascript
// Cambiar a modo solo ventas
modoDistribucion: 'solo-ventas'
```

## 📝 Logs y Debugging

Si encuentras problemas, verifica:
- Que ambos gestores usen la misma configuración
- Que el total de ofertas activas no exceda 15
- Que los límites por tipo se respeten según el modo
- Los logs detallados en cada ciclo del gestor