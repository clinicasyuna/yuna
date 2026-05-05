/**
 * Script para criar documento do Samuel no Firestore
 * 
 * PROBLEMA: samuel.lacerda@yuna.com.br logou no Firebase Auth mas não tem documento em usuarios_acompanhantes
 * SOLUÇÃO: Criar documento com dados padrão
 * 
 * USO:
 * node scripts/criar-documento-samuel.js
 */

const { admin, initFirebaseAdmin } = require('./firebase-admin-init');
const readline = require('readline');

// Inicializar Firebase Admin com validacao de projeto
initFirebaseAdmin();

const auth = admin.auth();
const db = admin.firestore();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function perguntar(pergunta) {
    return new Promise(resolve => rl.question(pergunta, resolve));
}

async function criarDocumentoSamuel() {
    console.log('\n📝 CRIAR DOCUMENTO PARA SAMUEL NO FIRESTORE\n');
    console.log('═'.repeat(80));
    
    try {
        const email = 'samuel.lacerda@yuna.com.br';
        
        // 1. Buscar usuário no Auth
        console.log(`\n🔍 Buscando usuário ${email} no Firebase Auth...`);
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log(`✅ Usuário encontrado (UID: ${user.uid})`);
        } catch (error) {
            console.error(`❌ Usuário não encontrado no Firebase Auth: ${error.message}`);
            process.exit(1);
        }
        
        // 2. Verificar se já existe documento
        console.log(`\n🔍 Verificando se documento já existe...`);
        const existente = await db.collection('usuarios_acompanhantes')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (!existente.empty) {
            console.log('⚠️ ATENÇÃO: Documento já existe!');
            const doc = existente.docs[0];
            const data = doc.data();
            console.log(`   Doc ID: ${doc.id}`);
            console.log(`   UID: ${data.uid}`);
            console.log(`   Nome: ${data.nome}`);
            console.log(`   Quarto: ${data.quarto}`);
            console.log(`   Ativo: ${data.ativo}`);
            
            const pergunta = await perguntar('\nDeseja ATUALIZAR o documento existente? (S/N): ');
            if (pergunta.toUpperCase() !== 'S') {
                console.log('\n❌ Operação cancelada');
                process.exit(0);
            }
        }
        
        // 3. Coletar dados
        console.log('\n\n📋 DADOS DO ACOMPANHANTE:\n');
        
        const nome = await perguntar('Nome completo: ');
        const quarto = await perguntar('Número do quarto: ');
        const ativo = await perguntar('Ativo (S/N) [S]: ');
        
        // Validações
        if (!nome || nome.trim().length < 3) {
            console.log('\n❌ Nome inválido');
            process.exit(1);
        }
        
        if (!quarto || quarto.trim().length === 0) {
            console.log('\n❌ Quarto é obrigatório');
            process.exit(1);
        }
        
        const dadosUsuario = {
            uid: user.uid,
            email: email,
            nome: nome.trim(),
            quarto: quarto.trim(),
            ativo: !ativo || ativo.toUpperCase() === 'S',
            criadoEm: admin.firestore.FieldValue.serverTimestamp(),
            tipo: 'acompanhante'
        };
        
        // 4. Confirmar dados
        console.log('\n\n📋 CONFIRME OS DADOS:\n');
        console.log(`   UID: ${dadosUsuario.uid}`);
        console.log(`   Email: ${dadosUsuario.email}`);
        console.log(`   Nome: ${dadosUsuario.nome}`);
        console.log(`   Quarto: ${dadosUsuario.quarto}`);
        console.log(`   Ativo: ${dadosUsuario.ativo ? 'Sim' : 'Não'}`);
        
        const confirma = await perguntar('\n✅ Confirma criação/atualização? (S/N): ');
        
        if (confirma.toUpperCase() !== 'S') {
            console.log('\n❌ Operação cancelada');
            process.exit(0);
        }
        
        // 5. Criar/atualizar documento
        if (!existente.empty) {
            // Atualizar documento existente
            const docId = existente.docs[0].id;
            await db.collection('usuarios_acompanhantes').doc(docId).update({
                ...dadosUsuario,
                atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`\n✅ Documento atualizado com sucesso! (ID: ${docId})`);
        } else {
            // Criar novo documento usando UID como ID
            await db.collection('usuarios_acompanhantes').doc(user.uid).set(dadosUsuario);
            console.log(`\n✅ Documento criado com sucesso! (ID: ${user.uid})`);
        }
        
        // 6. Verificar/atualizar quarto ocupado
        console.log('\n🔍 Verificando registro de quarto ocupado...');
        const quartoDoc = await db.collection('quartos_ocupados').doc(dadosUsuario.quarto).get();
        
        if (quartoDoc.exists) {
            const quartoData = quartoDoc.data();
            if (quartoData.acompanhanteId !== user.uid) {
                console.log(`⚠️ Quarto ${dadosUsuario.quarto} registrado para outro acompanhante`);
                const atualizarQuarto = await perguntar('Deseja atualizar para este acompanhante? (S/N): ');
                
                if (atualizarQuarto.toUpperCase() === 'S') {
                    await db.collection('quartos_ocupados').doc(dadosUsuario.quarto).update({
                        acompanhanteId: user.uid,
                        acompanhanteEmail: email,
                        acompanhanteNome: dadosUsuario.nome,
                        atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ Registro de quarto atualizado');
                }
            } else {
                console.log('✅ Registro de quarto já está correto');
            }
        } else {
            console.log(`📝 Criando registro de quarto ocupado...`);
            await db.collection('quartos_ocupados').doc(dadosUsuario.quarto).set({
                quarto: dadosUsuario.quarto,
                acompanhanteId: user.uid,
                acompanhanteEmail: email,
                acompanhanteNome: dadosUsuario.nome,
                ativo: dadosUsuario.ativo,
                ocupadoEm: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Registro de quarto criado');
        }
        
        console.log('\n\n✅ PROCESSO CONCLUÍDO COM SUCESSO!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('   1. Aguarde ~3 minutos para propagação');
        console.log('   2. Acesse: https://clinicasyuna.github.io/yuna/acompanhantes/');
        console.log(`   3. Faça login com: ${email}`);
        console.log('   4. Sistema deve carregar dados do quarto e nome');
        
        console.log('\n');
        
    } catch (error) {
        console.error('\n❌ ERRO:', error);
        console.error(error.stack);
    } finally {
        rl.close();
        process.exit();
    }
}

// Executar
criarDocumentoSamuel();
