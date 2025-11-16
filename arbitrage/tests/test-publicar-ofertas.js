/**
 * 🧪 Test - Publicar Ofertas P2P
 * 
 * Script para probar la publicación de ofertas de compra y venta
 * 
 * INSTRUCCIONES:
 * 1. Cambia EMAIL y PASSWORD por tus datos reales
 * 2. Si tienes 2FA, pon el código en TWO_FACTOR_CODE
 * 3. REVISA los datos de las ofertas antes de ejecutar
 * 4. Ejecuta: node arbitrage/test-publicar-ofertas.js
 * 
 * ⚠️ IMPORTANTE: Este script creará ofertas REALES
 *    Revisa bien los datos antes de ejecutar
 */

const {
    publicarOfertaCompra,
    publicarOfertaVenta,
    crearDetallesTarjeta,
    crearDetallesZelle,
    calcularTasa,
    MONEDAS
} = require('../utils/publicar-ofertas');

// ⬇️ CAMBIA ESTOS DATOS POR LOS TUYOS
const EMAIL = 'yohanryuking@gmail.com';
const PASSWORD = 'yohanRK*01';
const TWO_FACTOR_CODE = '1897'; // Deja null si no tienes 2FA

// ⬇️ CAMBIA ESTOS DATOS POR TU INFORMACIÓN DE PAGO
const MI_NOMBRE = 'Yohan Ryuking';
const MI_BANCO = 'Banco Popular de Ahorro';
const MI_TARJETA = '9227069998055910';
const MI_TELEFONO = '56060886';

