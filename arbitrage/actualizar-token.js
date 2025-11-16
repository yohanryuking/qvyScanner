/**
 * 🔄 Actualizar Token Automáticamente
 * 
 * Este script hace login y actualiza automáticamente el token en credenciales.js
 * 
 * USO:
 * 1. Asegúrate de tener el código 2FA actualizado en credenciales.js
 * 2. Ejecuta: node arbitrage/actualizar-token.js
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const credenciales = require('./credenciales');

async function actualizarToken() {
    console.log('🔐 Actualizando token...\n');
    console.log('📧 Email:', credenciales.email);
    console.log('🔢 Código 2FA:', credenciales.twoFactorCode);
    console.log('\n⏳ Haciendo login...\n');
    
    try {
        const response = await fetch('https://api.qvapay.com/auth/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: credenciales.email,
                password: credenciales.password,
                two_factor_code: credenciales.twoFactorCode,
                remember: true
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ Error en el login:');
            console.error(JSON.stringify(result, null, 2));
            
            if (result.info && result.info.includes('2FA')) {
                console.log('\n💡 El código 2FA puede estar incorrecto o expirado');
                console.log('   1. Solicita uno nuevo: node EMPEZAR_AQUI/solicitar-pin.js');
                console.log('   2. Actualiza twoFactorCode en arbitrage/credenciales.js');
                console.log('   3. Ejecuta este script de nuevo\n');
            }
            return;
        }
        
        const nuevoToken = result.accessToken;
        console.log('✅ Login exitoso!');
        console.log('🔑 Nuevo token:', nuevoToken);
        
        // Leer el archivo credenciales.js
        const credencialesPath = path.join(__dirname, 'credenciales.js');
        let contenido = fs.readFileSync(credencialesPath, 'utf8');
        
        // Actualizar el token
        contenido = contenido.replace(
            /token: '[^']*'/,
            `token: '${nuevoToken}'`
        );
        
        // Actualizar la fecha
        const ahora = new Date().toISOString().replace('T', ' ').substring(0, 19);
        contenido = contenido.replace(
            /tokenActualizadoEn: '[^']*'/,
            `tokenActualizadoEn: '${ahora}'`
        );
        
        // Guardar el archivo
        fs.writeFileSync(credencialesPath, contenido, 'utf8');
        
        console.log('\n✅ Token actualizado en arbitrage/credenciales.js');
        console.log('📅 Fecha actualización:', ahora);
        
        if (result.me) {
            console.log('\n👤 Tu información:');
            console.log('   Nombre:', result.me.name, result.me.lastname);
            console.log('   Balance: $' + result.me.balance);
            console.log('   KYC:', result.me.kyc ? '✅' : '❌');
            console.log('   P2P:', result.me.p2p_enabled ? '✅' : '❌');
        }
        
        console.log('\n🎉 ¡Listo! Ahora puedes ejecutar cualquier script del gestor\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

actualizarToken();
