// SCRIPT PARA RESOLVER PROBLEMA DE EMAIL JÃ EM USO
// Execute este cÃ³digo no console do navegador para diagnosticar e resolver

console.log('ðŸ” DIAGNÃ“STICO: Email jÃ¡ em uso - UsuÃ¡rio Ã³rfÃ£o no Firebase Auth');
console.log('==========================================');

// FunÃ§Ã£o para diagnosticar o problema
async function diagnosticarEmailJaEmUso() {
    try {
        console.log('ðŸ“‹ 1. Verificando configuraÃ§Ã£o Firebase...');
        
        if (!window.auth || !window.db) {
            console.error('âŒ Firebase nÃ£o inicializado');
            return;
        }
        
        console.log('âœ… Firebase inicializado');
        
        // Solicitar email problemÃ¡tico
        const emailProblema = prompt('Digite o email que estÃ¡ dando erro "jÃ¡ em uso":');
        if (!emailProblema) {
            console.log('âŒ OperaÃ§Ã£o cancelada');
            return;
        }
        
        console.log('ðŸ“‹ 2. Verificando se usuÃ¡rio existe no Firestore...');
        
        // Verificar nas coleÃ§Ãµes do Firestore
        const [adminQuery, equipeQuery, acompQuery] = await Promise.all([
            window.db.collection('usuarios_admin').where('email', '==', emailProblema).get(),
            window.db.collection('usuarios_equipe').where('email', '==', emailProblema).get(),
            window.db.collection('usuarios_acompanhantes').where('email', '==', emailProblema).get()
        ]);
        
        const existeAdmin = !adminQuery.empty;
        const existeEquipe = !equipeQuery.empty;
        const existeAcomp = !acompQuery.empty;
        
        console.log('ðŸ“Š Resultado da verificaÃ§Ã£o:');
        console.log(`   - usuarios_admin: ${existeAdmin ? 'âœ… EXISTE' : 'âŒ NÃƒO EXISTE'}`);
        console.log(`   - usuarios_equipe: ${existeEquipe ? 'âœ… EXISTE' : 'âŒ NÃƒO EXISTE'}`);
        console.log(`   - usuarios_acompanhantes: ${existeAcomp ? 'âœ… EXISTE' : 'âŒ NÃƒO EXISTE'}`);
        
        if (existeAdmin || existeEquipe || existeAcomp) {
            console.log('âœ… DIAGNÃ“STICO: UsuÃ¡rio existe no Firestore');
            console.log('ðŸ’¡ SOLUÃ‡ÃƒO: O problema pode ser outro. Verifique:');
            console.log('   1. Se estÃ¡ tentando criar com o mesmo email');
            console.log('   2. Se jÃ¡ estÃ¡ logado com este usuÃ¡rio');
            
            if (existeAdmin) {
                const userData = adminQuery.docs[0].data();
                console.log('ðŸ“‹ Dados do admin:', userData);
            }
            if (existeEquipe) {
                const userData = equipeQuery.docs[0].data();
                console.log('ðŸ“‹ Dados da equipe:', userData);
            }
            if (existeAcomp) {
                const userData = acompQuery.docs[0].data();
                console.log('ðŸ“‹ Dados do acompanhante:', userData);
            }
            
        } else {
            console.log('âŒ DIAGNÃ“STICO: USUÃRIO Ã“RFÃƒO DETECTADO!');
            console.log('ðŸ“‹ O email existe no Firebase Auth mas NÃƒO existe no Firestore');
            console.log('');
            console.log('ðŸ”§ SOLUÃ‡Ã•ES DISPONÃVEIS:');
            console.log('');
            console.log('ðŸ’¡ SOLUÃ‡ÃƒO 1 - Firebase Console (RECOMENDADA):');
            console.log('   1. Abrir: https://console.firebase.google.com/');
            console.log('   2. Ir para Authentication > Users');
            console.log('   3. Procurar pelo email:', emailProblema);
            console.log('   4. Clicar nos trÃªs pontos > Delete user');
            console.log('   5. Tentar criar usuÃ¡rio novamente');
            console.log('');
            console.log('ðŸ’¡ SOLUÃ‡ÃƒO 2 - Tentativa de recuperaÃ§Ã£o:');
            console.log('   Execute: tentarRecuperarUsuarioOrfao("' + emailProblema + '")');
        }
        
    } catch (error) {
        console.error('âŒ Erro durante diagnÃ³stico:', error);
        console.log('');
        console.log('ðŸ”§ SOLUÃ‡ÃƒO MANUAL:');
        console.log('1. VÃ¡ para: https://console.firebase.google.com/');
        console.log('2. Selecione seu projeto');
        console.log('3. Authentication > Users');
        console.log('4. Encontre e exclua o usuÃ¡rio problemÃ¡tico');
        console.log('5. Tente criar novamente');
    }
}

