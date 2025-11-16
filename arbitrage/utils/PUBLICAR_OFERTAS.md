# 📝 Utilidad: Publicar Ofertas P2P

Esta utilidad te permite publicar ofertas de **compra** y **venta** en el mercado P2P de QvaPay de forma programática.

## 🚀 Características

- ✅ Publicar ofertas de **COMPRA** (no requiere balance)
- ✅ Publicar ofertas de **VENTA** (verifica balance automáticamente)
- ✅ Helpers para crear detalles de pago (Banco, Zelle, Tarjeta)
- ✅ Calculadores de tasas y montos
- ✅ Validación automática de datos
- ✅ Soporte para 2FA

## 📁 Archivos

### Utilidad Principal
- **`arbitrage/utils/publicar-ofertas.js`** - Funciones principales

### Tests y Ejemplos
- **`arbitrage/test-publicar-ofertas.js`** - Test completo con ejemplos
- **`EMPEZAR_AQUI/publicar-oferta.js`** - Ejemplo simple para principiantes

## 🟢 Ofertas de COMPRA

Las ofertas de compra **NO requieren** tener balance en tu cuenta.

### Ejemplo Básico

```javascript
const { publicarOfertaCompra, crearDetallesBancoCUP, MONEDAS } = require('./arbitrage/utils/publicar-ofertas');

const detalles = crearDetallesBancoCUP(
    'Tu Nombre',
    'Banco Popular',
    '9224129876543210',
    '53560608886'
);

const oferta = {
    coin: MONEDAS.USDT,  // 2 = USDT
    amount: 10,           // Comprar 10 USD
    receive: 530,         // Pagar 530 CUP
    details: detalles
};

const opciones = {
    only_kyc: 1,          // Solo usuarios verificados
    private: 0,           // Oferta pública
    message: 'Compro USDT, pago rápido ⚡'
};

const resultado = await publicarOfertaCompra(
    email,
    password,
    oferta,
    opciones,
    twoFactorCode  // null si no tienes 2FA
);

console.log(`Oferta creada: ${resultado.link}`);
```

### ¿Qué significa comprar?
- Tú **PUBLICAS** que quieres comprar USD/Cripto
- Otros usuarios te **VENDEN** a ti
- Tú **PAGAS** en CUP (por Transfermovil)
- Tú **RECIBES** USD/Cripto en tu cuenta QvaPay

## 🔴 Ofertas de VENTA

Las ofertas de venta **REQUIEREN** tener balance suficiente en tu cuenta.

### Ejemplo Básico

```javascript
const { publicarOfertaVenta, crearDetallesBancoCUP, MONEDAS } = require('./arbitrage/utils/publicar-ofertas');

const detalles = crearDetallesBancoCUP(
    'Tu Nombre',
    'Banco Popular',
    '9224129876543210',
    '53560608886'
);

const oferta = {
    coin: MONEDAS.USDT,  // 2 = USDT
    amount: 5,            // Vender 5 USD
    receive: 270,         // Recibir 270 CUP
    details: detalles
};

const opciones = {
    only_kyc: 1,          // Solo usuarios verificados
    private: 0,           // Oferta pública
    message: 'Vendo USDT, acepto transfermovil 🚀',
    verificarBalance: true // Verificar balance antes (default: true)
};

const resultado = await publicarOfertaVenta(
    email,
    password,
    oferta,
    opciones,
    twoFactorCode
);

console.log(`Oferta creada: ${resultado.link}`);
```

### ¿Qué significa vender?
- Tú **PUBLICAS** que quieres vender USD/Cripto
- Otros usuarios te **COMPRAN** a ti
- Tú **RECIBES** CUP (por Transfermovil)
- Tú **ENVÍAS** USD/Cripto desde tu cuenta QvaPay

## 💰 Códigos de Monedas

```javascript
const MONEDAS = {
    BANK_CUP: 'BANK_CUP',     // Transferencias bancarias en CUP
    BANK_MLC: 'BANK_MLC',     // Transferencias bancarias en MLC
    ZELLE: 'ZELLE',           // Zelle
    CLASICA: 'CLASICA',       // Tarjeta clásica
    BOLSATM: 'BOLSATM',       // Bolsa TM
    USDCASH: 'USDCASH'        // USD en efectivo
};
```

**Nota:** Las monedas se especifican usando su código como **string**, no un ID numérico.

## 📋 Helpers para Detalles de Pago

### Transfermovil / Banco CUP

```javascript
const { crearDetallesBancoCUP } = require('./arbitrage/utils/publicar-ofertas');

const detalles = crearDetallesBancoCUP(
    'Juan Pérez',              // Nombre completo
    'Banco Popular',           // Nombre del banco
    '9224129876543210',        // Número de cuenta
    '53560608886'              // Teléfono
);
```

