# 🔑 GESTIÓN DE TOKENS Y CREDENCIALES

## 📌 Problema: Tokens que Expiran

Cada vez que haces login en QvaPay, se genera un **nuevo token** y los anteriores quedan inválidos. Esto causaba que los scripts dejaran de funcionar.

## ✅ Solución: Credenciales Centralizadas

Todos los scripts ahora usan el archivo **`arbitrage/credenciales.js`** como fuente única de verdad.

### Archivo Principal: `credenciales.js`

```javascript
module.exports = {
    email: 'tu_email@gmail.com',
    password: 'tu_password',
    twoFactorCode: '1234',
    token: 'tu_token_actual',
    tokenActualizadoEn: '2025-11-15 15:34:27'
};
```

## 🔄 Cómo Actualizar el Token

### Opción 1: Script Automático (Recomendado)

```bash
node arbitrage/actualizar-token.js
```

Este script:
1. Lee las credenciales de `credenciales.js`
2. Hace login con el código 2FA actual
3. Actualiza automáticamente el token en `credenciales.js`
4. Muestra tu información y balance

### Opción 2: Manual

1. **Obtén un nuevo token:**
   ```bash
   node EMPEZAR_AQUI/login-con-codigo.js
   ```

2. **Copia el token** que aparece en la terminal

3. **Actualiza `arbitrage/credenciales.js`:**
   ```javascript
   token: 'PEGA_AQUI_EL_NUEVO_TOKEN',
   ```

## 📋 Scripts que Usan Credenciales Centralizadas

Todos estos scripts ahora obtienen el token automáticamente de `credenciales.js`:

- ✅ `monitor.js` - Monitor de oportunidades
- ✅ `gestor-ofertas.js` - Gestor automático de ofertas
- ✅ `calcular-precios.js` - Calculadora de precios
- ✅ `1-arbitraje-pagina-1.js` - Análisis de arbitraje
- ✅ `config-gestor-ofertas.js` - Configuración del gestor

## 🔐 Seguridad

⚠️ **IMPORTANTE:** 
- El archivo `credenciales.js` contiene información sensible
- NO lo subas a GitHub ni lo compartas
- Mantenlo en tu máquina local únicamente

## 💡 Flujo de Trabajo Recomendado

1. **Al iniciar el día:**
   ```bash
   node arbitrage/actualizar-token.js
   ```

2. **Ejecuta tus scripts normalmente:**
   ```bash
   node arbitrage/monitor.js
   node arbitrage/gestor-ofertas.js
   ```

3. **Si un script falla con error 401:**
   - Vuelve al paso 1 y actualiza el token

## 🔢 Sobre el Código 2FA

El código 2FA de 4 dígitos:
- ✅ Se mantiene válido durante **varias horas**
- ✅ Puedes usarlo múltiples veces para renovar el token
- ❌ Eventualmente expira y necesitas solicitar uno nuevo

**Si el código 2FA expiró:**
```bash
node EMPEZAR_AQUI/solicitar-pin.js
```

Luego actualiza `twoFactorCode` en `credenciales.js` con el nuevo código.

## 🎯 Ventajas de Este Sistema

✅ **Un solo lugar** para actualizar credenciales  
✅ **Sincronización automática** entre todos los scripts  
✅ **Menos errores** por tokens desactualizados  
✅ **Más rápido** para desarrollar y probar  

## 📝 Ejemplo Completo

```bash
# 1. Actualizar token (una vez)
node arbitrage/actualizar-token.js

# 2. Usar cualquier script (el token ya está actualizado)
node arbitrage/monitor.js
node arbitrage/gestor-ofertas.js
node arbitrage/calcular-precios.js

# Si después de unas horas el token expira:
# Volver al paso 1
```

## ❓ Preguntas Frecuentes

**Q: ¿Cuánto dura un token?**  
A: No hay un tiempo fijo, pero generalmente varias horas. Cuando expire verás error 401.

**Q: ¿Puedo usar el mismo token en múltiples scripts?**  
A: ¡Sí! Por eso centralizamos las credenciales. Un solo token para todo.

**Q: ¿Qué pasa si hago login desde otro lugar?**  
A: El token anterior se invalida. Necesitarás actualizar `credenciales.js` con el nuevo.

**Q: ¿El código 2FA es el mismo que el PIN?**  
A: Sí, son lo mismo. QvaPay lo llama de diferentes formas.

---

💡 **Tip Pro:** Agrega `credenciales.js` al `.gitignore` para evitar subirlo accidentalmente a GitHub.
