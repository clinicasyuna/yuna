#!/usr/bin/env node

/**
 * Script para Deletar e Recriar Usuários com Novas Senhas
 * 
 * IMPORTANTE: Execute este script apenas com permissões de super_admin
 * 
 * Uso: node recriar-usuarios.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERRO: Arquivo firebase-service-account.json não encontrado!');
    console.error(`📍 Esperado em: ${serviceAccountPath}`);
    console.error('\n📋 INSTRUÇÕES:');
    console.error('1. Acesse: https://console.firebase.google.com');
    console.error('2. Projeto: studio-5526632052-23813');
    console.error('3. ⚙️ Configurações do Projeto → Contas de Serviço → Firebase Admin SDK');
    console.error('4. Clique em "Gerar nova chave privada"');
    console.error('5. Salve o arquivo JSON em: scripts/firebase-service-account.json');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// DADOS DOS USUÁRIOS
// ============================================

const USUARIOS_EQUIPES = [
    {
        email: 'nutricao.jardins@yuna.com.br',
        senha: 'Nuti@123456',
        nome: 'Nutricao Jardins',
        departamento: 'nutricao',
        equipe: 'nutricao'
    },
    {
        email: 'manutencao.jardins@yuna.com.br',
        senha: 'Manu@123456',
        nome: 'Manutenção Jardins',
        departamento: 'manutencao',
        equipe: 'manutencao'
    },
    {
        email: 'hotelaria.jardins@yuna.com.br',
        senha: 'Hotel@123456',
        nome: 'Hotelaria Jardins',
        departamento: 'hotelaria',
        equipe: 'hotelaria'
    },
    {
        email: 'recepcao.jardins@yuna.com.br',
        senha: 'Recep@123456',
        nome: 'Recepção Jardins',
        departamento: 'higienizacao',
        equipe: 'higienizacao'
    }
];

const USUARIOS_ADMIN = [
    {
        email: 'edinar.leao@yuna.com.br',
        senha: 'Edi@123456',
        nome: 'Edinar Leão',
        role: 'admin'
    },
    {
        email: 'amanda.braga@yuna.com.br',
        senha: 'Aman@123456',
        nome: 'Amanda Braga',
        role: 'admin'
    },
    {
        email: 'caroline.chinaglia@yuna.com.br',
        senha: 'Carol@123456',
        nome: 'Caroline Chinaglia',
        role: 'admin'
    }
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function deletarUsuarioAuth(email) {
    try {
        const user = await auth.getUserByEmail(email);
        await auth.deleteUser(user.uid);
        console.log(`   ✅ Deletado do Firebase Auth: ${email}`);
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`   ℹ️  Usuário não existe no Auth: ${email}`);
            return null;
        }
        throw error;
    }
}

async function deletarUsuarioFirestore(colecao, uid) {
    try {
        await db.collection(colecao).doc(uid).delete();
        console.log(`   ✅ Deletado do Firestore (${colecao}): ${uid}`);
    } catch (error) {
        if (error.code === 'not-found') {
            console.log(`   ℹ️  Documento não existe no Firestore: ${uid}`);
        } else {
            throw error;
        }
    }
}

async function criarUsuarioAuth(email, senha) {
    try {
        const user = await auth.createUser({
            email: email,
            password: senha,
            emailVerified: true
        });
        console.log(`   ✅ Criado no Firebase Auth: ${email} (UID: ${user.uid})`);
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log(`   ⚠️  Email já existe: ${email}`);
            const user = await auth.getUserByEmail(email);
            return user.uid;
        }
        throw error;
    }
}

async function criarUsuarioEquipe(uid, data) {
    const usuarioData = {
        uid: uid,
        email: data.email,
        nome: data.nome,
        departamento: data.departamento,
        equipe: data.equipe,
        ativo: true,
        criadoEm: admin.firestore.Timestamp.now(),
        atualizadoEm: admin.firestore.Timestamp.now(),
        permissoes: {
            criar_solicitacao: true,
            visualizar_solicitacao: true,
            atualizar_solicitacao: true,
            avaliar_solicitacao: true,
            exportar_relatorio: true
        }
    };
    
    await db.collection('usuarios_equipe').doc(uid).set(usuarioData);
    console.log(`   ✅ Criado no Firestore (usuarios_equipe): ${uid}`);
}

async function criarUsuarioAdmin(uid, data) {
    const usuarioData = {
        uid: uid,
        email: data.email,
        nome: data.nome,
        role: data.role,
        ativo: true,
        criadoEm: admin.firestore.Timestamp.now(),
        atualizadoEm: admin.firestore.Timestamp.now(),
        permissoes: {
            criar_usuarios: data.role === 'super_admin',
            editar_usuarios: data.role === 'super_admin',
            deletar_usuarios: data.role === 'super_admin',
            alterar_senhas: data.role === 'super_admin',
            visualizar_relatorios: true,
            exportar_relatorios: true,
            gerenciar_equipes: data.role === 'super_admin',
            limpar_dados: data.role === 'super_admin'
        }
    };
    
    await db.collection('usuarios_admin').doc(uid).set(usuarioData);
    console.log(`   ✅ Criado no Firestore (usuarios_admin): ${uid}`);
}

// ============================================
// PROCESSO PRINCIPAL
// ============================================

async function procesarUsuarios() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  🔄 SCRIPT DE RECREAÇÃO DE USUÁRIOS COM NOVAS SENHAS     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const confirmacao = await new Promise(resolve => {
        process.stdout.write('⚠️  ATENÇÃO: Este script irá deletar e recriar todos os usuários.\n');
        process.stdout.write('Digite "confirmo" para prosseguir: ');
        
        process.stdin.on('data', (data) => {
            const input = data.toString().trim();
            if (input === 'confirmo') {
                resolve(true);
                process.stdin.removeAllListeners();
            } else {
                process.stdout.write('\n❌ Operação cancelada.\n');
                resolve(false);
                process.stdin.removeAllListeners();
            }
        });
    });

    if (!confirmacao) {
        process.exit(0);
    }

    try {
        // ====================================
        // EQUIPES
        // ====================================
        console.log('\n📌 PROCESSANDO EQUIPES...\n');

        for (const equipe of USUARIOS_EQUIPES) {
            console.log(`🔄 ${equipe.nome} (${equipe.email})`);
            
            // 1. Deletar do Auth
            await deletarUsuarioAuth(equipe.email);
            
            // 2. Deletar do Firestore (usar email para encontrar o uid)
            try {
                const snapshot = await db.collection('usuarios_equipe')
                    .where('email', '==', equipe.email)
                    .get();
                
                for (const doc of snapshot.docs) {
                    await deletarUsuarioFirestore('usuarios_equipe', doc.id);
                }
            } catch (error) {
                console.log(`   ℹ️  Nenhum documento encontrado no Firestore`);
            }
            
            // 3. Recriar no Auth
            const uid = await criarUsuarioAuth(equipe.email, equipe.senha);
            
            // 4. Recriar no Firestore
            await criarUsuarioEquipe(uid, equipe);
            
            console.log(`   ✨ ${equipe.nome} recriado com sucesso!\n`);
        }

        // ====================================
        // ADMINISTRADORES
        // ====================================
        console.log('\n📌 PROCESSANDO ADMINISTRADORES...\n');

        for (const admin_user of USUARIOS_ADMIN) {
            console.log(`🔄 ${admin_user.nome} (${admin_user.email})`);
            
            // 1. Deletar do Auth
            await deletarUsuarioAuth(admin_user.email);
            
            // 2. Deletar do Firestore
            try {
                const snapshot = await db.collection('usuarios_admin')
                    .where('email', '==', admin_user.email)
                    .get();
                
                for (const doc of snapshot.docs) {
                    await deletarUsuarioFirestore('usuarios_admin', doc.id);
                }
            } catch (error) {
                console.log(`   ℹ️  Nenhum documento encontrado no Firestore`);
            }
            
            // 3. Recriar no Auth
            const uid = await criarUsuarioAuth(admin_user.email, admin_user.senha);
            
            // 4. Recriar no Firestore
            await criarUsuarioAdmin(uid, admin_user);
            
            console.log(`   ✨ ${admin_user.nome} recriado com sucesso!\n`);
        }

        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║  ✅ TODOS OS USUÁRIOS FORAM RECRIADOS COM SUCESSO!        ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');
        
        console.log('📋 RESUMO DOS LOGINS:');
        console.log('\n🏢 EQUIPES:');
        USUARIOS_EQUIPES.forEach(u => {
            console.log(`   • ${u.nome}: ${u.email} / ${u.senha}`);
        });
        
        console.log('\n👤 ADMINISTRADORES:');
        USUARIOS_ADMIN.forEach(u => {
            console.log(`   • ${u.nome}: ${u.email} / ${u.senha}`);
        });
        
        console.log('\n✨ Os usuários já podem fazer login com as novas senhas!\n');

    } catch (error) {
        console.error('\n❌ ERRO DURANTE PROCESSAMENTO:');
        console.error(error);
        process.exit(1);
    } finally {
        process.stdin.destroy();
        process.exit(0);
    }
}

// Iniciar o processo
procesarUsuarios().catch(error => {
    console.error('❌ ERRO FATAL:', error);
    process.exit(1);
});