// FunÃ§Ã£o para tentar recuperar usuÃ¡rio Ã³rfÃ£o
async function tentarRecuperarUsuarioOrfao(email) {
    console.log('ðŸ”„ Tentando recuperar usuÃ¡rio Ã³rfÃ£o:', email);
    
    try {
        const acao = confirm(
            `USUÃRIO Ã“RFÃƒO DETECTADO: ${email}\n\n` +
            `Este email existe no Firebase Auth mas nÃ£o no Firestore.\n\n` +
            `Escolha uma aÃ§Ã£o:\n` +
            `OK = Tentar recriar no Firestore\n` +
            `Cancelar = OrientaÃ§Ãµes para excluir do Auth`
        );
        
        if (acao) {
            // Tentar recriar no Firestore
            const nome = prompt('Digite o nome do usuÃ¡rio:');
            if (!nome) return;
            
            const tipo = prompt('Digite o tipo (admin/equipe/acompanhante):');
            if (!tipo || !['admin', 'equipe', 'acompanhante'].includes(tipo)) {
                console.log('âŒ Tipo invÃ¡lido. Use: admin, equipe ou acompanhante');
                return;
            }
            
            let equipeNome = null;
            if (tipo === 'equipe') {
                equipeNome = prompt('Digite a equipe (manutencao/higienizacao/hotelaria):');
                if (!equipeNome || !['manutencao', 'higienizacao', 'hotelaria'].includes(equipeNome)) {
                    console.log('âŒ Equipe invÃ¡lida');
                    return;
                }
            }
            
            // Tentar fazer login para obter UID
            const senhaTemp = prompt('Digite uma senha temporÃ¡ria para fazer login (6+ caracteres):');
            if (!senhaTemp || senhaTemp.length < 6) {
                console.log('âŒ Senha muito curta');
                return;
            }
            
            console.log('ðŸ”„ Fazendo login temporÃ¡rio...');
            const userCredential = await window.auth.signInWithEmailAndPassword(email, senhaTemp);
            const uid = userCredential.user.uid;
            
            console.log('âœ… UID obtido:', uid);
            
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
            
            console.log('âœ… USUÃRIO RECUPERADO COM SUCESSO!');
            console.log('ðŸ“‹ Criado em:', colecao);
            console.log('ðŸ“‹ Dados:', dados);
            
            // Fazer logout
            await window.auth.signOut();
            console.log('ðŸ”„ Logout realizado');
            
        } else {
            console.log('ðŸ”§ ORIENTAÃ‡Ã•ES PARA EXCLUSÃƒO MANUAL:');
            console.log('1. VÃ¡ para: https://console.firebase.google.com/');
            console.log('2. Selecione seu projeto: app-pedidos-4656c');
            console.log('3. Authentication > Users');
            console.log('4. Procure por:', email);
            console.log('5. Clique nos 3 pontos ao lado do usuÃ¡rio');
            console.log('6. Selecione "Delete user"');
            console.log('7. Confirme a exclusÃ£o');
            console.log('8. Tente criar o usuÃ¡rio novamente');
        }
        
    } catch (error) {
        console.error('âŒ Erro na recuperaÃ§Ã£o:', error);
        
        if (error.code === 'auth/wrong-password') {
            console.log('âŒ Senha incorreta para login temporÃ¡rio');
            console.log('ðŸ”§ Use a exclusÃ£o manual via Firebase Console');
        }
        
        console.log('ðŸ”— Link direto: https://console.firebase.google.com/project/app-pedidos-4656c/authentication/users');
    }
}

// Executar diagnÃ³stico automaticamente
console.log('ðŸš€ Iniciando diagnÃ³stico...');
diagnosticarEmailJaEmUso();

// Disponibilizar funÃ§Ãµes globalmente
window.diagnosticarEmailJaEmUso = diagnosticarEmailJaEmUso;
window.tentarRecuperarUsuarioOrfao = tentarRecuperarUsuarioOrfao;
