// SCRIPT SILENCIOSO PARA BOTÃO MINHA SENHA
// Versão sem spam de logs para produção

(function() {
    'use strict';
    
    // Função para garantir visibilidade do botão Minha Senha
    function garantirBotaoMinhaSenha() {
        const btnMinhaSenha = document.getElementById('alterar-senha-btn');
        
        if (btnMinhaSenha) {
            // Forçar visibilidade silenciosamente
            btnMinhaSenha.classList.remove('btn-hide', 'hidden', 'd-none');
            btnMinhaSenha.style.cssText = `
                display: inline-flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
                background: #10b981 !important;
                color: white !important;
                border: none !important;
                padding: 0.5rem 1rem !important;
                border-radius: 0.375rem !important;
                cursor: pointer !important;
                align-items: center !important;
                gap: 0.5rem !important;
                font-weight: 500 !important;
                position: relative !important;
                z-index: 999 !important;
            `;
        }
    }
    
    // Observer silencioso para detectar mudanças no DOM
    const observer = new MutationObserver(function() {
        garantirBotaoMinhaSenha();
    });
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            garantirBotaoMinhaSenha();
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    } else {
        garantirBotaoMinhaSenha();
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Verificação única após 2 segundos
    setTimeout(garantirBotaoMinhaSenha, 2000);
    
})();