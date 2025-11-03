// 🔍 VERIFICAR USUÁRIOS EXISTENTES NO FIRESTORE
// Execute: verificarUsuariosExistentes() no console

window.verificarUsuariosExistentes = async function() {
    console.log('🔍 [VERIFICAÇÃO] Listando usuários existentes no Firestore...');
    
    if (!window.db) {
        console.error('❌ Firestore não inicializado');
        return;
    }
    
    try {
        console.log('\n📊 === USUÁRIOS ADMINISTRADORES ===');
        const adminSnapshot = await window.db.collection('usuarios_admin').get();
        console.log(`Total de admins: ${adminSnapshot.size}`);
        
        if (adminSnapshot.empty) {
            console.log('❌ Nenhum usuário admin encontrado');
        } else {
            adminSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`${index + 1}. ${data.nome || 'Sem nome'} (${data.email})`);
                console.log(`   Role: ${data.role}`);
                console.log(`   Ativo: ${data.ativo}`);
                console.log(`   UID: ${doc.id}`);
                console.log('   ---');
            });
        }
        
        console.log('\n👥 === USUÁRIOS DE EQUIPE ===');
        const equipeSnapshot = await window.db.collection('usuarios_equipe').get();
        console.log(`Total de equipe: ${equipeSnapshot.size}`);
        
        if (equipeSnapshot.empty) {
            console.log('❌ Nenhum usuário de equipe encontrado');
        } else {
            equipeSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`${index + 1}. ${data.nome || 'Sem nome'} (${data.email})`);
                console.log(`   Equipe: ${data.equipe}`);
                console.log(`   Role: ${data.role}`);
                console.log(`   Ativo: ${data.ativo}`);
                console.log(`   UID: ${doc.id}`);
                console.log('   ---');
            });
        }
        
        console.log('\n🚪 === USUÁRIOS ACOMPANHANTES ===');
        const acompSnapshot = await window.db.collection('usuarios_acompanhantes').get();
        console.log(`Total de acompanhantes: ${acompSnapshot.size}`);
        
        if (acompSnapshot.empty) {
            console.log('❌ Nenhum acompanhante encontrado');
        } else {
            acompSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`${index + 1}. ${data.nome || 'Sem nome'} (${data.email})`);
                console.log(`   Quarto: ${data.quarto}`);
                console.log(`   Ativo: ${data.ativo}`);
                console.log(`   UID: ${doc.id}`);
                console.log('   ---');
            });
        }
        
        console.log('\n📋 === RESUMO ===');
        console.log(`✅ Total de usuários no sistema: ${adminSnapshot.size + equipeSnapshot.size + acompSnapshot.size}`);
        console.log(`• Administradores: ${adminSnapshot.size}`);
        console.log(`• Equipes: ${equipeSnapshot.size}`);
        console.log(`• Acompanhantes: ${acompSnapshot.size}`);
        
        console.log('\n🔑 === INSTRUÇÕES PARA TESTE ===');
        console.log('1. Use os emails listados acima para fazer login');
        console.log('2. A senha padrão geralmente é "123456" ou "senha123"');
        console.log('3. Se não souber a senha, teste com senhas comuns do sistema');
        
        return {
            admins: adminSnapshot.size,
            equipes: equipeSnapshot.size,
            acompanhantes: acompSnapshot.size,
            total: adminSnapshot.size + equipeSnapshot.size + acompSnapshot.size
        };
        
    } catch (error) {
        console.error('❌ Erro ao verificar usuários:', error);
        return null;
    }
};

console.log('🔍 Execute: verificarUsuariosExistentes() para ver todos os usuários do Firestore');