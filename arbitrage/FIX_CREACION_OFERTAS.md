# 🐛 CORRECCIÓN: Creación de Ofertas

## Problema Encontrado

El gestor no podía crear ofertas, mostraba el error:
```
❌ Error: Cantidad inválida, debe ser un número entre 0 y 100000
```

## Causa

La API de QvaPay P2P requiere que los campos numéricos se envíen como **números**, no como strings:

### Antes (❌ No funcionaba):
```javascript
{
    coin: 2,
    amount: "100",           // ❌ String
    receive: "51401.00",     // ❌ String con decimales
}
```

### Después (✅ Funciona):
```javascript
{
    coin: 2,                 // ✅ Número entero
    amount: 100,             // ✅ Número
    receive: 51401,          // ✅ Número parseado
}
```

## Archivos Corregidos

### 1. `arbitrage/utils/api-ofertas.js`

**Cambios:**
- Parsear `amount` y `receive` a números con `parseFloat()`
- Parsear `coin` a entero con `parseInt()`
- Validar tipos antes de enviar a la API

```javascript
// Antes
const body = {
    coin: datosOferta.coin,
    amount: datosOferta.amount,      // Podía ser string
    receive: datosOferta.receive,    // Podía ser string
    ...
};

// Después  
const amount = typeof datosOferta.amount === 'string' 
    ? parseFloat(datosOferta.amount) 
    : datosOferta.amount;

const receive = typeof datosOferta.receive === 'string' 
    ? parseFloat(datosOferta.receive) 
    : datosOferta.receive;

const body = {
    coin: parseInt(datosOferta.coin),
    amount: amount,                   // Siempre número
    receive: receive,                 // Siempre número
    ...
};
```

### 2. `arbitrage/gestor-ofertas.js`

**Cambios:**
- Eliminar conversión innecesaria a string de `amount`
- Parsear `cantidadCUP` como número con `parseFloat()`

```javascript
// Antes
amount: configOferta.cantidadUSD.toString(),  // ❌
receive: cantidadCUP,                         // String "51401.00"

// Después
amount: configOferta.cantidadUSD,             // ✅ Número
receive: parseFloat(cantidadCUP),             // ✅ Número parseado
```

## Resultado

✅ **El gestor ahora crea ofertas correctamente**

```bash
node arbitrage/gestor-ofertas.js
```

```
📝 Creando oferta de VENTA:
   💰 100 USD → 51401 CUP
   📊 Tasa: 514.01 CUP/USD
   ✅ Oferta creada: 718d1959...
```

## Lecciones Aprendidas

1. **Tipos de datos importan**: Las APIs pueden rechazar requests si los tipos no son correctos
2. **Validar antes de enviar**: Parsear y validar datos antes de enviar a la API
3. **No usar `.toString()` innecesariamente**: Los números deben enviarse como números
4. **`.toFixed()` retorna string**: Usar `parseFloat()` después de `.toFixed()`

## Testing

Para verificar que funciona:

```bash
# 1. Actualizar token
node arbitrage/actualizar-token.js

# 2. Ejecutar gestor
node arbitrage/gestor-ofertas.js

# Deberías ver:
# ✅ Oferta creada: XXXXXXXX...
```

## Estado: ✅ RESUELTO

El sistema de gestión automática de ofertas está **100% funcional**.
