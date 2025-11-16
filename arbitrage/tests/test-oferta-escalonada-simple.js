/**
 * TEST: Crear UNA sola oferta escalonada para verificar el tipo
 */

const { crearOferta } = require('../utils/api-ofertas');
const { calcularPreciosArbitraje } = require('../utils/calcular-precios');
const { obtenerBalance } = require('../utils/usuario');

const MONEDA = 'BANK_CUP';
const TIPO_OFERTA = 'venta'; // Queremos VENDER USD

async function testOfertaSimple() {
    console.log('🧪 TEST: Crear oferta de VENTA de $1 USD\n');

    try {
        // 1. Obtener balance
        console.log('💰 Obteniendo balance...');
        const balance = await obtenerBalance();
        console.log(`   ✅ Balance: $${balance.toFixed(2)} USD\n`);

        if (balance < 1) {
            console.log('❌ Balance insuficiente para crear oferta de $1');
            return;
        }

        // 2. Calcular precios
        console.log('📊 Calculando precio de venta...');
        const precios = await calcularPreciosArbitraje();
        const precioVenta = precios.BANK_CUP.precioVentaOptimo;
        console.log(`   ✅ Precio de venta: ${precioVenta.toFixed(2)} CUP/USD\n`);

        // 3. Preparar oferta
        const cantidadUSD = 1;
        const cantidadCUP = Math.floor(cantidadUSD * precioVenta);

        const datosOferta = {
            type: TIPO_OFERTA === 'venta' ? 'sell' : 'buy',
            coin: MONEDA,
            amount: cantidadUSD,
            receive: cantidadCUP,
            details: 'Transfermovil',
            only_kyc: 1,
            private: 0,
            only_vip: 0
        };

        console.log('📝 Datos de la oferta:');
        console.log(`   • Tipo: ${datosOferta.type} (${TIPO_OFERTA === 'venta' ? 'YO VENDO USD' : 'YO COMPRO USD'})`);
        console.log(`   • Moneda: ${datosOferta.coin}`);
        console.log(`   • Cantidad: $${datosOferta.amount} USD`);
        console.log(`   • Recibo: ${datosOferta.receive} CUP`);
        console.log(`   • Tasa: ${(datosOferta.receive / datosOferta.amount).toFixed(2)} CUP/USD\n`);

        // 4. Crear oferta
        console.log('🚀 Creando oferta...');
        const resultado = await crearOferta(datosOferta);

        if (resultado.success) {
            console.log(`   ✅ Oferta creada con éxito!`);
            console.log(`   🆔 ID: ${resultado.data.id}`);
            console.log(`   📋 Tipo en API: ${resultado.data.type}`);
            console.log(`   💰 Cantidad: $${resultado.data.amount} USD → ${resultado.data.receive} CUP\n`);
            
            if (resultado.data.type === 'sell' && TIPO_OFERTA === 'venta') {
                console.log('✅ ¡CORRECTO! La oferta es de tipo "sell" (VENDES USD)\n');
            } else if (resultado.data.type === 'buy' && TIPO_OFERTA === 'venta') {
                console.log('❌ ¡ERROR! La oferta es de tipo "buy" (COMPRAS USD) pero queríamos VENDER\n');
            }
        } else {
            console.log(`   ❌ Error al crear oferta: ${resultado.message}`);
        }

    } catch (error) {
        console.error('❌ Error en test:', error.message);
    }
}

testOfertaSimple();
