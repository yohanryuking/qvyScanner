/**
 * 🧪 TEST - DETECTOR DE TENDENCIA DEL MERCADO
 * 
 * Analiza el sentimiento actual del mercado P2P
 */

const {
    analizarMercadoRapido,
    mostrarAnalisis
} = require('../utils/detector-tendencia');
const credenciales = require('../credenciales');

async function testDetectorTendencia() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     🧪 TEST - DETECTOR DE TENDENCIA DEL MERCADO         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Analizando mercado completo (todas las monedas)...\n');
    
    // Análisis del mercado completo
    const analisisCompleto = await analizarMercadoRapido(credenciales.token, {
        // Sin filtros = todas las ofertas
    });
    
    if (analisisCompleto) {
        mostrarAnalisis(analisisCompleto);
    }
    
    // Análisis solo de CUP
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 Analizando solo mercado CUP (BANK_CUP + BOLSATM)...\n');
    
    const analisisCUP = await analizarMercadoRapido(credenciales.token, {
        moneda: ['BANK_CUP', 'BOLSATM'],
        soloKYC: true,
        excluirVIP: true,
        soloPublicas: true
    });
    
    if (analisisCUP) {
        mostrarAnalisis(analisisCUP);
    }
    
    // Análisis solo BANK_CUP
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 Analizando solo BANK_CUP...\n');
    
    const analisisBankCup = await analizarMercadoRapido(credenciales.token, {
        moneda: 'BANK_CUP',
        soloKYC: true,
        excluirVIP: true,
        soloPublicas: true
    });
    
    if (analisisBankCup) {
        mostrarAnalisis(analisisBankCup);
    }
}

// Ejecutar test
testDetectorTendencia().catch(error => {
    console.error('❌ Error en test:', error.message);
    process.exit(1);
});
