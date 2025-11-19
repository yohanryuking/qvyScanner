# 💰 CONFIGURACIÓN MANUAL DEL BALANCE CUP

## 🎯 Problema

El gestor de compras escalonado necesita saber cuánto CUP tienes disponible para crear ofertas de compra. Sin embargo, la API de QvaPay no proporciona esta información de manera confiable.

## ✅ Solución

Configura manualmente tu balance en CUP disponible. El gestor usará exactamente esa cantidad para calcular cuántas ofertas puede crear.

## 📁 Método 1: Archivo de Configuración (Recomendado)

### 1. Edita el archivo de configuración:

```bash
nano arbitrage/config-gestor-compra.js
```

### 2. Configura tu balance:

```javascript
module.exports = {
    // 💰 BALANCE MANUAL EN CUP
    // balanceCupManual: null,      // Automático (desde API)
    balanceCupManual: 25000,       // Manual: usar exactamente 25000 CUP
    // balanceCupManual: 50000,     // Ejemplo: 50000 CUP

    // ... resto de configuración
};
```

### 3. Ejecuta el gestor:

```bash
node arbitrage/gestor-compra-escalonado.js
```

## 🌍 Método 2: Variable de Entorno

### Ejecuta con variable de entorno:

```bash
# Usar 25000 CUP
BALANCE_CUP_MANUAL=25000 node arbitrage/gestor-compra-escalonado.js

# Usar 50000 CUP
BALANCE_CUP_MANUAL=50000 node arbitrage/gestor-compra-escalonado.js
```

## 💻 Método 3: Script de Ejemplo

### Ejecuta el script de ejemplo:

```bash
node arbitrage/ejemplo-balance-manual.js
```

Este script configura automáticamente 25000 CUP y ejecuta el gestor.

## 📊 Cómo Calcular tu Balance

### 1. Ve a tu cuenta QvaPay
### 2. Revisa tu balance en CUP
### 3. Resta un margen de seguridad (ej: 1000 CUP)
### 4. Configura ese valor en el gestor

### Ejemplo:
- Balance real: 30000 CUP
- Margen de seguridad: 2000 CUP
- Configurar: `balanceCupManual: 28000`

## ⚠️ Importante

- **El gestor NO verifica** si tienes suficiente CUP real
- **Asegúrate** de tener al menos el monto configurado
- **Si configuras más CUP de los que tienes**, las ofertas fallarán al crearse
- **Si configuras menos**, no aprovecharás todo tu capital disponible

## 🔍 Verificación

Cuando ejecutes el gestor, verás:

```
💰 Obteniendo balance CUP...
   ⚙️  Balance MANUAL configurado: 25000 CUP
   💡 El gestor usará exactamente este monto (sin verificar disponibilidad real)
   ✅ Balance CUP disponible: 25000.00 CUP
```

## 📈 Ajustes Dinámicos

Puedes cambiar el balance en cualquier momento:

1. Detén el gestor (Ctrl+C)
2. Edita `config-gestor-compra.js`
3. Vuelve a ejecutar el gestor

El gestor detectará automáticamente el nuevo balance en el siguiente ciclo.

## 🎯 Estrategia Recomendada

1. **Configura un balance conservador** inicialmente
2. **Monitorea** que las ofertas se creen correctamente
3. **Ajusta** según sea necesario
4. **Deja un margen** para transacciones manuales

---

**¿Necesitas ayuda configurando tu balance específico?**