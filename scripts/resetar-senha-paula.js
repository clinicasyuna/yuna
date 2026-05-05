/**
 * Script para resetar senha da Paula no Firebase Auth
 * 
 * OPÇÕES:
 * 1. Definir senha específica (ex: senha temporária do Firestore)
 * 2. Enviar email de reset de senha
 * 
 * USO:
 * node scripts/resetar-senha-paula.js
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

async function resetarSenhaPaula() {
    console.log('\n🔐 RESETAR SENHA DA PAULA\n');
    console.log('═'.repeat(80));
    
    try {
        const email = 'paula@yuna.com.br';
        
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
        
        // 2. Buscar documento no Firestore
        console.log(`\n🔍 Buscando documento no Firestore...`);
        const docSnapshot = await db.collection('usuarios_acompanhantes')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        let senhaTemporaria = null;
        if (!docSnapshot.empty) {
            const doc = docSnapshot.docs[0];
            const data = doc.data();
            senhaTemporaria = data.senha;
            
            console.log(`✅ Documento encontrado (ID: ${doc.id})`);
            console.log(`   Nome: ${data.nome}`);
            console.log(`   Quarto: ${data.quarto}`);
            console.log(`   Pré-cadastro: ${data.preCadastro ? 'Sim' : 'Não'}`);
            if (senhaTemporaria) {
                console.log(`   Senha temporária: ${senhaTemporaria}`);
            }
        } else {
            console.log('⚠️ Documento não encontrado no Firestore');
        }
        
        // 3. Menu de opções
        console.log('\n\n📋 ESCOLHA UMA OPÇÃO:\n');
        if (senhaTemporaria) {
            console.log('1 - Definir senha como senha temporária do Firestore');
        }
        console.log('2 - Definir senha personalizada');
        console.log('3 - Enviar email de reset de senha');
        console.log('0 - Cancelar\n');
        
        const opcao = await perguntar('Digite o número da opção: ');
        
        switch(opcao.trim()) {
            case '1':
                if (!senhaTemporaria) {
                    console.log('\n❌ Senha temporária não encontrada no Firestore');
                    break;
                }
                
                console.log(`\n⚙️ Definindo senha como: ${senhaTemporaria}`);
                const confirma1 = await perguntar('Confirma? (S/N): ');
                
                if (confirma1.toUpperCase() === 'S') {
                    await auth.updateUser(user.uid, {
                        password: senhaTemporaria
                    });
                    console.log('\n✅ Senha atualizada com sucesso!');
                    console.log(`\n📋 CREDENCIAIS PARA LOGIN:`);
                    console.log(`   Email: ${email}`);
                    console.log(`   Senha: ${senhaTemporaria}`);
                } else {
                    console.log('\n❌ Operação cancelada');
                }
                break;
                
            case '2':
                const novaSenha = await perguntar('\nDigite a nova senha (mínimo 6 caracteres): ');
                
                if (novaSenha.length < 6) {
                    console.log('\n❌ Senha deve ter pelo menos 6 caracteres');
                    break;
                }
                
                const confirmaNova = await perguntar(`Confirma senha "${novaSenha}"? (S/N): `);
                
                if (confirmaNova.toUpperCase() === 'S') {
                    await auth.updateUser(user.uid, {
                        password: novaSenha
                    });
                    console.log('\n✅ Senha atualizada com sucesso!');
                    console.log(`\n📋 CREDENCIAIS PARA LOGIN:`);
                    console.log(`   Email: ${email}`);
                    console.log(`   Senha: ${novaSenha}`);
                    
                    // Atualizar no Firestore se existir
                    if (!docSnapshot.empty) {
                        const perguntaAtualizar = await perguntar('\nAtualizar senha no Firestore também? (S/N): ');
                        if (perguntaAtualizar.toUpperCase() === 'S') {
                            await db.collection('usuarios_acompanhantes').doc(docSnapshot.docs[0].id).update({
                                senha: novaSenha,
                                senhaAtualizadaEm: admin.firestore.FieldValue.serverTimestamp()
                            });
                            console.log('✅ Senha atualizada no Firestore também');
                        }
                    }
                } else {
                    console.log('\n❌ Operação cancelada');
                }
                break;
                
            case '3':
                console.log('\n📧 Enviando email de reset de senha...');
                const link = await auth.generatePasswordResetLink(email);
                console.log('\n✅ Link de reset gerado!');
                console.log(`\n📋 ENVIE ESTE LINK PARA A PAULA:`);
                console.log(link);
                console.log('\n⚠️ Link válido por 1 hora');
                console.log('💡 Paula deve abrir o link, definir nova senha e fazer login');
                break;
                
            case '0':
                console.log('\n❌ Operação cancelada');
                break;
                
            default:
                console.log('\n❌ Opção inválida');
        }
        
        console.log('\n✅ SCRIPT CONCLUÍDO\n');
        
    } catch (error) {
        console.error('\n❌ ERRO:', error);
        console.error(error.stack);
    } finally {
        rl.close();
        process.exit();
    }
}

// Executar
resetarSenhaPaula();
