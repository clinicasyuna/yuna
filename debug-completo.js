console.log('=== DEBUG BOTÃO MINHA SENHA ===');

// 1. Verificar se o botão existe no DOM
const btnMinhaSenha = document.getElementById('alterar-senha-btn');
console.log('1. Botão no DOM:', btnMinhaSenha);

if (btnMinhaSenha) {
    console.log('2. Propriedades do botão:');
    console.log('  - Classes:', btnMinhaSenha.className);
    console.log('  - Style:', btnMinhaSenha.style.cssText);
    console.log('  - Display computado:', getComputedStyle(btnMinhaSenha).display);
    console.log('  - Visibilidade:', getComputedStyle(btnMinhaSenha).visibility);
    console.log('  - Opacity:', getComputedStyle(btnMinhaSenha).opacity);
    console.log('  - Offset Width/Height:', btnMinhaSenha.offsetWidth, btnMinhaSenha.offsetHeight);
    console.log('  - Texto:', btnMinhaSenha.textContent);
    console.log('  - Parent:', btnMinhaSenha.parentElement);
    
    // 3. Forçar visibilidade
    console.log('3. Forçando visibilidade...');
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
    console.log('✅ Visibilidade forçada!');
} else {
    console.error('❌ Botão não encontrado no DOM!');
    console.log('4. Verificando se existe em algum lugar...');
    
    // Procurar por qualquer botão com onclick="abrirMinhaSenha()"
    const botoes = document.querySelectorAll('button[onclick*="abrirMinhaSenha"]');
    console.log('Botões com abrirMinhaSenha:', botoes);
    
    // Procurar por texto "Minha Senha"
    const todosBotoes = document.querySelectorAll('button');
    const botoesComTexto = Array.from(todosBotoes).filter(btn => 
        btn.textContent.toLowerCase().includes('senha') || 
        btn.textContent.toLowerCase().includes('minha')
    );
    console.log('Botões com "senha" ou "minha":', botoesComTexto);
    
    // Verificar header completo
    const header = document.querySelector('.header .user-info');
    console.log('Header user-info:', header);
    if (header) {
        console.log('Filhos do header:', header.children);
    }
    
    // 5. Tentar criar o botão manualmente
    console.log('5. Tentando criar botão manualmente...');
    if (header) {
        const logoutBtn = header.querySelector('#logout-btn');
        if (logoutBtn) {
            const novoBotao = document.createElement('button');
            novoBotao.id = 'alterar-senha-btn';
            novoBotao.className = 'btn-primary';
            novoBotao.innerHTML = '<i class="fas fa-key"></i> Minha Senha';
            novoBotao.onclick = () => {
                if (typeof abrirMinhaSenha === 'function') {
                    abrirMinhaSenha();
                } else {
                    alert('Função abrirMinhaSenha não encontrada!');
                }
            };
            novoBotao.style.cssText = `
                background: #10b981 !important;
                color: white !important;
                border: none !important;
                padding: 0.5rem 1rem !important;
                border-radius: 0.375rem !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 0.5rem !important;
                font-weight: 500 !important;
                margin-right: 0.5rem !important;
            `;
            
            header.insertBefore(novoBotao, logoutBtn);
            console.log('✅ Botão criado manualmente!');
        } else {
            console.error('❌ Botão de logout não encontrado para inserir antes');
        }
    }
}

console.log('=== FIM DO DEBUG ===');