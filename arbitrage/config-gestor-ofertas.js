/**
 * ⚙️ CONFIGURACIÓN DEL GESTOR AUTOMÁTICO DE OFERTAS
 * 
 * Define qué ofertas mantener activas y cómo gestionarlas
 */

const credenciales = require('./credenciales');

module.exports = {
    // 🔑 Token de autenticación (se obtiene automáticamente de credenciales.js)
    token: credenciales.token,
    
    // 📧 Credenciales para login (si es necesario renovar token)
    email: credenciales.email,
    password: credenciales.password,
    twoFactorCode: credenciales.twoFactorCode,
    
    // 📋 Ofertas a mantener activas
    ofertas: [
        {
            id: 'venta-bank-cup-100',
            tipo: 'venta',                    // 'compra' o 'venta'
            moneda: 'BANK_CUP',               // BANK_CUP, BOLSATM, BANK_MLC, ZELLE, etc
            cantidadUSD: 100,                 // Cantidad fija a vender/comprar
            
            // Información de pago
            detallesPago: [
                { name: 'Método de pago', value: 'Transferencia Bancaria' },
                { name: 'Banco', value: 'Banco Popular de Ahorro' },
                { name: 'Disponibilidad', value: '24/7' }
            ],
            
            // Restricciones
            soloKYC: true,                    // Solo usuarios verificados
            privada: false,                   // Pública (true = privada)
            soloVIP: false,                   // Solo usuarios VIP
            
            // Estado
            habilitada: true,                 // Activar/desactivar esta oferta
            
            // Mensaje opcional para el comprador/vendedor
            mensaje: 'Operación rápida y segura. Respondo al instante.'
        },
        
        // Puedes agregar más ofertas aquí
        // {
        //     id: 'compra-bank-cup-50',
        //     tipo: 'compra',
        //     moneda: 'BANK_CUP',
        //     cantidadUSD: 50,
        //     detallesPago: [
        //         { name: 'Método de pago', value: 'Transferencia Bancaria' }
        //     ],
        //     soloKYC: true,
        //     privada: false,
        //     habilitada: false  // Deshabilitada por ahora
        // }
    ],
    
    // ⚙️ Configuración de gestión
    gestion: {
        // Tiempo máximo sin peer antes de renovar (minutos)
        tiempoMaximoSinPeer: 10,
        
        // Intervalo entre escaneos (segundos)
        intervaloEscaneo: 30,
        
        // Margen de ajuste de precio (porcentaje)
        // Si quieres ser más agresivo en ventas: 0.5% menos
        // Si quieres ser más agresivo en compras: 0.5% más
        margenAjuste: 0,  // 0 = usar precios calculados exactos
        
        // Notificar cuando se renueva una oferta
        notificarRenovacion: true,
        
        // Notificar cuando se detecta peer (SIEMPRE recomendado)
        notificarPeer: true
    },
    
    // 📊 Estadísticas y logs
    estadisticas: {
        // Guardar histórico de operaciones
        guardarHistorico: true,
        
        // Mostrar estadísticas en consola
        mostrarEnConsola: true,
        
        // Intervalo para mostrar resumen (minutos)
        intervaloResumen: 60
    }
};
