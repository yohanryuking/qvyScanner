/**
 * 🧪 Test - Obtener Balance de Cuenta
 * 
 * Script para probar la función de obtener balance
 * 
 * INSTRUCCIONES:
 * 1. Cambia EMAIL y PASSWORD por tus datos reales
 * 2. Si tienes 2FA, pon el código en TWO_FACTOR_CODE
 * 3. Ejecuta: node arbitrage/test-balance.js
 */

const { obtenerBalance, obtenerSoloBalance, verificarBalanceSuficiente } = require('../utils/balance');

// ⬇️ CAMBIA ESTOS DATOS POR LOS TUYOS
const EMAIL = 'yohanryuking@gmail.com';
const PASSWORD = 'yohanRK*01';
const TWO_FACTOR_CODE = '1897'; // Deja null si no tienes 2FA o pon tu código

async function testBalance() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           🧪 TEST - OBTENER BALANCE DE CUENTA            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    try {
        // TEST 1: Obtener balance completo
        console.log('📋 TEST 1: Obtener balance completo con datos del usuario\n');
        const balanceCompleto = await obtenerBalance(EMAIL, PASSWORD, TWO_FACTOR_CODE);
        
        console.log('📊 Resultado completo:');
        console.log(JSON.stringify(balanceCompleto, null, 2));
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // TEST 2: Obtener solo el número del balance
        console.log('📋 TEST 2: Obtener solo el número del balance\n');
        const soloBalance = await obtenerSoloBalance(EMAIL, PASSWORD, TWO_FACTOR_CODE);
        
        console.log(`💰 Balance (número): $${soloBalance.toFixed(2)}`);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // TEST 3: Verificar si el balance es suficiente para una operación
        console.log('📋 TEST 3: Verificar si el balance es suficiente\n');
        
        const montoRequerido1 = 10; // Requiere $10
        await verificarBalanceSuficiente(EMAIL, PASSWORD, montoRequerido1, TWO_FACTOR_CODE);
        
        const montoRequerido2 = 100; // Requiere $100
        await verificarBalanceSuficiente(EMAIL, PASSWORD, montoRequerido2, TWO_FACTOR_CODE);
        
        const montoRequerido3 = 1000; // Requiere $1000
        await verificarBalanceSuficiente(EMAIL, PASSWORD, montoRequerido3, TWO_FACTOR_CODE);
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ ¡Todos los tests completados exitosamente!');
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ Error en los tests:', error.message);
        console.log('\n💡 Asegúrate de:');
        console.log('   • Tener el email y password correctos');
        console.log('   • Si tienes 2FA, poner el código correcto');
        console.log('   • Tener conexión a internet');
        console.log('   • Tu cuenta esté verificada\n');
    }
}

// Ejecutar el test
testBalance();
