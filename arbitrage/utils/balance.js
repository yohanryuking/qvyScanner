/**
 * 💰 Utilidades - Obtener Balance de Cuenta
 * 
 * Función para obtener el balance de la cuenta activa después de hacer login
 */

// Polyfill para fetch en versiones antiguas de Node
if (!globalThis.fetch) {
    globalThis.fetch = require('node-fetch');
}

const { qvapayLogin } = require('../../src');

/**
 * Obtener balance de la cuenta activa
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} twoFactorCode - Código 2FA (opcional)
 * @returns {Promise<Object>} Información del balance y datos de la cuenta
 */
async function obtenerBalance(email, password, twoFactorCode = null) {
    try {
        console.log('💰 Obteniendo balance de la cuenta...\n');
        
        const resultado = await qvapayLogin(email, password, twoFactorCode);
        
        const balanceInfo = {
            balance: resultado.me.balance,
            usuario: {
                nombre: `${resultado.me.name} ${resultado.me.lastname}`,
                email: resultado.me.email,
                username: resultado.me.username,
                uuid: resultado.me.uuid,
                kyc: resultado.me.kyc,
                vip: resultado.me.vip
            },
            token: resultado.accessToken
        };
        
        console.log('✅ Balance obtenido exitosamente!\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`💵 BALANCE: $${balanceInfo.balance}`);
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`👤 Usuario: ${balanceInfo.usuario.nombre}`);
        console.log(`📧 Email: ${balanceInfo.usuario.email}`);
        console.log(`🆔 Username: ${balanceInfo.usuario.username}`);
        console.log(`🔑 UUID: ${balanceInfo.usuario.uuid}`);
        console.log(`✅ KYC Verificado: ${balanceInfo.usuario.kyc ? '✅' : '❌'}`);
        console.log(`⭐ VIP: ${balanceInfo.usuario.vip ? '✅' : '❌'}`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        return balanceInfo;
        
    } catch (error) {
        console.error('❌ Error al obtener balance:');
        console.error(`   ${error.message}\n`);
        
        console.log('💡 Posibles causas:');
        console.log('   • Email o contraseña incorrectos');
        console.log('   • Tu cuenta no está verificada');
        console.log('   • Código 2FA incorrecto o expirado');
        console.log('   • Problemas de conexión a internet\n');
        
        throw error;
    }
}

/**
 * Obtener solo el balance (número) de la cuenta
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} twoFactorCode - Código 2FA (opcional)
 * @returns {Promise<number>} Balance de la cuenta
 */
async function obtenerSoloBalance(email, password, twoFactorCode = null) {
    try {
        const balanceInfo = await obtenerBalance(email, password, twoFactorCode);
        return parseFloat(balanceInfo.balance);
    } catch (error) {
        throw error;
    }
}

/**
 * Verificar si el balance es suficiente para una operación
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {number} montoRequerido - Monto requerido para la operación
 * @param {string} twoFactorCode - Código 2FA (opcional)
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function verificarBalanceSuficiente(email, password, montoRequerido, twoFactorCode = null) {
    try {
        const balanceActual = await obtenerSoloBalance(email, password, twoFactorCode);
        const suficiente = balanceActual >= montoRequerido;
        
        const resultado = {
            balanceActual,
            montoRequerido,
            suficiente,
            diferencia: balanceActual - montoRequerido
        };
        
        console.log('\n💵 VERIFICACIÓN DE BALANCE:');
        console.log(`   Balance actual: $${balanceActual.toFixed(2)}`);
        console.log(`   Monto requerido: $${montoRequerido.toFixed(2)}`);
        console.log(`   ${suficiente ? '✅' : '❌'} Balance ${suficiente ? 'suficiente' : 'insuficiente'}`);
        
        if (!suficiente) {
            console.log(`   ⚠️  Faltan: $${Math.abs(resultado.diferencia).toFixed(2)}`);
        } else {
            console.log(`   ✅ Sobrante: $${resultado.diferencia.toFixed(2)}`);
        }
        console.log('');
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Error al verificar balance:', error.message);
        throw error;
    }
}

module.exports = {
    obtenerBalance,
    obtenerSoloBalance,
    verificarBalanceSuficiente
};
