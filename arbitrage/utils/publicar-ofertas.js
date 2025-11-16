/**
 * 📝 Utilidades - Publicar Ofertas P2P
 * 
 * Funciones para crear ofertas de compra y venta en QvaPay P2P
 * Las ofertas de venta requieren balance suficiente
 */

// Polyfill para fetch en versiones antiguas de Node
if (!globalThis.fetch) {
    globalThis.fetch = require('node-fetch');
}

const { qvapayLogin, createP2POffer } = require('../../src');
const { obtenerSoloBalance, verificarBalanceSuficiente } = require('./balance');

/**
 * Códigos de monedas disponibles en P2P
 */
const MONEDAS = {
    BANK_CUP: 'BANK_CUP',     // Transferencias bancarias en CUP
    BANK_MLC: 'BANK_MLC',     // Transferencias bancarias en MLC
    ZELLE: 'ZELLE',           // Zelle
    CLASICA: 'CLASICA',       // Tarjeta clásica
    BOLSATM: 'BOLSATM',       // Bolsa TM
    USDCASH: 'USDCASH',       // USD en efectivo
    // Agrega más según necesites
};

/**
 * Publicar oferta de COMPRA en P2P
 * No requiere balance en la cuenta
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} datosOferta - Datos de la oferta
 * @param {number} datosOferta.coin - ID de la moneda (2=USDT, 33=BANK, etc)
 * @param {number} datosOferta.amount - Monto a comprar (en USD)
 * @param {number} datosOferta.receive - Monto a pagar (en CUP u otra moneda)
 * @param {Array} datosOferta.details - Detalles de pago [{name, value}]
 * @param {Object} [opciones] - Opciones adicionales
 * @param {number} [opciones.only_kyc] - Solo usuarios KYC (0 o 1)
 * @param {number} [opciones.only_vip] - Solo usuarios VIP (0 o 1)
 * @param {number} [opciones.private] - Oferta privada (0 o 1)
 * @param {string} [opciones.message] - Mensaje opcional
 * @param {string} [twoFactorCode] - Código 2FA si es necesario
 * @returns {Promise<Object>} Resultado de la creación
 */
