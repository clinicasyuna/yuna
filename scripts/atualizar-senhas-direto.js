#!/usr/bin/env node

/**
 * âš¡ Script para Atualizar Senhas Diretamente (sem emails)
 * 
 * Para emails fictÃ­cios que nÃ£o recebem mensagens,
 * este script atualiza as senhas diretamente no Firebase
 * sem tentar enviar emails.
 * 
 * REQUER: firebase-service-account.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ConfiguraÃ§Ã£o do Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('âŒ ERRO: Arquivo firebase-service-account.json nÃ£o encontrado!');
    console.error(`ðŸ“ Esperado em: ${serviceAccountPath}`);
    console.error('\nðŸ“‹ INSTRUÃ‡Ã•ES:');
    console.error('1. Acesse: https://console.firebase.google.com');
    console.error('2. Projeto: app-pedidos-4656c');
    console.error('3. âš™ï¸ ConfiguraÃ§Ãµes do Projeto â†’ Contas de ServiÃ§o â†’ Firebase Admin SDK');
    console.error('4. Clique em "Gerar nova chave privada"');
    console.error('5. Salve o arquivo JSON em: scripts/firebase-service-account.json');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// ============================================
// DADOS DOS USUÃRIOS
// ============================================

const USUARIOS_EQUIPES = [
    {
        email: 'nutricao.jardins@yuna.com.br',
        senha: 'Nuti@123456',
        nome: 'Nutricao Jardins',
        departamento: 'nutricao',
        equipe: 'nutricao',
        tipo: 'equipe'
    },
    {
        email: 'manutencao.jardins@yuna.com.br',
        senha: 'Manu@123456',
        nome: 'ManutenÃ§Ã£o Jardins',
        departamento: 'manutencao',
        equipe: 'manutencao',
        tipo: 'equipe'
    },
    {
        email: 'hotelaria.jardins@yuna.com.br',
        senha: 'Hotel@123456',
        nome: 'Hotelaria Jardins',
        departamento: 'hotelaria',
        equipe: 'hotelaria',
        tipo: 'equipe'
    },
    {
        email: 'recepcao.jardins@yuna.com.br',
        senha: 'Recep@123456',
        nome: 'RecepÃ§Ã£o Jardins',
        departamento: 'higienizacao',
        equipe: 'higienizacao',
        tipo: 'equipe'
    }
];

const USUARIOS_ADMIN = [
    {
        email: 'edinar.leao@yuna.com.br',
        senha: 'Edi@123456',
        nome: 'Edinar LeÃ£o',
        role: 'admin',
        tipo: 'admin'
    },
    {
        email: 'amanda.braga@yuna.com.br',
        senha: 'Aman@123456',
        nome: 'Amanda Braga',
        role: 'admin',
        tipo: 'admin'
    },
    {
        email: 'caroline.chinaglia@yuna.com.br',
        senha: 'Carol@123456',
        nome: 'Caroline Chinaglia',
        role: 'admin',
        tipo: 'admin'
    }
];

// ============================================
// FUNÃ‡Ã•ES
// ============================================

async function obterUidPorEmail(email) {
    try {
        const user = await auth.getUserByEmail(email);
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return null;
        }
        throw error;
    }
}

async function atualizarSenha(email, novaSenha) {
    try {
        const uid = await obterUidPorEmail(email);
        
        if (!uid) {
            console.log(`   âŒ UsuÃ¡rio nÃ£o encontrado: ${email}`);
            return false;
        }
        
        await auth.updateUser(uid, {
            password: novaSenha,
            emailVerified: true
        });
        
        console.log(`   âœ… Senha atualizada: ${email} â†’ ${novaSenha}`);
        return true;
    } catch (error) {
        console.error(`   âŒ Erro ao atualizar senha: ${error.message}`);
        return false;
    }
}

// ============================================
// PROCESSO PRINCIPAL
// ============================================

async function processar() {
    console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘  ðŸ” ATUALIZAR SENHAS DIRETAMENTE (Sem Emails)            â•‘');
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

    const confirmacao = await new Promise(resolve => {
        process.stdout.write('âš ï¸  ATENÃ‡ÃƒO: Este script vai atualizar as senhas DIRETAMENTE.\n');
        process.stdout.write('NÃ£o serÃ£o enviados emails.\n');
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
        let sucessos = 0;
        let falhas = 0;

        // ====================================
        // EQUIPES
        // ====================================
        console.log('\nðŸ“Œ ATUALIZANDO EQUIPES...\n');

        for (const equipe of USUARIOS_EQUIPES) {
            console.log(`ðŸ”„ ${equipe.nome} (${equipe.email})`);
            
            const resultado = await atualizarSenha(equipe.email, equipe.senha);
            
            if (resultado) {
                sucessos++;
            } else {
                falhas++;
            }
            
            console.log('');
        }

        // ====================================
        // ADMINISTRADORES
        // ====================================
        console.log('\nðŸ“Œ ATUALIZANDO ADMINISTRADORES...\n');

        for (const admin_user of USUARIOS_ADMIN) {
            console.log(`ðŸ”„ ${admin_user.nome} (${admin_user.email})`);
            
            const resultado = await atualizarSenha(admin_user.email, admin_user.senha);
            
            if (resultado) {
                sucessos++;
            } else {
                falhas++;
            }
            
            console.log('');
        }

        console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
        console.log(`â•‘  âœ… CONCLUÃDO! (${sucessos} sucessos, ${falhas} falhas)                â•‘`);
        console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
        
        if (sucessos === 7 && falhas === 0) {
            console.log('ðŸŽ‰ TODAS AS SENHAS FORAM ATUALIZADAS COM SUCESSO!\n');
            console.log('ðŸ“‹ RESUMO DOS LOGINS:');
            console.log('\nðŸ¢ EQUIPES:');
            USUARIOS_EQUIPES.forEach(u => {
                console.log(`   â€¢ ${u.nome}: ${u.email} / ${u.senha}`);
            });
            
            console.log('\nðŸ‘¤ ADMINISTRADORES:');
            USUARIOS_ADMIN.forEach(u => {
                console.log(`   â€¢ ${u.nome}: ${u.email} / ${u.senha}`);
            });
        } else {
            console.log(`âš ï¸  ${falhas} senha(s) nÃ£o foi(ram) atualizada(s).`);
            console.log('   Verifique os erros acima.\n');
        }
        
        console.log('âœ¨ Os usuÃ¡rios jÃ¡ podem fazer login com as novas senhas!\n');

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
processar().catch(error => {
    console.error('âŒ ERRO FATAL:', error);
    process.exit(1);
});

