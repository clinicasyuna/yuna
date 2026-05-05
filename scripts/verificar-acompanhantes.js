/**
 * Script para verificar e corrigir dados de acompanhantes no Firestore
 * 
 * PROBLEMAS IDENTIFICADOS:
 * 1. samuel.lacerda@yuna.com.br - Login funcionou, mas documento não existe em usuarios_acompanhantes
 * 2. paula@yuna.com.br - Conta existe no Firebase Auth, mas senha está incorreta
 * 
 * USO:
 * node scripts/verificar-acompanhantes.js
 */

const { admin, initFirebaseAdmin } = require('./firebase-admin-init');

// Inicializar Firebase Admin com validacao de projeto
initFirebaseAdmin();

const auth = admin.auth();
const db = admin.firestore();

async function verificarAcompanhantes() {
    console.log('\n🔍 VERIFICANDO ACOMPANHANTES NO SISTEMA...\n');
    
    try {
        // 1. Listar todos os acompanhantes no Firestore
        console.log('📋 PARTE 1: Acompanhantes no Firestore (usuarios_acompanhantes)');
        console.log('═'.repeat(80));
        
        const acompanhantesSnapshot = await db.collection('usuarios_acompanhantes')
            .orderBy('email')
            .get();
        
        console.log(`\n✅ Total de documentos: ${acompanhantesSnapshot.size}\n`);
        
        const firestoreEmails = [];
        acompanhantesSnapshot.forEach((doc, index) => {
            const data = doc.data();
            firestoreEmails.push(data.email);
            
            console.log(`\n${index + 1}. Documento: ${doc.id}`);
            console.log(`   Email: ${data.email}`);
            console.log(`   UID: ${data.uid || '❌ SEM UID'}`);
            console.log(`   Nome: ${data.nome || '❌ SEM NOME'}`);
            console.log(`   Quarto: ${data.quarto || '❌ SEM QUARTO'}`);
            console.log(`   Ativo: ${data.ativo === true ? '✅ Sim' : '❌ Não'}`);
            console.log(`   Pré-cadastro: ${data.preCadastro === true ? '⚠️ Sim' : 'Não'}`);
            if (data.senha) {
                console.log(`   Senha temporária: ${data.senha.substring(0, 3)}*** (${data.senha.length} caracteres)`);
            }
        });
        
        // 2. Listar todos os usuários no Firebase Auth
        console.log('\n\n📋 PARTE 2: Usuários no Firebase Authentication');
        console.log('═'.repeat(80));
        
        const listUsersResult = await auth.listUsers(1000);
        const authUsers = listUsersResult.users.filter(u => u.email && u.email.includes('yuna.com.br'));
        
        console.log(`\n✅ Total de usuários YUNA no Auth: ${authUsers.length}\n`);
        
        const authEmails = [];
        authUsers.forEach((user, index) => {
            authEmails.push(user.email);
            console.log(`\n${index + 1}. UID: ${user.uid}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Criado: ${new Date(user.metadata.creationTime).toLocaleString('pt-BR')}`);
            console.log(`   Último login: ${new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR')}`);
            console.log(`   Desabilitado: ${user.disabled ? '❌ Sim' : '✅ Não'}`);
        });
        
        // 3. Comparar e identificar inconsistências
        console.log('\n\n⚠️ PARTE 3: Análise de Inconsistências');
        console.log('═'.repeat(80));
        
        // Usuários no Auth mas sem documento no Firestore
        const semDocumento = authEmails.filter(email => !firestoreEmails.includes(email));
        if (semDocumento.length > 0) {
            console.log('\n❌ USUÁRIOS NO AUTH SEM DOCUMENTO NO FIRESTORE:');
            semDocumento.forEach(email => {
                const user = authUsers.find(u => u.email === email);
                console.log(`   - ${email} (UID: ${user.uid})`);
            });
        } else {
            console.log('\n✅ Todos os usuários do Auth têm documento no Firestore');
        }
        
        // Documentos no Firestore sem usuário no Auth
        const semAuth = firestoreEmails.filter(email => !authEmails.includes(email));
        if (semAuth.length > 0) {
            console.log('\n⚠️ DOCUMENTOS NO FIRESTORE SEM USUÁRIO NO AUTH:');
            semAuth.forEach(email => console.log(`   - ${email}`));
        } else {
            console.log('\n✅ Todos os documentos do Firestore têm usuário no Auth');
        }
        
        // 4. Verificar casos específicos
        console.log('\n\n🎯 PARTE 4: Casos Específicos Reportados');
        console.log('═'.repeat(80));
        
        // Samuel
        console.log('\n1️⃣ samuel.lacerda@yuna.com.br:');
        const samuelAuth = authUsers.find(u => u.email === 'samuel.lacerda@yuna.com.br');
        const samuelDoc = acompanhantesSnapshot.docs.find(doc => doc.data().email === 'samuel.lacerda@yuna.com.br');
        
        if (samuelAuth) {
            console.log(`   ✅ Existe no Auth (UID: ${samuelAuth.uid})`);
        } else {
            console.log('   ❌ NÃO existe no Auth');
        }
        
        if (samuelDoc) {
            console.log(`   ✅ Existe no Firestore (Doc ID: ${samuelDoc.id})`);
            console.log(`   📋 UID no documento: ${samuelDoc.data().uid || 'NENHUM'}`);
        } else {
            console.log('   ❌ NÃO existe no Firestore');
        }
        
        // Paula
        console.log('\n2️⃣ paula@yuna.com.br:');
        const paulaAuth = authUsers.find(u => u.email === 'paula@yuna.com.br');
        const paulaDoc = acompanhantesSnapshot.docs.find(doc => doc.data().email === 'paula@yuna.com.br');
        
        if (paulaAuth) {
            console.log(`   ✅ Existe no Auth (UID: ${paulaAuth.uid})`);
            console.log(`   📅 Criada: ${new Date(paulaAuth.metadata.creationTime).toLocaleString('pt-BR')}`);
            console.log(`   🔐 Último login: ${new Date(paulaAuth.metadata.lastSignInTime).toLocaleString('pt-BR')}`);
        } else {
            console.log('   ❌ NÃO existe no Auth');
        }
        
        if (paulaDoc) {
            console.log(`   ✅ Existe no Firestore (Doc ID: ${paulaDoc.id})`);
            console.log(`   📋 UID no documento: ${paulaDoc.data().uid || 'NENHUM'}`);
            console.log(`   🏨 Quarto: ${paulaDoc.data().quarto || 'NENHUM'}`);
            console.log(`   👤 Nome: ${paulaDoc.data().nome || 'NENHUM'}`);
            console.log(`   ⚙️ Pré-cadastro: ${paulaDoc.data().preCadastro ? 'Sim' : 'Não'}`);
            if (paulaDoc.data().senha) {
                console.log(`   🔑 Senha temporária: ${paulaDoc.data().senha}`);
            }
        } else {
            console.log('   ❌ NÃO existe no Firestore');
        }
        
        // 5. Soluções sugeridas
        console.log('\n\n💡 PARTE 5: Soluções Recomendadas');
        console.log('═'.repeat(80));
        
        if (samuelAuth && !samuelDoc) {
            console.log('\n🔧 SAMUEL (samuel.lacerda@yuna.com.br):');
            console.log('   PROBLEMA: Usuário logou no Auth mas não tem documento no Firestore');
            console.log('   SOLUÇÃO: Criar documento no Firestore com os dados do usuário');
            console.log('\n   Execute:');
            console.log('   node scripts/criar-documento-samuel.js');
        }
        
        if (paulaAuth && paulaDoc) {
            console.log('\n🔧 PAULA (paula@yuna.com.br):');
            console.log('   PROBLEMA: Senha incorreta (auth/invalid-login-credentials)');
            console.log('   SOLUÇÃO 1: Resetar senha para a senha temporária do documento');
            console.log('   SOLUÇÃO 2: Enviar email de reset de senha');
            console.log('\n   Execute:');
            console.log('   node scripts/resetar-senha-paula.js');
        }
        
        console.log('\n\n✅ VERIFICAÇÃO CONCLUÍDA!\n');
        
    } catch (error) {
        console.error('\n❌ ERRO:', error);
        console.error(error.stack);
    } finally {
        process.exit();
    }
}

// Executar
verificarAcompanhantes();
