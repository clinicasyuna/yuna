// SCRIPT PARA RESOLVER PROBLEMA DE EMAIL JÁ EM USO
// Execute este código no console do navegador para diagnosticar e resolver

console.log('🔍 DIAGNÓSTICO: Email já em uso - Usuário órfão no Firebase Auth');
console.log('==========================================');

// Função para diagnosticar o problema
async function diagnosticarEmailJaEmUso() {
    try {
        console.log('📋 1. Verificando configuração Firebase...');
        
        if (!window.auth || !window.db) {
            console.error('❌ Firebase não inicializado');
            return;
        }
        
        console.log('✅ Firebase inicializado');
        
        // Solicitar email problemático
        const emailProblema = prompt('Digite o email que está dando erro "já em uso":');
        if (!emailProblema) {
            console.log('❌ Operação cancelada');
            return;
        }
        
        console.log('📋 2. Verificando se usuário existe no Firestore...');
        
        // Verificar nas coleções do Firestore
        const [adminQuery, equipeQuery, acompQuery] = await Promise.all([
            window.db.collection('usuarios_admin').where('email', '==', emailProblema).get(),
            window.db.collection('usuarios_equipe').where('email', '==', emailProblema).get(),
            window.db.collection('usuarios_acompanhantes').where('email', '==', emailProblema).get()
        ]);
        
        const existeAdmin = !adminQuery.empty;
        const existeEquipe = !equipeQuery.empty;
        const existeAcomp = !acompQuery.empty;
        
        console.log('📊 Resultado da verificação:');
        console.log(`   - usuarios_admin: ${existeAdmin ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
        console.log(`   - usuarios_equipe: ${existeEquipe ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
        console.log(`   - usuarios_acompanhantes: ${existeAcomp ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
        
        if (existeAdmin || existeEquipe || existeAcomp) {
            console.log('✅ DIAGNÓSTICO: Usuário existe no Firestore');
            console.log('💡 SOLUÇÃO: O problema pode ser outro. Verifique:');
            console.log('   1. Se está tentando criar com o mesmo email');
            console.log('   2. Se já está logado com este usuário');
            
            if (existeAdmin) {
                const userData = adminQuery.docs[0].data();
                console.log('📋 Dados do admin:', userData);
            }
            if (existeEquipe) {
                const userData = equipeQuery.docs[0].data();
                console.log('📋 Dados da equipe:', userData);
            }
            if (existeAcomp) {
                const userData = acompQuery.docs[0].data();
                console.log('📋 Dados do acompanhante:', userData);
            }
            
        } else {
            console.log('❌ DIAGNÓSTICO: USUÁRIO ÓRFÃO DETECTADO!');
            console.log('📋 O email existe no Firebase Auth mas NÃO existe no Firestore');
            console.log('');
            console.log('🔧 SOLUÇÕES DISPONÍVEIS:');
            console.log('');
            console.log('💡 SOLUÇÃO 1 - Firebase Console (RECOMENDADA):');
            console.log('   1. Abrir: https://console.firebase.google.com/');
            console.log('   2. Ir para Authentication > Users');
            console.log('   3. Procurar pelo email:', emailProblema);
            console.log('   4. Clicar nos três pontos > Delete user');
            console.log('   5. Tentar criar usuário novamente');
            console.log('');
            console.log('💡 SOLUÇÃO 2 - Tentativa de recuperação:');
            console.log('   Execute: tentarRecuperarUsuarioOrfao("' + emailProblema + '")');
        }
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error);
        console.log('');
        console.log('🔧 SOLUÇÃO MANUAL:');
        console.log('1. Vá para: https://console.firebase.google.com/');
        console.log('2. Selecione seu projeto');
        console.log('3. Authentication > Users');
        console.log('4. Encontre e exclua o usuário problemático');
        console.log('5. Tente criar novamente');
    }
}

// Função para tentar recuperar usuário órfão
async function tentarRecuperarUsuarioOrfao(email) {
    console.log('🔄 Tentando recuperar usuário órfão:', email);
    
    try {
        const acao = confirm(
            `USUÁRIO ÓRFÃO DETECTADO: ${email}\n\n` +
            `Este email existe no Firebase Auth mas não no Firestore.\n\n` +
            `Escolha uma ação:\n` +
            `OK = Tentar recriar no Firestore\n` +
            `Cancelar = Orientações para excluir do Auth`
        );
        
        if (acao) {
            // Tentar recriar no Firestore
            const nome = prompt('Digite o nome do usuário:');
            if (!nome) return;
            
            const tipo = prompt('Digite o tipo (admin/equipe/acompanhante):');
            if (!tipo || !['admin', 'equipe', 'acompanhante'].includes(tipo)) {
                console.log('❌ Tipo inválido. Use: admin, equipe ou acompanhante');
                return;
            }
            
            let equipeNome = null;
            if (tipo === 'equipe') {
                equipeNome = prompt('Digite a equipe (manutencao/nutricao/higienizacao/hotelaria):');
                if (!equipeNome || !['manutencao', 'nutricao', 'higienizacao', 'hotelaria'].includes(equipeNome)) {
                    console.log('❌ Equipe inválida');
                    return;
                }
            }
            
            // Tentar fazer login para obter UID
            const senhaTemp = prompt('Digite uma senha temporária para fazer login (6+ caracteres):');
            if (!senhaTemp || senhaTemp.length < 6) {
                console.log('❌ Senha muito curta');
                return;
            }
            
            console.log('🔄 Fazendo login temporário...');
            const userCredential = await window.auth.signInWithEmailAndPassword(email, senhaTemp);
            const uid = userCredential.user.uid;
            
            console.log('✅ UID obtido:', uid);
            
            // Criar no Firestore
            let colecao, dados;
            
            if (tipo === 'admin') {
                colecao = 'usuarios_admin';
                dados = {
                    nome: nome,
                    email: email,
                    role: 'admin',
                    ativo: true,
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                    recuperadoEm: firebase.firestore.FieldValue.serverTimestamp()
                };
            } else if (tipo === 'equipe') {
                colecao = 'usuarios_equipe';
                dados = {
                    nome: nome,
                    email: email,
                    equipe: equipeNome,
                    ativo: true,
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                    recuperadoEm: firebase.firestore.FieldValue.serverTimestamp()
                };
            } else if (tipo === 'acompanhante') {
                colecao = 'usuarios_acompanhantes';
                dados = {
                    nome: nome,
                    email: email,
                    ativo: true,
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                    recuperadoEm: firebase.firestore.FieldValue.serverTimestamp()
                };
            }
            
            await window.db.collection(colecao).doc(uid).set(dados);
            
            console.log('✅ USUÁRIO RECUPERADO COM SUCESSO!');
            console.log('📋 Criado em:', colecao);
            console.log('📋 Dados:', dados);
            
            // Fazer logout
            await window.auth.signOut();
            console.log('🔄 Logout realizado');
            
        } else {
            console.log('🔧 ORIENTAÇÕES PARA EXCLUSÃO MANUAL:');
            console.log('1. Vá para: https://console.firebase.google.com/');
            console.log('2. Selecione seu projeto: studio-5526632052-23813');
            console.log('3. Authentication > Users');
            console.log('4. Procure por:', email);
            console.log('5. Clique nos 3 pontos ao lado do usuário');
            console.log('6. Selecione "Delete user"');
            console.log('7. Confirme a exclusão');
            console.log('8. Tente criar o usuário novamente');
        }
        
    } catch (error) {
        console.error('❌ Erro na recuperação:', error);
        
        if (error.code === 'auth/wrong-password') {
            console.log('❌ Senha incorreta para login temporário');
            console.log('🔧 Use a exclusão manual via Firebase Console');
        }
        
        console.log('🔗 Link direto: https://console.firebase.google.com/project/studio-5526632052-23813/authentication/users');
    }
}

// Executar diagnóstico automaticamente
console.log('🚀 Iniciando diagnóstico...');
diagnosticarEmailJaEmUso();

// Disponibilizar funções globalmente
window.diagnosticarEmailJaEmUso = diagnosticarEmailJaEmUso;
window.tentarRecuperarUsuarioOrfao = tentarRecuperarUsuarioOrfao;