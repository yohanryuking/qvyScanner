const { obtenerBalance } = require('../utils/api-ofertas');
const config = require('../config-gestor-ofertas');

async function testBalance() {
    console.log('💵 Verificando saldo de la cuenta...\n');
    
    const resultado = await obtenerBalance(config.token);
    
    if (resultado.exito) {
        console.log('✅ Saldo obtenido exitosamente:');
        console.log(`   💰 Balance: ${resultado.balance.toFixed(2)} USD`);
        console.log(`   👤 Usuario: ${resultado.usuario.name || 'N/A'}`);
        console.log(`   📧 Email: ${resultado.usuario.email || 'N/A'}`);
        console.log(`   ✓ KYC: ${resultado.usuario.kyc ? 'Verificado' : 'No verificado'}`);
    } else {
        console.log('❌ Error al obtener balance:');
        console.log(`   ${resultado.error}`);
    }
}

testBalance();