async function publicarOfertaCompra(email, password, datosOferta, opciones = {}, twoFactorCode = null) {
    try {
        console.log('\n🟢 PUBLICANDO OFERTA DE COMPRA...');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Validar datos requeridos
        if (!datosOferta.coin || !datosOferta.amount || !datosOferta.receive || !datosOferta.details) {
            throw new Error('Faltan datos requeridos: coin, amount, receive, details');
        }
        
        if (!Array.isArray(datosOferta.details) || datosOferta.details.length === 0) {
            throw new Error('Los detalles de pago deben ser un array con al menos un elemento');
        }
        
        console.log('📊 Datos de la oferta:');
        console.log(`   💱 Moneda: ${datosOferta.coin}`);
        console.log(`   💰 Comprar: ${datosOferta.amount} USD`);
        console.log(`   💵 Pagar: ${datosOferta.receive} CUP`);
        console.log(`   📈 Tasa: ${(datosOferta.receive / datosOferta.amount).toFixed(2)} CUP/USD`);
        console.log(`   📋 Detalles: ${datosOferta.details.length} campos\n`);
        
        // Hacer login
        console.log('🔐 Autenticando...');
        const loginResult = await qvapayLogin(email, password, twoFactorCode);
        const token = loginResult.accessToken;
        console.log('✅ Autenticado\n');
        
        // Preparar datos de la oferta
        const ofertaCompleta = {
            type: 'buy',
            coin: datosOferta.coin,
            amount: datosOferta.amount,
            receive: datosOferta.receive,
            details: datosOferta.details,
            only_kyc: opciones.only_kyc || 0,
            only_vip: opciones.only_vip || 0,
            private: opciones.private || 0,
            promote_offer: opciones.promote_offer || 0,
            only_golden_check: opciones.only_golden_check || 0
        };
        
        if (opciones.message) {
            ofertaCompleta.message = opciones.message;
        }
        
        if (opciones.webhook) {
            ofertaCompleta.webhook = opciones.webhook;
        }
        
        // Crear la oferta
        console.log('📤 Publicando oferta...');
        const resultado = await createP2POffer(token, ofertaCompleta);
        
        console.log('\n✅ ¡OFERTA DE COMPRA PUBLICADA EXITOSAMENTE!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`🆔 UUID: ${resultado.p2p.uuid}`);
        console.log(`🔗 Link: https://qvapay.com/p2p/${resultado.p2p.uuid}`);
        console.log(`📊 Estado: ${resultado.p2p.status}`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        return {
            exito: true,
            oferta: resultado.p2p,
            link: `https://qvapay.com/p2p/${resultado.p2p.uuid}`,
            tipo: 'compra'
        };
        
    } catch (error) {
        console.error('❌ Error al publicar oferta de compra:', error.message);
        throw error;
    }
}

/**
 * Publicar oferta de VENTA en P2P
 * REQUIERE balance suficiente en la cuenta
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} datosOferta - Datos de la oferta
 * @param {number} datosOferta.coin - ID de la moneda (2=USDT, 33=BANK, etc)
 * @param {number} datosOferta.amount - Monto a vender (en USD)
 * @param {number} datosOferta.receive - Monto a recibir (en CUP u otra moneda)
 * @param {Array} datosOferta.details - Detalles de pago [{name, value}]
 * @param {Object} [opciones] - Opciones adicionales
 * @param {number} [opciones.only_kyc] - Solo usuarios KYC (0 o 1)
 * @param {number} [opciones.only_vip] - Solo usuarios VIP (0 o 1)
 * @param {number} [opciones.private] - Oferta privada (0 o 1)
 * @param {string} [opciones.message] - Mensaje opcional
 * @param {boolean} [opciones.verificarBalance] - Verificar balance antes (default: true)
 * @param {string} [twoFactorCode] - Código 2FA si es necesario
 * @returns {Promise<Object>} Resultado de la creación
 */
async function publicarOfertaVenta(email, password, datosOferta, opciones = {}, twoFactorCode = null) {
    try {
        console.log('\n🔴 PUBLICANDO OFERTA DE VENTA...');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Validar datos requeridos
        if (!datosOferta.coin || !datosOferta.amount || !datosOferta.receive || !datosOferta.details) {
            throw new Error('Faltan datos requeridos: coin, amount, receive, details');
        }
        
        if (!Array.isArray(datosOferta.details) || datosOferta.details.length === 0) {
            throw new Error('Los detalles de pago deben ser un array con al menos un elemento');
        }
        
        console.log('📊 Datos de la oferta:');
        console.log(`   💱 Moneda: ${datosOferta.coin}`);
        console.log(`   💰 Vender: ${datosOferta.amount} USD`);
        console.log(`   💵 Recibir: ${datosOferta.receive} CUP`);
        console.log(`   📈 Tasa: ${(datosOferta.receive / datosOferta.amount).toFixed(2)} CUP/USD`);
        console.log(`   📋 Detalles: ${datosOferta.details.length} campos\n`);
        
        // Verificar balance si está habilitado (por defecto sí)
        const debeVerificarBalance = opciones.verificarBalance !== false;
        
        if (debeVerificarBalance) {
            console.log('💰 Verificando balance disponible...');
            const verificacion = await verificarBalanceSuficiente(
                email, 
                password, 
                datosOferta.amount, 
                twoFactorCode
            );
            
            if (!verificacion.suficiente) {
                console.log('\n❌ BALANCE INSUFICIENTE PARA CREAR OFERTA DE VENTA');
                console.log('═══════════════════════════════════════════════════════════');
                console.log(`   Balance actual: $${verificacion.balanceActual.toFixed(2)}`);
                console.log(`   Monto requerido: $${verificacion.montoRequerido.toFixed(2)}`);
                console.log(`   Faltante: $${Math.abs(verificacion.diferencia).toFixed(2)}`);
                console.log('═══════════════════════════════════════════════════════════\n');
                
                throw new Error(`Balance insuficiente. Necesitas $${Math.abs(verificacion.diferencia).toFixed(2)} más`);
            }
            
            console.log('✅ Balance suficiente\n');
        }
        
        // Hacer login (si no se verificó balance, necesitamos el token)
        console.log('🔐 Autenticando...');
        const loginResult = await qvapayLogin(email, password, twoFactorCode);
        const token = loginResult.accessToken;
        console.log('✅ Autenticado\n');
        
        // Preparar datos de la oferta
        const ofertaCompleta = {
            type: 'sell',
            coin: datosOferta.coin,
            amount: datosOferta.amount,
            receive: datosOferta.receive,
            details: datosOferta.details,
            only_kyc: opciones.only_kyc || 0,
            only_vip: opciones.only_vip || 0,
            private: opciones.private || 0,
            promote_offer: opciones.promote_offer || 0,
            only_golden_check: opciones.only_golden_check || 0
        };
        
        if (opciones.message) {
            ofertaCompleta.message = opciones.message;
        }
        
        if (opciones.webhook) {
            ofertaCompleta.webhook = opciones.webhook;
        }
        
        // Crear la oferta
        console.log('📤 Publicando oferta...');
        const resultado = await createP2POffer(token, ofertaCompleta);
        
        console.log('\n✅ ¡OFERTA DE VENTA PUBLICADA EXITOSAMENTE!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`🆔 UUID: ${resultado.p2p.uuid}`);
        console.log(`🔗 Link: https://qvapay.com/p2p/${resultado.p2p.uuid}`);
        console.log(`📊 Estado: ${resultado.p2p.status}`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        return {
            exito: true,
            oferta: resultado.p2p,
            link: `https://qvapay.com/p2p/${resultado.p2p.uuid}`,
            tipo: 'venta'
        };
        
    } catch (error) {
        console.error('❌ Error al publicar oferta de venta:', error.message);
        throw error;
    }
}

/**
 * Publicar oferta (detecta automáticamente si es compra o venta)
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {string} tipo - Tipo: 'buy' o 'sell' (o 'compra' o 'venta')
 * @param {Object} datosOferta - Datos de la oferta
 * @param {Object} [opciones] - Opciones adicionales
 * @param {string} [twoFactorCode] - Código 2FA si es necesario
 * @returns {Promise<Object>} Resultado de la creación
 */
async function publicarOferta(email, password, tipo, datosOferta, opciones = {}, twoFactorCode = null) {
    // Normalizar el tipo
    const tipoNormalizado = tipo.toLowerCase();
    
    if (tipoNormalizado === 'buy' || tipoNormalizado === 'compra') {
        return await publicarOfertaCompra(email, password, datosOferta, opciones, twoFactorCode);
    } else if (tipoNormalizado === 'sell' || tipoNormalizado === 'venta') {
        return await publicarOfertaVenta(email, password, datosOferta, opciones, twoFactorCode);
    } else {
        throw new Error('Tipo inválido. Debe ser: buy, sell, compra o venta');
    }
}

/**
 * Crear detalles de pago para transferencia bancaria (CUP)
 * Helper para facilitar la creación de detalles
 */
function crearDetallesBancoCUP(nombre, banco, cuenta, telefono) {
    return [
        { name: 'Nombre y Apellidos', value: nombre },
        { name: 'Nombre del Banco', value: banco },
        { name: 'Nro de Cuenta', value: cuenta },
        { name: 'Nro de telefono', value: telefono }
    ];
}

/**
 * Crear detalles de pago para Zelle
 */
function crearDetallesZelle(nombre, email, telefono = '') {
    const detalles = [
        { name: 'Nombre y Apellidos', value: nombre },
        { name: 'Email', value: email }
    ];
    
    if (telefono) {
        detalles.push({ name: 'Teléfono', value: telefono });
    }
    
    return detalles;
}

/**
 * Crear detalles de pago para tarjeta magnética
 */
function crearDetallesTarjeta(nombre, numeroTarjeta, telefono) {
    return [
        { name: 'Nombre y Apellidos', value: nombre },
        { name: 'Nro de tarjeta', value: numeroTarjeta },
        { name: 'Nro de celular', value: telefono }
    ];
}

/**
 * Calcular tasa de cambio
 */
function calcularTasa(montoCUP, montoUSD) {
    return (montoCUP / montoUSD).toFixed(2);
}

/**
 * Calcular monto en CUP dado USD y tasa
 */
function calcularMontoCUP(montoUSD, tasa) {
    return (montoUSD * tasa).toFixed(2);
}

/**
 * Calcular monto en USD dado CUP y tasa
 */
function calcularMontoUSD(montoCUP, tasa) {
    return (montoCUP / tasa).toFixed(2);
}

module.exports = {
    // Funciones principales
    publicarOferta,
    publicarOfertaCompra,
    publicarOfertaVenta,
    
    // Helpers para detalles de pago
    crearDetallesBancoCUP,
    crearDetallesZelle,
    crearDetallesTarjeta,
    
    // Helpers de cálculo
    calcularTasa,
    calcularMontoCUP,
    calcularMontoUSD,
    
    // Constantes
    MONEDAS
};
