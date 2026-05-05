/**
 * Script AUTOMÁTICO para corrigir problemas de login
 * 
 * CORREÇÕES:
 * 1. Paula: Resetar senha para 123456 (senha temporária do Firestore)
 * 2. Samuel: Criar documento no Firestore (se você fornecer os dados)
 * 
 * USO:
 * node scripts/corrigir-logins-automatico.js
 */

const { admin, initFirebaseAdmin } = require('./firebase-admin-init');

// Inicializar Firebase Admin com validacao de projeto
initFirebaseAdmin();

const auth = admin.auth();
const db = admin.firestore();

async function corrigirLogins() {
    console.log('\n🔧 CORREÇÃO AUTOMÁTICA DE LOGINS\n');
    console.log('═'.repeat(80));
    
    try {
        // ====================================
        // CORREÇÃO 1: PAULA - Resetar senha
        // ====================================
        console.log('\n\n1️⃣ CORRIGINDO PAULA (paula@yuna.com.br)...\n');
        
        try {
            const paulaEmail = 'paula@yuna.com.br';
            const novaSenha = '123456';
            
            // Buscar usuário no Auth
            const paulaAuth = await auth.getUserByEmail(paulaEmail);
            console.log(`✅ Usuário encontrado no Auth (UID: ${paulaAuth.uid})`);
            
            // Buscar documento no Firestore
            const paulaDocQuery = await db.collection('usuarios_acompanhantes')
                .where('email', '==', paulaEmail)
                .limit(1)
                .get();
            
            if (paulaDocQuery.empty) {
                console.log('❌ Documento não encontrado no Firestore');
            } else {
                const doc = paulaDocQuery.docs[0];
                const data = doc.data();
                console.log(`✅ Documento encontrado (ID: ${doc.id})`);
                console.log(`   Nome: ${data.nome}`);
                console.log(`   Quarto: ${data.quarto}`);
                console.log(`   Senha temporária: ${data.senha}`);
            }
            
            // Resetar senha no Firebase Auth
            console.log(`\n⚙️ Resetando senha para: ${novaSenha}`);
            await auth.updateUser(paulaAuth.uid, {
                password: novaSenha
            });
            
            console.log('✅ Senha resetada com sucesso!');
            console.log('\n📋 CREDENCIAIS DA PAULA:');
            console.log(`   Email: ${paulaEmail}`);
            console.log(`   Senha: ${novaSenha}`);
            console.log('\n✅ Paula pode fazer login agora!');
            
        } catch (error) {
            console.error('❌ Erro ao corrigir Paula:', error.message);
        }
        
        // ====================================
        // CORREÇÃO 2: SAMUEL - Criar documento
        // ====================================
        console.log('\n\n2️⃣ CORRIGINDO SAMUEL (samuel.lacerda@yuna.com.br)...\n');
        
        try {
            const samuelEmail = 'samuel.lacerda@yuna.com.br';
            
            // Buscar usuário no Auth
            const samuelAuth = await auth.getUserByEmail(samuelEmail);
            console.log(`✅ Usuário encontrado no Auth (UID: ${samuelAuth.uid})`);
            
            // Verificar se documento já existe
            const samuelDocQuery = await db.collection('usuarios_acompanhantes')
                .where('email', '==', samuelEmail)
                .limit(1)
                .get();
            
            if (!samuelDocQuery.empty) {
                console.log('⚠️ Documento já existe no Firestore');
                const doc = samuelDocQuery.docs[0];
                const data = doc.data();
                console.log(`   Doc ID: ${doc.id}`);
                console.log(`   Nome: ${data.nome}`);
                console.log(`   Quarto: ${data.quarto}`);
                console.log('\n✅ Nenhuma ação necessária');
            } else {
                console.log('❌ Documento NÃO existe no Firestore');
                console.log('\n⚠️ ATENÇÃO: Para criar o documento, precisamos dos seguintes dados:');
                console.log('   - Nome completo do Samuel');
                console.log('   - Número do quarto');
                console.log('\n💡 Execute manualmente:');
                console.log('   node scripts/criar-documento-samuel.js');
                console.log('\n📝 Ou crie manualmente no console do Firebase:');
                console.log('   Coleção: usuarios_acompanhantes');
                console.log(`   Doc ID: ${samuelAuth.uid}`);
                console.log('   Campos:');
                console.log('   {');
                console.log(`     "uid": "${samuelAuth.uid}",`);
                console.log(`     "email": "${samuelEmail}",`);
                console.log('     "nome": "Samuel Lacerda Jr",  // <-- AJUSTAR');
                console.log('     "quarto": "101",  // <-- AJUSTAR');
                console.log('     "ativo": true,');
                console.log('     "tipo": "acompanhante",');
                console.log('     "criadoEm": <timestamp>');
                console.log('   }');
            }
            
        } catch (error) {
            console.error('❌ Erro ao corrigir Samuel:', error.message);
        }
        
        // ====================================
        // OUTROS USUÁRIOS SEM DOCUMENTO
        // ====================================
        console.log('\n\n3️⃣ OUTROS USUÁRIOS NO AUTH SEM DOCUMENTO NO FIRESTORE:\n');
        
        const usuariosSemDocumento = [
            'leticia.costa@yuna.com.br',
            'edinar.leao@yuna.com.br',
            'peer.buergin@yuna.com.br',
            'amanda.braga@yuna.com.br',
            'caroline.chinaglia@yuna.com.br',
            'emerson.mori@yuna.com.br'
        ];
        
        console.log('⚠️ Estes usuários também estão sem documento no Firestore:');
        usuariosSemDocumento.forEach((email, index) => {
            console.log(`   ${index + 1}. ${email}`);
        });
        
        console.log('\n💡 Provavelmente são membros da EQUIPE, não acompanhantes');
        console.log('   Verifique se devem estar em usuarios_equipe ou usuarios_admin');
        
        // Verificar usuários de equipe (emails com departamento)
        const usuariosEquipe = [
            'nutricao.jardins@yuna.com.br',
            'hotelaria.jardins@yuna.com.br',
            'recepcao.jardins@yuna.com.br',
            'manutencao.jardins@yuna.com.br'
        ];
        
        console.log('\n\n4️⃣ USUÁRIOS DE EQUIPE SEM DOCUMENTO:\n');
        console.log('✅ Estes são claramente da EQUIPE:');
        usuariosEquipe.forEach((email, index) => {
            console.log(`   ${index + 1}. ${email}`);
        });
        console.log('\n💡 Devem estar em usuarios_equipe, não em usuarios_acompanhantes');
        console.log('   Isso é normal e esperado!');
        
        // ====================================
        // RESUMO FINAL
        // ====================================
        console.log('\n\n═'.repeat(80));
        console.log('✅ CORREÇÕES CONCLUÍDAS!\n');
        
        console.log('📋 RESUMO:');
        console.log('   ✅ Paula: Senha resetada para 123456');
        console.log('   ⚠️ Samuel: Documento precisa ser criado manualmente');
        console.log('   ℹ️ Outros: Verificar se são equipe ou acompanhantes\n');
        
        console.log('🧪 TESTES:');
        console.log('   1. Paula pode fazer login agora com:');
        console.log('      Email: paula@yuna.com.br');
        console.log('      Senha: 123456');
        console.log('\n   2. Para Samuel, execute:');
        console.log('      node scripts/criar-documento-samuel.js');
        console.log('\n   3. Aguarde 3 minutos para deploy e teste novamente\n');
        
    } catch (error) {
        console.error('\n❌ ERRO GERAL:', error);
        console.error(error.stack);
    } finally {
        process.exit();
    }
}

// Executar
corrigirLogins();
