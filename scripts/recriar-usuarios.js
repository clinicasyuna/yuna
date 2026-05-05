#!/usr/bin/env node

/**
 * Script para Deletar e Recriar UsuÃ¡rios com Novas Senhas
 * 
 * IMPORTANTE: Execute este script apenas com permissÃµes de super_admin
 * 
 * Uso: node recriar-usuarios.js
 */

const { admin, initFirebaseAdmin } = require('./firebase-admin-init');

try {
    initFirebaseAdmin();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// DADOS DOS USUÃRIOS
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
        nome: 'ManutenÃ§Ã£o Jardins',
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
        nome: 'RecepÃ§Ã£o Jardins',
        departamento: 'higienizacao',
        equipe: 'higienizacao'
    }
];

const USUARIOS_ADMIN = [
    {
        email: 'edinar.leao@yuna.com.br',
        senha: 'Edi@123456',
        nome: 'Edinar LeÃ£o',
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
// FUNÃ‡Ã•ES AUXILIARES
// ============================================

async function deletarUsuarioAuth(email) {
    try {
        const user = await auth.getUserByEmail(email);
        await auth.deleteUser(user.uid);
        console.log(`   âœ… Deletado do Firebase Auth: ${email}`);
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`   â„¹ï¸  UsuÃ¡rio nÃ£o existe no Auth: ${email}`);
            return null;
        }
        throw error;
    }
}

async function deletarUsuarioFirestore(colecao, uid) {
    try {
        await db.collection(colecao).doc(uid).delete();
        console.log(`   âœ… Deletado do Firestore (${colecao}): ${uid}`);
    } catch (error) {
        if (error.code === 'not-found') {
            console.log(`   â„¹ï¸  Documento nÃ£o existe no Firestore: ${uid}`);
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
        console.log(`   âœ… Criado no Firebase Auth: ${email} (UID: ${user.uid})`);
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log(`   âš ï¸  Email jÃ¡ existe: ${email}`);
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
    console.log(`   âœ… Criado no Firestore (usuarios_equipe): ${uid}`);
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
    console.log(`   âœ… Criado no Firestore (usuarios_admin): ${uid}`);
}

// ============================================
// PROCESSO PRINCIPAL
// ============================================

async function procesarUsuarios() {
    console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘  ðŸ”„ SCRIPT DE RECREAÃ‡ÃƒO DE USUÃRIOS COM NOVAS SENHAS     â•‘');
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

    const confirmacao = await new Promise(resolve => {
        process.stdout.write('âš ï¸  ATENÃ‡ÃƒO: Este script irÃ¡ deletar e recriar todos os usuÃ¡rios.\n');
        process.stdout.write('Digite "confirmo" para prosseguir: ');
        
        process.stdin.on('data', (data) => {
            const input = data.toString().trim();
            if (input === 'confirmo') {
                resolve(true);
                process.stdin.removeAllListeners();
            } else {
                process.stdout.write('\nâŒ OperaÃ§Ã£o cancelada.\n');
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
        console.log('\nðŸ“Œ PROCESSANDO EQUIPES...\n');

        for (const equipe of USUARIOS_EQUIPES) {
            console.log(`ðŸ”„ ${equipe.nome} (${equipe.email})`);
            
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
                console.log(`   â„¹ï¸  Nenhum documento encontrado no Firestore`);
            }
            
            // 3. Recriar no Auth
            const uid = await criarUsuarioAuth(equipe.email, equipe.senha);
            
            // 4. Recriar no Firestore
            await criarUsuarioEquipe(uid, equipe);
            
            console.log(`   âœ¨ ${equipe.nome} recriado com sucesso!\n`);
        }

        // ====================================
        // ADMINISTRADORES
        // ====================================
        console.log('\nðŸ“Œ PROCESSANDO ADMINISTRADORES...\n');

        for (const admin_user of USUARIOS_ADMIN) {
            console.log(`ðŸ”„ ${admin_user.nome} (${admin_user.email})`);
            
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
                console.log(`   â„¹ï¸  Nenhum documento encontrado no Firestore`);
            }
            
            // 3. Recriar no Auth
            const uid = await criarUsuarioAuth(admin_user.email, admin_user.senha);
            
            // 4. Recriar no Firestore
            await criarUsuarioAdmin(uid, admin_user);
            
            console.log(`   âœ¨ ${admin_user.nome} recriado com sucesso!\n`);
        }

        console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
        console.log('â•‘  âœ… TODOS OS USUÃRIOS FORAM RECRIADOS COM SUCESSO!        â•‘');
        console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
        
        console.log('ðŸ“‹ RESUMO DOS LOGINS:');
        console.log('\nðŸ¢ EQUIPES:');
        USUARIOS_EQUIPES.forEach(u => {
            console.log(`   â€¢ ${u.nome}: ${u.email} / ${u.senha}`);
        });
        
        console.log('\nðŸ‘¤ ADMINISTRADORES:');
        USUARIOS_ADMIN.forEach(u => {
            console.log(`   â€¢ ${u.nome}: ${u.email} / ${u.senha}`);
        });
        
        console.log('\nâœ¨ Os usuÃ¡rios jÃ¡ podem fazer login com as novas senhas!\n');

    } catch (error) {
        console.error('\nâŒ ERRO DURANTE PROCESSAMENTO:');
        console.error(error);
        process.exit(1);
    } finally {
        process.stdin.destroy();
        process.exit(0);
    }
}

// Iniciar o processo
procesarUsuarios().catch(error => {
    console.error('âŒ ERRO FATAL:', error);
    process.exit(1);
});