async function testPublicarOfertas() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║        🧪 TEST - PUBLICAR OFERTAS P2P EN QVAPAY         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('⚠️  IMPORTANTE: Este test creará ofertas REALES');
    console.log('   Asegúrate de revisar los datos antes de continuar\n');
    
    // Preguntar confirmación (en un script real podrías usar readline)
    console.log('📝 Datos configurados:');
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Nombre: ${MI_NOMBRE}`);
    console.log(`   Banco: ${MI_BANCO}`);
    console.log(`   Tarjeta: ${MI_TARJETA}`);
    console.log(`   Teléfono: ${MI_TELEFONO}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        // ========================================
        // TEST 1: Publicar oferta de COMPRA
        // ========================================
        console.log('📋 TEST 1: Publicar oferta de COMPRA (no requiere balance)\n');
        
        const detallesCompra = crearDetallesTarjeta(
            MI_NOMBRE,
            MI_TARJETA,
            MI_TELEFONO
        );
        
        const datosOfertaCompra = {
            coin: 'BANK_CUP',     // BANK_CUP para transferencias en CUP
            amount: 10,           // Comprar 10 USD
            receive: 4950,        // Pagar 4950 CUP (tasa: 495)
            details: detallesCompra
        };
        
        const opcionesCompra = {
            only_kyc: 1,          // Solo usuarios verificados
            private: 0,           // Oferta pública
            message: 'Compro USDT, respondo rápido ⚡'
        };
        
        console.log('💡 Esta oferta NO requiere balance en tu cuenta');
        console.log(`   Tasa: ${calcularTasa(datosOfertaCompra.receive, datosOfertaCompra.amount)} CUP/USD\n`);
        
        // Crear oferta real
        const resultadoCompra = await publicarOfertaCompra(
            EMAIL,
            PASSWORD,
            datosOfertaCompra,
            opcionesCompra,
            TWO_FACTOR_CODE
        );
        
        console.log('✅ Oferta de compra creada:');
        console.log(`   UUID: ${resultadoCompra.oferta.uuid}`);
        console.log(`   Link: ${resultadoCompra.link}\n`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // ========================================
        // TEST 2: Publicar oferta de VENTA
        // ========================================
        console.log('📋 TEST 2: Publicar oferta de VENTA (REQUIERE balance)\n');
        
        const detallesVenta = crearDetallesTarjeta(
            MI_NOMBRE,
            MI_TARJETA,
            MI_TELEFONO
        );
        
        const datosOfertaVenta = {
            coin: 'BANK_CUP',     // BANK_CUP para transferencias en CUP
            amount: 5,            // Vender 5 USD
            receive: 2600,        // Recibir 2600 CUP (tasa: 520)
            details: detallesVenta
        };
        
        const opcionesVenta = {
            only_kyc: 1,          // Solo usuarios verificados
            only_vip: 0,          // No solo VIP
            private: 0,           // Oferta pública
            message: 'Vendo USDT, pago rápido 🚀',
            verificarBalance: true // Verificar balance antes
        };
        
        console.log('⚠️  Esta oferta REQUIERE tener balance en tu cuenta');
        console.log(`   Necesitas: ${datosOfertaVenta.amount} USD`);
        console.log(`   Tasa: ${calcularTasa(datosOfertaVenta.receive, datosOfertaVenta.amount)} CUP/USD\n`);
        
        // Crear oferta real
        const resultadoVenta = await publicarOfertaVenta(
            EMAIL,
            PASSWORD,
            datosOfertaVenta,
            opcionesVenta,
            TWO_FACTOR_CODE
        );
        
        console.log('✅ Oferta de venta creada:');
        console.log(`   UUID: ${resultadoVenta.oferta.uuid}`);
        console.log(`   Link: ${resultadoVenta.link}\n`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // ========================================
        // TEST 3: Ejemplos de otros métodos de pago
        // ========================================
        console.log('📋 TEST 3: Ejemplos de otros métodos de pago\n');
        
        // Ejemplo con Zelle
        const detallesZelle = crearDetallesZelle(
            'John Doe',
            'john.doe@example.com',
            '+1234567890'
        );
        console.log('💳 Detalles para Zelle:');
        console.log(JSON.stringify(detallesZelle, null, 2));
        console.log('');
        
        // Ejemplo con tarjeta
        const detallesTarjeta = crearDetallesTarjeta(
            MI_NOMBRE,
            '9760039001179455',
            MI_TELEFONO
        );
        console.log('💳 Detalles para tarjeta magnética:');
        console.log(JSON.stringify(detallesTarjeta, null, 2));
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // ========================================
        // Información útil
        // ========================================
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📚 INFORMACIÓN ÚTIL');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('💰 IDs de Monedas Disponibles:');
        console.log(`   USDT: ${MONEDAS.USDT}`);
        console.log(`   BANK: ${MONEDAS.BANK}`);
        console.log(`   ZELLE: ${MONEDAS.ZELLE}\n`);
        
        console.log('📊 Diferencias entre Compra y Venta:\n');
        console.log('🟢 COMPRA (buy):');
        console.log('   • NO requiere balance en tu cuenta');
        console.log('   • Publicas que quieres COMPRAR');
        console.log('   • Otros te venden a ti');
        console.log('   • Tú PAGAS en CUP/Fiat');
        console.log('   • Tú RECIBES en USD/Cripto\n');
        
        console.log('🔴 VENTA (sell):');
        console.log('   • REQUIERE balance en tu cuenta');
        console.log('   • Publicas que quieres VENDER');
        console.log('   • Otros te compran a ti');
        console.log('   • Tú RECIBES en CUP/Fiat');
        console.log('   • Tú ENVÍAS en USD/Cripto\n');
        
        console.log('⚙️  Opciones Disponibles:');
        console.log('   only_kyc: 1        → Solo usuarios verificados');
        console.log('   only_vip: 1        → Solo usuarios VIP');
        console.log('   private: 1         → Oferta privada (no pública)');
        console.log('   promote_offer: 1   → Promocionar oferta');
        console.log('   only_golden_check: 1 → Solo golden check\n');
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ Test informativo completado');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('💡 Para crear ofertas reales:');
        console.log('   1. Revisa los datos configurados arriba');
        console.log('   2. Descomenta las secciones de creación');
        console.log('   3. Ejecuta el script de nuevo\n');
        
    } catch (error) {
        console.error('\n❌ Error en los tests:', error.message);
        console.log('\n💡 Asegúrate de:');
        console.log('   • Tener el email y password correctos');
        console.log('   • Si tienes 2FA, poner el código correcto');
        console.log('   • Para ventas: tener balance suficiente');
        console.log('   • Tener conexión a internet\n');
    }
}

// Ejecutar el test
testPublicarOfertas();
