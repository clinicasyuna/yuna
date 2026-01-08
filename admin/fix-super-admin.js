// CORREÇÃO URGENTE: Limpar cache e forçar reload do super_admin
// Execute no console do navegador (F12) após fazer login

async function corrigirSuperAdmin() {
    console.log('🚀 INICIANDO CORREÇÃO DO SUPER ADMIN...');
    console.log('='.repeat(60));
    
    try {
        // 1. Limpar TODO o cache do localStorage
        console.log('1️⃣ Limpando cache...');
        const keysParaRemover = [
            'usuarioAdmin',
            'yuna_dashboard_cache',
            'lastActivityTime',
            'sessionTimeout'
        ];
        
        keysParaRemover.forEach(key => {
            localStorage.removeItem(key);
            console.log(`   ✓ ${key} removido`);
        });
        
        // 2. Verificar usuário autenticado
        console.log('\n2️⃣ Verificando usuário autenticado...');
        const currentUser = window.auth?.currentUser;
        
        if (!currentUser) {
            console.error('❌ Nenhum usuário autenticado!');
            console.log('👉 Faça login primeiro, depois execute este script novamente');
            return;
        }
        
        console.log('✅ Usuário:', currentUser.email);
        console.log('✅ UID:', currentUser.uid);
        
        // 3. Buscar dados atualizados do Firestore
        console.log('\n3️⃣ Buscando dados do Firestore...');
        const docRef = window.db.collection('usuarios_admin').doc(currentUser.uid);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            console.error('❌ Documento não encontrado no Firestore!');
            console.log('👉 ID esperado:', currentUser.uid);
            console.log('👉 Verifique se o documento existe com este ID');
            return;
        }
        
        const userData = doc.data();
        console.log('✅ Dados encontrados:', JSON.stringify(userData, null, 2));
        
        // 4. Forçar atualização da variável global
        console.log('\n4️⃣ Atualizando variável global...');
        window.usuarioAdmin = {
            ...userData,
            uid: currentUser.uid,
            isAdmin: true,
            isSuperAdmin: userData.role === 'super_admin'
        };
        
        // Salvar no localStorage
        localStorage.setItem('usuarioAdmin', JSON.stringify(window.usuarioAdmin));
        console.log('✅ window.usuarioAdmin atualizado');
        console.log('✅ localStorage atualizado');
        
        // 5. Forçar atualização dos botões
        console.log('\n5️⃣ Atualizando interface...');
        
        if (typeof window.atualizarVisibilidadeBotoes === 'function') {
            window.atualizarVisibilidadeBotoes();
            console.log('✅ atualizarVisibilidadeBotoes() executado');
        } else {
            console.warn('⚠️ Função atualizarVisibilidadeBotoes não encontrada');
        }
        
        if (typeof window.configurarEventosBotoes === 'function') {
            window.configurarEventosBotoes();
            console.log('✅ configurarEventosBotoes() executado');
        } else {
            console.warn('⚠️ Função configurarEventosBotoes não encontrada');
        }
        
        // 6. Forçar exibição dos botões administrativos
        console.log('\n6️⃣ Forçando exibição dos botões...');
        
        const btnNovoUsuario = document.getElementById('btn-novo-usuario');
        const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
        const btnDashboard = document.getElementById('dashboard-btn');
        const btnRelatorios = document.getElementById('relatorios-btn');
        
        if (btnNovoUsuario) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
            console.log('✅ Botão "Criar Usuário" exibido');
        } else {
            console.warn('⚠️ Botão "Criar Usuário" não encontrado');
        }
        
        if (btnGerenciarUsuarios) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
            console.log('✅ Botão "Gerenciar Usuários" exibido');
        } else {
            console.warn('⚠️ Botão "Gerenciar Usuários" não encontrado');
        }
        
        if (btnDashboard) {
            btnDashboard.classList.remove('btn-hide');
            btnDashboard.style.display = 'inline-flex';
            console.log('✅ Botão "Dashboard" exibido');
        } else {
            console.warn('⚠️ Botão "Dashboard" não encontrado');
        }
        
        if (btnRelatorios) {
            btnRelatorios.classList.remove('btn-hide');
            btnRelatorios.style.display = 'inline-flex';
            console.log('✅ Botão "Relatórios" exibido');
        } else {
            console.warn('⚠️ Botão "Relatórios" não encontrado');
        }
        
        // 7. Atualizar badge do usuário
        console.log('\n7️⃣ Atualizando badge...');
        const badge = document.getElementById('user-role-badge');
        if (badge) {
            badge.textContent = `${userData.nome || 'Super Admin'} (Super Admin)`;
            badge.className = 'priority-badge priority-alta';
            console.log('✅ Badge atualizado');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ CORREÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(60));
        console.log('\n📌 Status Final:');
        console.log('   - Role:', window.usuarioAdmin?.role);
        console.log('   - Super Admin:', window.usuarioAdmin?.isSuperAdmin);
        console.log('   - Permissões:', window.usuarioAdmin?.permissoes);
        
        console.log('\n💡 Se os botões ainda não aparecerem:');
        console.log('   1. Pressione F5 para recarregar a página');
        console.log('   2. Faça logout e login novamente');
        
    } catch (error) {
        console.error('❌ ERRO DURANTE CORREÇÃO:', error);
        console.log('\n🔄 Tente:');
        console.log('   1. Recarregar a página (F5)');
        console.log('   2. Fazer logout');
        console.log('   3. Limpar cache do navegador (Ctrl+Shift+Delete)');
        console.log('   4. Fazer login novamente');
    }
}

// Disponibilizar globalmente
window.corrigirSuperAdmin = corrigirSuperAdmin;

console.log('✅ Script carregado!');
console.log('📝 Para executar, digite no console:');
console.log('   corrigirSuperAdmin()');
