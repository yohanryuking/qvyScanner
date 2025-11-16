/**
 * 🧪 Test - Buscar Moneda BANK_CUP
 * 
 * Script para encontrar el ID correcto de BANK_CUP
 */

const { buscarMoneda, obtenerMonedasP2P } = require('../utils/monedas');

async function buscarBankCUP() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║          🔍 BUSCAR MONEDA BANK_CUP                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    try {
        // Buscar por "BANK"
        console.log('🔍 Buscando por "BANK"...\n');
        await buscarMoneda('BANK');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Buscar por "CUP"
        console.log('🔍 Buscando por "CUP"...\n');
        await buscarMoneda('CUP');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Listar todas las monedas P2P
        console.log('📋 Listando todas las monedas P2P disponibles...\n');
        await obtenerMonedasP2P();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar
buscarBankCUP();
