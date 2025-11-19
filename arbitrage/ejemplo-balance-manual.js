#!/usr/bin/env node

/**
 * 🚀 EJEMPLO: Ejecutar Gestor de Compras con Balance Manual
 *
 * Este script muestra cómo ejecutar el gestor de compras escalonado
 * con un balance en CUP configurado manualmente.
 */

// Importar el gestor
const { spawn } = require('child_process');

// 💰 CONFIGURACIÓN MANUAL DEL BALANCE
const BALANCE_CUP_MANUAL = 25000; // Cambia este valor según tu balance real

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║   🚀 EJEMPLO: GESTOR COMPRA CON BALANCE MANUAL      ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('💰 BALANCE MANUAL CONFIGURADO:');
console.log(`   • CUP disponibles: ${BALANCE_CUP_MANUAL.toLocaleString()} CUP`);
console.log(`   • Equivalente aproximado: $${(BALANCE_CUP_MANUAL / 500).toFixed(0)} USD`);
console.log('');

console.log('⚙️  INSTRUCCIONES:');
console.log('   1. Edita config-gestor-compra.js y configura:');
console.log(`      balanceCupManual: ${BALANCE_CUP_MANUAL},`);
console.log('   2. O ejecuta con variable de entorno:');
console.log(`      BALANCE_CUP_MANUAL=${BALANCE_CUP_MANUAL} node arbitrage/gestor-compra-escalonado.js`);
console.log('');

console.log('📋 FORMAS DE CONFIGURAR EL BALANCE:');
console.log('');
console.log('   📁 MÉTODO 1 - Archivo de configuración:');
console.log('      Edita: arbitrage/config-gestor-compra.js');
console.log('      Cambia: balanceCupManual: null,');
console.log('      Por:    balanceCupManual: 25000,');
console.log('');
console.log('   🌍 MÉTODO 2 - Variable de entorno:');
console.log(`      BALANCE_CUP_MANUAL=${BALANCE_CUP_MANUAL} node arbitrage/gestor-compra-escalonado.js`);
console.log('');
console.log('   💻 MÉTODO 3 - Ejecutar este script:');
console.log('      node arbitrage/ejemplo-balance-manual.js');
console.log('');

console.log('═══════════════════════════════════════════════════════');
console.log('🚀 EJECUTANDO GESTOR CON BALANCE MANUAL...');
console.log('═══════════════════════════════════════════════════════\n');

// Ejecutar el gestor con la variable de entorno
const gestor = spawn('node', ['arbitrage/gestor-compra-escalonado.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        BALANCE_CUP_MANUAL: BALANCE_CUP_MANUAL.toString()
    }
});

// Manejar señales para detener el gestor
process.on('SIGINT', () => {
    console.log('\n\n🛑 Deteniendo gestor...');
    gestor.kill('SIGINT');
});

gestor.on('close', (code) => {
    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`✅ Gestor finalizado (código: ${code})`);
    console.log(`═══════════════════════════════════════════════════════\n`);
    process.exit(code);
});