### Zelle

```javascript
const { crearDetallesZelle } = require('./arbitrage/utils/publicar-ofertas');

const detalles = crearDetallesZelle(
    'John Doe',                // Nombre completo
    'john.doe@example.com',    // Email de Zelle
    '+1234567890'              // Teléfono (opcional)
);
```

### Tarjeta Magnética

```javascript
const { crearDetallesTarjeta } = require('./arbitrage/utils/publicar-ofertas');

const detalles = crearDetallesTarjeta(
    'María González',          // Nombre completo
    '9760039001179455',        // Número de tarjeta
    '53560608886'              // Teléfono
);
```

## 📊 Calculadores de Tasas

```javascript
const { calcularTasa, calcularMontoCUP, calcularMontoUSD } = require('./arbitrage/utils/publicar-ofertas');

// Calcular tasa (CUP/USD)
const tasa = calcularTasa(530, 10);  // 530 CUP / 10 USD = 53.00

// Calcular monto en CUP
const cup = calcularMontoCUP(10, 53);  // 10 USD * 53 = 530.00 CUP

// Calcular monto en USD
const usd = calcularMontoUSD(530, 53);  // 530 CUP / 53 = 10.00 USD
```

## ⚙️ Opciones Disponibles

```javascript
const opciones = {
    only_kyc: 1,           // Solo usuarios con KYC verificado (0 o 1)
    only_vip: 1,           // Solo usuarios VIP (0 o 1)
    private: 1,            // Oferta privada, no pública (0 o 1)
    promote_offer: 1,      // Promocionar oferta (0 o 1)
    only_golden_check: 1,  // Solo usuarios con golden check (0 o 1)
    message: 'Tu mensaje', // Mensaje personalizado (opcional)
    webhook: 'https://...' // URL para notificaciones (opcional)
};
```

## 🧪 Probando la Utilidad

### Test Completo

```bash
node arbitrage/test-publicar-ofertas.js
```

Este test muestra:
- ✅ Cómo crear ofertas de compra
- ✅ Cómo crear ofertas de venta
- ✅ Ejemplos con diferentes métodos de pago
- ✅ IDs de monedas disponibles
- ✅ Opciones y configuraciones

### Ejemplo Simple

```bash
node EMPEZAR_AQUI/publicar-oferta.js
```

Un script simple y directo para publicar tu primera oferta.

## 🔄 Función Unificada

También puedes usar una función que detecta automáticamente el tipo:

```javascript
const { publicarOferta } = require('./arbitrage/utils/publicar-ofertas');

// Compra
await publicarOferta(email, password, 'buy', datosOferta, opciones, twoFactorCode);

// Venta
await publicarOferta(email, password, 'sell', datosOferta, opciones, twoFactorCode);

// También acepta español
await publicarOferta(email, password, 'compra', datosOferta, opciones, twoFactorCode);
await publicarOferta(email, password, 'venta', datosOferta, opciones, twoFactorCode);
```

## 💡 Consejos

### Para Ofertas de Compra
1. **No requieres balance** en tu cuenta
2. Configura una **tasa competitiva** (revisa el mercado)
3. Para que te acepten rápido: ofrece **un poco MÁS** que el promedio
4. Asegúrate que tus **datos de pago sean correctos**
5. **Responde rápido** cuando alguien acepte

### Para Ofertas de Venta
1. **Verifica tu balance** antes (o usa `verificarBalance: true`)
2. Configura una **tasa atractiva**
3. Para que te acepten rápido: ofrece **un poco MENOS** que el promedio
4. Confirma el pago cuando lo **recibas en tu cuenta bancaria**
5. El sistema liberará los fondos automáticamente

### Seguridad
- ✅ Usa `only_kyc: 1` para **solo usuarios verificados**
- ✅ Verifica siempre los **datos de la contraparte**
- ✅ No compartas información sensible por chat
- ✅ Confirma las transferencias en tu banco antes de liberar

## 🔗 Enlaces Útiles

- Ver ofertas activas: https://qvapay.com/p2p
- Documentación API: https://qvapay.com/docs
- Grupo de Telegram: https://t.me/+5oiHSysDWuM5YWYx

## 📞 Soporte

Si tienes dudas o problemas:
1. Revisa los ejemplos en `test-publicar-ofertas.js`
2. Lee los comentarios en el código
3. Únete al grupo de Telegram

## ⚠️ Importante

- Las ofertas creadas son **REALES** y aparecerán en el mercado P2P
- Asegúrate de **revisar todos los datos** antes de publicar
- Los scripts de ejemplo tienen el código **comentado** para evitar creaciones accidentales
- Para ofertas de venta, el balance se **bloquea** hasta que se complete o cancele la transacción
