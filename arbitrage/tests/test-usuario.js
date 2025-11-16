/**
 * 🧪 TEST - Utilidad de Usuario
 * 
 * Prueba las funciones de la utilidad de usuario
 */

const {
    obtenerDatosUsuario,
    obtenerBalance,
    obtenerDatosExtendidos,
    verificarBalanceSuficiente
} = require('../utils/usuario');
const credenciales = require('../credenciales');

async function testUsuario() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     🧪 TEST - UTILIDAD DE USUARIO                   ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    // Test 1: Obtener datos básicos
    console.log('1️⃣  Obteniendo datos básicos del usuario...\n');
    const datosBasicos = await obtenerDatosUsuario(credenciales.token);
    
    if (datosBasicos.exito) {
        console.log('✅ Datos obtenidos exitosamente:');
        console.log(`   👤 Nombre: ${datosBasicos.nombre}`);
        console.log(`   📧 Username: ${datosBasicos.username}`);
        console.log(`   💰 Balance: $${datosBasicos.balance}`);
        console.log(`   ⚡ Satoshis: ${datosBasicos.satoshis}`);
        console.log(`   ✅ KYC: ${datosBasicos.kyc ? 'Sí' : 'No'}`);
        console.log(`   🔓 P2P Habilitado: ${datosBasicos.p2pHabilitado ? 'Sí' : 'No'}`);
        console.log(`   📱 Teléfono verificado: ${datosBasicos.verificado ? 'Sí' : 'No'}\n`);
    } else {
        console.log('❌ Error:', datosBasicos.error, '\n');
    }
    
    // Test 2: Obtener solo balance
    console.log('2️⃣  Obteniendo solo el balance...\n');
    const balance = await obtenerBalance(credenciales.token);
    
    if (balance.exito) {
        console.log('✅ Balance obtenido:');
        console.log(`   💰 $${balance.balance}\n`);
    } else {
        console.log('❌ Error:', balance.error, '\n');
    }
    
    // Test 3: Verificar balance suficiente
    console.log('3️⃣  Verificando si hay balance suficiente para operar...\n');
    const verificacion = await verificarBalanceSuficiente(credenciales.token, 100);
    
    if (verificacion.exito) {
        console.log('✅ Verificación completada:');
        console.log(`   💰 Balance actual: $${verificacion.balance}`);
        console.log(`   🎯 Cantidad requerida: $100`);
        console.log(`   ${verificacion.tieneSuficiente ? '✅' : '❌'} ${verificacion.tieneSuficiente ? 'Tiene suficiente' : 'No tiene suficiente'}`);
        if (!verificacion.tieneSuficiente) {
            console.log(`   📉 Faltante: $${verificacion.faltante}`);
        }
        console.log('');
    } else {
        console.log('❌ Error:', verificacion.error, '\n');
    }
    
    // Test 4: Obtener datos extendidos
    console.log('4️⃣  Obteniendo datos extendidos...\n');
    const datosExtendidos = await obtenerDatosExtendidos(credenciales.token);
    
    if (datosExtendidos.exito) {
        console.log('✅ Datos extendidos obtenidos:');
        console.log(`   💰 Balance: $${datosExtendidos.balance}`);
        console.log(`   ⏳ Balance pendiente: $${datosExtendidos.balancePendiente}`);
        console.log(`   ⭐ Trust Score: ${datosExtendidos.trustscore}`);
        console.log(`   👑 VIP: ${datosExtendidos.vip ? 'Sí' : 'No'}`);
        if (datosExtendidos.kycData) {
            console.log(`   🌎 País: ${datosExtendidos.kycData.country}`);
            console.log(`   📋 Estado KYC: ${datosExtendidos.kycData.result}`);
        }
        console.log('');
    } else {
        console.log('❌ Error:', datosExtendidos.error, '\n');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Test completado\n');
}

testUsuario().catch(error => {
    console.error('❌ Error en test:', error.message);
    process.exit(1);
});
