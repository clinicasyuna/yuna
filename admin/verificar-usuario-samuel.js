// Script para verificar e corrigir dados do usuário samuel.lacerda@yuna.com.br
// Execute no console do navegador após fazer login

async function verificarUsuarioSamuel() {
    console.log('='.repeat(60));
    console.log('DIAGNÓSTICO: Verificando usuário samuel.lacerda@yuna.com.br');
    console.log('='.repeat(60));
    
    const email = 'samuel.lacerda@yuna.com.br';
    
    try {
        // 1. Verificar usuário no Firebase Auth
        console.log('\n1️⃣ Verificando Firebase Auth...');
        const currentUser = window.auth?.currentUser;
        console.log('Usuário autenticado:', currentUser?.email);
        console.log('UID:', currentUser?.uid);
        
        if (!currentUser) {
            console.error('❌ Nenhum usuário autenticado!');
            return;
        }
        
        // 2. Verificar na coleção usuarios_admin por UID
        console.log('\n2️⃣ Verificando usuarios_admin por UID...');
        const adminDocByUid = await window.db.collection('usuarios_admin').doc(currentUser.uid).get();
        console.log('Encontrado por UID:', adminDocByUid.exists);
        if (adminDocByUid.exists) {
            console.log('Dados:', JSON.stringify(adminDocByUid.data(), null, 2));
        }
        
        // 3. Verificar na coleção usuarios_admin por EMAIL
        console.log('\n3️⃣ Verificando usuarios_admin por EMAIL...');
        const adminDocByEmail = await window.db.collection('usuarios_admin').where('email', '==', email).get();
        console.log('Documentos encontrados:', adminDocByEmail.size);
        if (!adminDocByEmail.empty) {
            adminDocByEmail.forEach(doc => {
                console.log('ID do documento:', doc.id);
                console.log('Dados:', JSON.stringify(doc.data(), null, 2));
            });
        }
        
        // 4. Verificar na coleção usuarios_equipe
        console.log('\n4️⃣ Verificando usuarios_equipe...');
        const equipeDoc = await window.db.collection('usuarios_equipe').doc(currentUser.uid).get();
        console.log('Encontrado em equipe:', equipeDoc.exists);
        if (equipeDoc.exists) {
            console.log('Dados:', JSON.stringify(equipeDoc.data(), null, 2));
        }
        
        // 5. Verificar localStorage
        console.log('\n5️⃣ Verificando localStorage...');
        const usuarioCache = localStorage.getItem('usuarioAdmin');
        if (usuarioCache) {
            console.log('Cache encontrado:', JSON.parse(usuarioCache));
        } else {
            console.log('❌ Nenhum cache encontrado');
        }
        
        // 6. Verificar window.usuarioAdmin
        console.log('\n6️⃣ Verificando window.usuarioAdmin...');
        console.log('window.usuarioAdmin:', window.usuarioAdmin);
        
        console.log('\n' + '='.repeat(60));
        console.log('FIM DO DIAGNÓSTICO');
        console.log('='.repeat(60));
        
        // SUGESTÃO DE CORREÇÃO
        console.log('\n💡 CORREÇÃO AUTOMÁTICA:');
        console.log('Se o usuário não foi encontrado na coleção usuarios_admin por UID,');
        console.log('mas foi encontrado por EMAIL, execute:');
        console.log('\ncorrigirUsuarioSamuel();\n');
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error);
    }
}

async function corrigirUsuarioSamuel() {
    console.log('🔧 Iniciando correção...');
    
    const email = 'samuel.lacerda@yuna.com.br';
    const currentUser = window.auth?.currentUser;
    
    if (!currentUser) {
        console.error('❌ Nenhum usuário autenticado!');
        return;
    }
    
    try {
        // Buscar documento por email
        const snapshot = await window.db.collection('usuarios_admin').where('email', '==', email).get();
        
        if (snapshot.empty) {
            console.log('⚠️ Nenhum documento encontrado com este email.');
            console.log('🆕 Criando novo documento...');
            
            // Criar novo documento com UID correto
            await window.db.collection('usuarios_admin').doc(currentUser.uid).set({
                email: email,
                nome: 'Samuel Lacerda',
                nomeCompleto: 'Samuel dos Reis Lacerda Junior',
                role: 'super_admin',
                ativo: true,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            });
            
            console.log('✅ Documento criado com sucesso!');
            console.log('🔄 Faça logout e login novamente');
            
        } else {
            const doc = snapshot.docs[0];
            const docId = doc.id;
            const dados = doc.data();
            
            console.log('📄 Documento encontrado:', docId);
            console.log('📊 Dados atuais:', dados);
            
            if (docId !== currentUser.uid) {
                console.log('⚠️ ID do documento diferente do UID!');
                console.log('ID do documento:', docId);
                console.log('UID atual:', currentUser.uid);
                
                // Copiar para documento com UID correto
                await window.db.collection('usuarios_admin').doc(currentUser.uid).set({
                    ...dados,
                    role: 'super_admin', // Garantir que é super_admin
                    ativo: true,
                    atualizadoEm: new Date().toISOString()
                });
                
                console.log('✅ Documento copiado para UID correto!');
                
                // Deletar documento antigo
                await window.db.collection('usuarios_admin').doc(docId).delete();
                console.log('🗑️ Documento antigo deletado');
                
                console.log('🔄 Faça logout e login novamente');
            } else {
                console.log('✅ Documento já está com UID correto');
                
                // Garantir que role é super_admin
                if (dados.role !== 'super_admin') {
                    await window.db.collection('usuarios_admin').doc(currentUser.uid).update({
                        role: 'super_admin',
                        atualizadoEm: new Date().toISOString()
                    });
                    console.log('✅ Role atualizada para super_admin');
                    console.log('🔄 Faça logout e login novamente');
                }
            }
        }
        
        // Limpar cache
        localStorage.removeItem('usuarioAdmin');
        console.log('🧹 Cache limpo');
        
    } catch (error) {
        console.error('❌ Erro durante correção:', error);
    }
}

// Disponibilizar no console
window.verificarUsuarioSamuel = verificarUsuarioSamuel;
window.corrigirUsuarioSamuel = corrigirUsuarioSamuel;

console.log('✅ Scripts carregados!');
console.log('📝 Execute: verificarUsuarioSamuel()');
console.log('🔧 Se necessário: corrigirUsuarioSamuel()');
