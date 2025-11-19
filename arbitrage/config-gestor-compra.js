/**
 * ⚙️ CONFIGURACIÓN DEL GESTOR DE COMPRAS ESCALONADO
 *
 * Este archivo contiene la configuración específica para el gestor de compras.
 * Modifica estos valores según tus necesidades.
 */

module.exports = {
    // 💰 BALANCE MANUAL EN CUP
    // Si configuras un valor aquí, el gestor usará exactamente esa cantidad de CUP
    // Si dejas null, intentará obtener el balance automáticamente de la API
    //
    // EJEMPLOS:
    // balanceCupManual: null,      // Usar balance automático de la API
    // balanceCupManual: 10000,     // Usar exactamente 10000 CUP
    // balanceCupManual: 25000,     // Usar exactamente 25000 CUP
    // balanceCupManual: 50000,     // Usar exactamente 50000 CUP
    //
    // ⚠️ IMPORTANTE: Asegúrate de tener al menos este monto disponible
    // El gestor NO verifica la disponibilidad real
    balanceCupManual: 13600,

    // ⚙️ CONFIGURACIÓN ADICIONAL
    // Puedes agregar más configuraciones aquí según necesites
    // Por ejemplo: límites de creación, estrategias específicas, etc.

    // 📊 LÍMITES DE SEGURIDAD
    // Mínimo CUP requerido para crear una oferta (1 USD)
    minimoCupPorOferta: 500, // Aproximadamente 500 CUP = 1 USD

    // 🚨 ALERTAS
    // Notificar cuando el balance esté por debajo de este umbral
    alertaBalanceBajo: 1000, // CUP
};