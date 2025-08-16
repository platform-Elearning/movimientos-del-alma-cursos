// Script para limpiar todo en develop
// Ejecuta esto en la consola del navegador en develop

console.log("🧹 Limpiando estado en develop...");

// Limpiar localStorage
localStorage.clear();

// Limpiar sessionStorage
sessionStorage.clear();

// Limpiar TODAS las cookies
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Limpiar cookies con domain específico
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.mda-ifi.com"); 
});

console.log("✅ Estado limpiado en develop!");

// Recargar después de 2 segundos
setTimeout(() => {
    console.log("🔄 Recargando página...");
    window.location.reload();
}, 2000);