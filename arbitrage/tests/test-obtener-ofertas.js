/**
 * 🧪 Test - Verificar obtención de ofertas del mercado
 */

const fetch = require('node-fetch');
const config = require('../config-gestor-ofertas');

async function testObtenerOfertas() {
    console.log('🧪 Probando obtención de ofertas del mercado...\n');
    
    try {
        console.log('📡 Obteniendo página 1...');
        const response1 = await fetch('https://api.qvapay.com/p2p/index?page=1', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.token}`
            }
        });
        
        const result1 = await response1.json();
        
        console.log('📊 Respuesta página 1:');
        console.log('   Status:', response1.status);
        console.log('   OK:', response1.ok);
        console.log('   Data keys:', Object.keys(result1));
        
        if (result1.data) {
            console.log('   Ofertas encontradas:', result1.data.length);
            
            if (result1.data.length > 0) {
                console.log('\n📋 Primera oferta de ejemplo:');
                const primera = result1.data[0];
                console.log('   UUID:', primera.uuid);
                console.log('   Tipo:', primera.type);
                console.log('   Moneda:', primera.coin);
                console.log('   Monto:', primera.amount, 'USD');
                console.log('   Recibe:', primera.receive, 'CUP');
                console.log('   Tasa:', (primera.receive / primera.amount).toFixed(2), 'CUP/USD');
                console.log('   KYC:', primera.only_kyc ? '✅' : '❌');
                console.log('   VIP:', primera.only_vip ? '✅' : '❌');
                console.log('   Privada:', primera.private ? '✅' : '❌');
            }
        } else {
            console.log('   ⚠️  No hay campo "data" en la respuesta');
            console.log('   Respuesta completa:', JSON.stringify(result1, null, 2));
        }
        
        // Probar página 2
        console.log('\n📡 Obteniendo página 2...');
        const response2 = await fetch('https://api.qvapay.com/p2p/index?page=2', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.token}`
            }
        });
        
        const result2 = await response2.json();
        
        console.log('📊 Respuesta página 2:');
        console.log('   Status:', response2.status);
        console.log('   Ofertas encontradas:', result2.data?.length || 0);
        
        // Resumen
        const total = (result1.data?.length || 0) + (result2.data?.length || 0);
        console.log('\n✅ RESUMEN:');
        console.log(`   Total ofertas: ${total}`);
        console.log(`   Página 1: ${result1.data?.length || 0}`);
        console.log(`   Página 2: ${result2.data?.length || 0}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

testObtenerOfertas();
