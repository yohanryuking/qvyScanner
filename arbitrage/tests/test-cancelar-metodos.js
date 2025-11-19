/**
 * 🧪 TEST AVANZADO: CANCELAR OFERTAS
 * 
 * Prueba diferentes métodos para cancelar ofertas:
 * 1. POST /p2p/{uuid}/cancel
 * 2. DELETE /p2p/{uuid}
 * 3. PUT /p2p/{uuid}/cancel
 */

const fetch = require('node-fetch');
const config = require('../config-gestor-ofertas');
const { obtenerMisOfertas } = require('../utils/api-ofertas');

const API_BASE_URL = 'https://api.qvapay.com';

/**
 * Método 1: POST /p2p/{uuid}/cancel
 */
async function cancelarConPOST(token, uuid) {
    const url = `${API_BASE_URL}/p2p/${uuid}/cancel`;
    
    console.log(`   🔹 URL: ${url}`);
    console.log(`   🔹 Método: POST`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        let datos;
        
        if (contentType && contentType.includes('application/json')) {
            datos = await response.json();
        } else {
            datos = await response.text();
        }
        
        console.log(`   📊 Status: ${response.status} ${response.statusText}`);
        console.log(`   📋 Respuesta:`, typeof datos === 'object' ? JSON.stringify(datos, null, 2) : datos);
        
        return {
            exito: response.ok,
            status: response.status,
            datos: datos
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { exito: false, error: error.message };
    }
}

/**
 * Método 2: DELETE /p2p/{uuid}
 */
async function cancelarConDELETE(token, uuid) {
    const url = `${API_BASE_URL}/p2p/${uuid}`;
    
    console.log(`   🔹 URL: ${url}`);
    console.log(`   🔹 Método: DELETE`);
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        let datos;
        
        if (contentType && contentType.includes('application/json')) {
            datos = await response.json();
        } else {
            datos = await response.text();
        }
        
        console.log(`   📊 Status: ${response.status} ${response.statusText}`);
        console.log(`   📋 Respuesta:`, typeof datos === 'object' ? JSON.stringify(datos, null, 2) : datos);
        
        return {
            exito: response.ok,
            status: response.status,
            datos: datos
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { exito: false, error: error.message };
    }
}

/**
 * Método 3: PUT /p2p/{uuid}/cancel
 */
async function cancelarConPUT(token, uuid) {
    const url = `${API_BASE_URL}/p2p/${uuid}/cancel`;
    
    console.log(`   🔹 URL: ${url}`);
    console.log(`   🔹 Método: PUT`);
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        let datos;
        
        if (contentType && contentType.includes('application/json')) {
            datos = await response.json();
        } else {
            datos = await response.text();
        }
        
        console.log(`   📊 Status: ${response.status} ${response.statusText}`);
        console.log(`   📋 Respuesta:`, typeof datos === 'object' ? JSON.stringify(datos, null, 2) : datos);
        
        return {
            exito: response.ok,
            status: response.status,
            datos: datos
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { exito: false, error: error.message };
    }
}

/**
 * Método 4: POST /p2p/{uuid} con body status=cancelled
 */
async function cancelarConPOSTBody(token, uuid) {
    const url = `${API_BASE_URL}/p2p/${uuid}`;
    
    console.log(`   🔹 URL: ${url}`);
    console.log(`   🔹 Método: POST con body {status: "cancelled"}`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        const contentType = response.headers.get('content-type');
        let datos;
        
        if (contentType && contentType.includes('application/json')) {
            datos = await response.json();
        } else {
            datos = await response.text();
        }
        
        console.log(`   📊 Status: ${response.status} ${response.statusText}`);
        console.log(`   📋 Respuesta:`, typeof datos === 'object' ? JSON.stringify(datos, null, 2) : datos);
        
        return {
            exito: response.ok,
            status: response.status,
            datos: datos
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { exito: false, error: error.message };
    }
}

async function testCancelarMetodos() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🧪 TEST AVANZADO: CANCELAR OFERTAS                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    try {
        // Obtener ofertas
        console.log('📋 Obteniendo tus ofertas...\n');
        const ofertas = await obtenerMisOfertas(config.token);
        
        const ofertasAbiertas = ofertas.filter(o => 
            o.status === 'open' && !o.peer_id
        );
        
        if (ofertasAbiertas.length === 0) {
            console.log('⚠️  No tienes ofertas abiertas sin peer para cancelar\n');
            console.log('💡 Crea una oferta de prueba primero para probar la cancelación');
            return;
        }
        
        // Mostrar ofertas disponibles
        console.log(`✅ Encontradas ${ofertasAbiertas.length} ofertas abiertas:\n`);
        ofertasAbiertas.forEach((o, i) => {
            const tipo = o.type === 'buy' ? '🟢 COMPRA' : '🔴 VENTA';
            console.log(`${i + 1}. ${tipo} - ${o.amount} USD → ${o.receive} CUP`);
            console.log(`   UUID: ${o.uuid}`);
            console.log(`   Creada: ${new Date(o.created_at).toLocaleString('es-ES')}`);
            console.log('');
        });
        
        // Usar la primera oferta para pruebas
        const ofertaPrueba = ofertasAbiertas[0];
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎯 PROBANDO DIFERENTES MÉTODOS DE CANCELACIÓN');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(`Oferta de prueba: ${ofertaPrueba.uuid}`);
        console.log(`Tipo: ${ofertaPrueba.type === 'buy' ? 'COMPRA' : 'VENTA'}`);
        console.log(`Monto: ${ofertaPrueba.amount} USD\n`);
        
        // Probar método 1: POST /cancel
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1️⃣  MÉTODO 1: POST /p2p/{uuid}/cancel');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const resultado1 = await cancelarConPOST(config.token, ofertaPrueba.uuid);
        
        if (resultado1.exito) {
            console.log('\n✅ ÉXITO con POST /cancel\n');
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ Método correcto encontrado: POST /p2p/{uuid}/cancel');
            console.log('═══════════════════════════════════════════════════════\n');
            return;
        }
        
        console.log('\n❌ POST /cancel no funcionó, probando siguiente método...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Probar método 2: DELETE
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('2️⃣  MÉTODO 2: DELETE /p2p/{uuid}');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const resultado2 = await cancelarConDELETE(config.token, ofertaPrueba.uuid);
        
        if (resultado2.exito) {
            console.log('\n✅ ÉXITO con DELETE\n');
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ Método correcto encontrado: DELETE /p2p/{uuid}');
            console.log('═══════════════════════════════════════════════════════\n');
            return;
        }
        
        console.log('\n❌ DELETE no funcionó, probando siguiente método...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Probar método 3: PUT /cancel
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('3️⃣  MÉTODO 3: PUT /p2p/{uuid}/cancel');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const resultado3 = await cancelarConPUT(config.token, ofertaPrueba.uuid);
        
        if (resultado3.exito) {
            console.log('\n✅ ÉXITO con PUT /cancel\n');
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ Método correcto encontrado: PUT /p2p/{uuid}/cancel');
            console.log('═══════════════════════════════════════════════════════\n');
            return;
        }
        
        console.log('\n❌ PUT /cancel no funcionó, probando siguiente método...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Probar método 4: POST con body
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('4️⃣  MÉTODO 4: POST /p2p/{uuid} con body');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const resultado4 = await cancelarConPOSTBody(config.token, ofertaPrueba.uuid);
        
        if (resultado4.exito) {
            console.log('\n✅ ÉXITO con POST + body\n');
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ Método correcto encontrado: POST /p2p/{uuid} con body');
            console.log('═══════════════════════════════════════════════════════\n');
            return;
        }
        
        console.log('\n❌ Ningún método funcionó\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('⚠️  RESUMEN: Ningún método de cancelación funcionó');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('💡 Posibles causas:');
        console.log('   • La API de QvaPay no permite cancelar ofertas programáticamente');
        console.log('   • Se requiere un método diferente');
        console.log('   • La oferta tiene alguna restricción');
        console.log('   • El token no tiene permisos suficientes\n');
        
    } catch (error) {
        console.error('\n❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar test
console.log('\n');
testCancelarMetodos()
    .then(() => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Test completado');
        console.log('═══════════════════════════════════════════════════════\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
