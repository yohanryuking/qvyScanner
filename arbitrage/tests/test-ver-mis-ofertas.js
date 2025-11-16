/**
 * 🧪 Test - Ver Mis Ofertas Publicadas
 * 
 * Script para ver las ofertas que has publicado y verificar sus datos
 */

const fetch = require('node-fetch');
const { qvapayLogin } = require('../src');

// ⬇️ CAMBIA ESTOS DATOS POR LOS TUYOS
const EMAIL = 'yohanryuking@gmail.com';
const PASSWORD = 'yohanRK*01';
const TWO_FACTOR_CODE = '1897';

async function verMisOfertas() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║              📋 VER MIS OFERTAS PUBLICADAS               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    try {
        // Hacer login
        console.log('🔐 Autenticando...');
        const loginResult = await qvapayLogin(EMAIL, PASSWORD, TWO_FACTOR_CODE);
        const token = loginResult.accessToken;
        console.log('✅ Autenticado\n');
        
        // Obtener mis ofertas
        const url = 'https://api.qvapay.com/p2p/index?own=true';
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.data) {
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`📊 MIS OFERTAS: ${result.data.length}`);
            console.log('═══════════════════════════════════════════════════════════\n');
            
            if (result.data.length === 0) {
                console.log('⚠️  No tienes ofertas publicadas\n');
                return;
            }
            
            result.data.forEach((oferta, index) => {
                console.log(`${index + 1}. ${oferta.type === 'buy' ? '🟢 COMPRA' : '🔴 VENTA'}`);
                console.log(`   🆔 UUID: ${oferta.uuid}`);
                console.log(`   💱 Coin: ${oferta.coin}`);
                console.log(`   📊 Coin (objeto):`, JSON.stringify(oferta.Coin, null, 2));
                console.log(`   💰 Monto: ${oferta.amount} USD`);
                console.log(`   💵 Recibir: ${oferta.receive} CUP`);
                console.log(`   📈 Tasa: ${(oferta.receive / oferta.amount).toFixed(2)} CUP/USD`);
                console.log(`   📊 Estado: ${oferta.status}`);
                console.log(`   🔓 Pública: ${oferta.private ? 'No' : 'Sí'}`);
                console.log(`   ✅ Solo KYC: ${oferta.only_kyc ? 'Sí' : 'No'}`);
                console.log(`   🔗 Link: https://qvapay.com/p2p/${oferta.uuid}`);
                console.log('');
            });
            
            console.log('═══════════════════════════════════════════════════════════\n');
            
            // Mostrar info detallada de la primera oferta
            if (result.data.length > 0) {
                console.log('📦 Datos completos de la primera oferta:');
                console.log(JSON.stringify(result.data[0], null, 2));
                console.log('');
            }
            
        } else {
            console.error('❌ Error al obtener ofertas:');
            console.error(JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar
verMisOfertas();
