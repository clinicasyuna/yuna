// SCRIPT DE LIMPEZA IMEDIATA - DEVE SER EXECUTADO PRIMEIRO

console.log('[EMERGENCY-CLEANUP] Iniciando limpeza de emergência...');

// Executar limpeza imediatamente quando o script carrega
(function emergencyCleanup() {
    function removeDebugButtons() {
        const debugTexts = ['Usuários Direto', 'Debug', 'Relatórios Direto'];
        let removed = 0;
        
        // Buscar todos os botões
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => {
            const text = (btn.textContent || '').trim();
            if (debugTexts.some(debugText => text.includes(debugText))) {
                console.log(`[EMERGENCY-CLEANUP] Removendo botão: "${text}"`);
                btn.style.display = 'none !important';
                btn.style.visibility = 'hidden !important';
                btn.remove();
                removed++;
            }
        });
        
        return removed;
    }
    
    // Executar imediatamente
    removeDebugButtons();
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeDebugButtons);
    } else {
        removeDebugButtons();
    }
    
    // Executar periodicamente por alguns segundos
    let attempts = 0;
    const maxAttempts = 20;
    
    const cleanupInterval = setInterval(() => {
        attempts++;
        const removed = removeDebugButtons();
        
        if (removed > 0) {
            console.log(`[EMERGENCY-CLEANUP] Tentativa ${attempts}: ${removed} elementos removidos`);
        }
        
        if (attempts >= maxAttempts) {
            clearInterval(cleanupInterval);
            console.log('[EMERGENCY-CLEANUP] Limpeza de emergência concluída');
        }
    }, 250);
})();

// Forçar CSS para esconder elementos debug
const emergencyStyle = document.createElement('style');
emergencyStyle.textContent = `
    button[onclick*="showUsersDireto"],
    button[onclick*="debugFuncs"],
    button[onclick*="mostrarRelatoriosDirectly"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
`;
document.head.appendChild(emergencyStyle);