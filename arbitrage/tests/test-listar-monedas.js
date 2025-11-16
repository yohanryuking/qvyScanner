/**
 * 🧪 Test - Listar TODAS las Monedas
 */

const { obtenerTodasLasMonedas } = require('../utils/monedas');

async function listarTodasLasMonedas() {
    try {
        await obtenerTodasLasMonedas();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listarTodasLasMonedas();
