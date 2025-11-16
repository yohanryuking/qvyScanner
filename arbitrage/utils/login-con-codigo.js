/**
 * 🔐 Login con código 2FA
 * 
 * INSTRUCCIONES:
 * 1. Revisa tu email y copia el código de 4 dígitos
 * 2. Pégalo en la variable TWO_FACTOR_CODE (línea 15)
 * 3. Ejecuta: node EMPEZAR_AQUI/login-con-codigo.js
 */

const fetch = require('node-fetch');

const EMAIL = 'yohanryuking@gmail.com';
const PASSWORD = 'yohanRK*01';

// ⬇️ PEGA AQUÍ EL CÓDIGO DE 4 DÍGITOS QUE RECIBISTE EN TU EMAIL
const TWO_FACTOR_CODE = '1897';  // Ejemplo: '1234'

async function loginConCodigo() {
    
    if (!TWO_FACTOR_CODE || TWO_FACTOR_CODE === '') {
        console.error('❌ Error: Necesitas poner el código 2FA primero!\n');
        console.log('📝 Pasos:');
        console.log('   1. Revisa tu email: ' + EMAIL);
        console.log('   2. Busca el código de 4 dígitos de QvaPay');
        console.log('   3. Edita este archivo (login-con-codigo.js)');
        console.log('   4. Pon el código en la línea 15: const TWO_FACTOR_CODE = "1234"');
        console.log('   5. Guarda y ejecuta de nuevo\n');
        return;
    }
    
    const url = 'https://api.qvapay.com/auth/login';
    
    const body = {
        email: EMAIL,
        password: PASSWORD,
        two_factor_code: TWO_FACTOR_CODE,
        remember: true  // Token permanente
    };

    try {
        console.log('🔐 Haciendo login con código 2FA...\n');
        console.log('📧 Email:', EMAIL);
        console.log('🔢 Código 2FA:', TWO_FACTOR_CODE);
        console.log('\n⏳ Esperando respuesta...\n');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        
        console.log('📊 Status:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('\n✅ ¡LOGIN EXITOSO!\n');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('🔑 TU TOKEN (guárdalo bien):');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(result.accessToken || result.token || 'Token no encontrado');
            console.log('═══════════════════════════════════════════════════════════\n');
            
            if (result.me) {
                console.log('👤 Tu información:');
                console.log('   Nombre:', result.me.name, result.me.lastname);
                console.log('   Email:', result.me.email);
                console.log('   Username:', result.me.username);
                console.log('   UUID:', result.me.uuid);
                console.log('   Balance: $' + result.me.balance);
                console.log('   KYC:', result.me.kyc ? '✅ Verificado' : '❌ No verificado');
                console.log('   VIP:', result.me.vip ? '✅' : '❌');
                console.log('');
            }
            
            console.log('📦 Respuesta completa:');
            console.log(JSON.stringify(result, null, 2));
            console.log('');
            
            console.log('⏭️  SIGUIENTE PASO:');
            console.log('   Abre: EMPEZAR_AQUI/2-crear-mi-app.js');
            console.log('   Y pega el token en la variable TOKEN\n');
            
        } else {
            console.error('\n❌ Error en el login:\n');
            console.log('📦 Respuesta:');
            console.log(JSON.stringify(result, null, 2));
            console.log('');
            
            if (result.info && result.info.includes('2FA')) {
                console.log('💡 El código 2FA puede estar incorrecto o expiró');
                console.log('   Solicita uno nuevo: node EMPEZAR_AQUI/solicitar-pin.js\n');
            }
        }
        
    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
    }
}

loginConCodigo();
