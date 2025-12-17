#!/usr/bin/env node

/**
 * ⚡ Script para Atualizar Senhas Diretamente (sem emails)
 * 
 * Para emails fictícios que não recebem mensagens,
 * este script atualiza as senhas diretamente no Firebase
 * sem tentar enviar emails.
 * 
 * REQUER: firebase-service-account.json
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

const auth = admin.auth();
const db = admin.firestore();

// ============================================
// DADOS DOS USUÁRIOS
// ============================================

const USUARIOS_EQUIPES = [
    {
        email: 'nutricao.jardins@yuna.com.br',
        senhaAtual: 'ninhuma',  // não importa, será sobrescrita
        senhaNova: 'Nuti@123456',
        nome: 'Nutricao Jardins',
        departamento: 'nutricao',
        equipe: 'nutricao',
        tipo: 'equipe'
    },
    {
        email: 'manutencao.jardins@yuna.com.br',
        senha: 'Manu@123456',
        nome: 'Manutenção Jardins',
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
        nome: 'Recepção Jardins',
        departamento: 'higienizacao',
        equipe: 'higienizacao',
        tipo: 'equipe'
    }
];

const USUARIOS_ADMIN = [
    {
        email: 'edinar.leao@yuna.com.br',
        senha: 'Edi@123456',
        nome: 'Edinar Leão',
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
// FUNÇÕES
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
            console.log(`   ❌ Usuário não encontrado: ${email}`);
            return false;
        }
        
        await auth.updateUser(uid, {
            password: novaSenha,
            emailVerified: true
        });
        
        console.log(`   ✅ Senha atualizada: ${email} → ${novaSenha}`);
        return true;
    } catch (error) {
        console.error(`   ❌ Erro ao atualizar senha: ${error.message}`);
        return false;
    }
}

// ============================================
// PROCESSO PRINCIPAL
// ============================================

async function processar() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  🔐 ATUALIZAR SENHAS DIRETAMENTE (Sem Emails)            ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const confirmacao = await new Promise(resolve => {
        process.stdout.write('⚠️  ATENÇÃO: Este script vai atualizar as senhas DIRETAMENTE.\n');
        process.stdout.write('Não serão enviados emails.\n');
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
        let sucessos = 0;
        let falhas = 0;

        // ====================================
        // EQUIPES
        // ====================================
        console.log('\n📌 ATUALIZANDO EQUIPES...\n');

        for (const equipe of USUARIOS_EQUIPES) {
            console.log(`🔄 ${equipe.nome} (${equipe.email})`);
            
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
        console.log('\n📌 ATUALIZANDO ADMINISTRADORES...\n');

        for (const admin_user of USUARIOS_ADMIN) {
            console.log(`🔄 ${admin_user.nome} (${admin_user.email})`);
            
            const resultado = await atualizarSenha(admin_user.email, admin_user.senha);
            
            if (resultado) {
                sucessos++;
            } else {
                falhas++;
            }
            
            console.log('');
        }

        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log(`║  ✅ CONCLUÍDO! (${sucessos} sucessos, ${falhas} falhas)                ║`);
        console.log('╚══════════════════════════════════════════════════════════╝\n');
        
        if (sucessos === 7 && falhas === 0) {
            console.log('🎉 TODAS AS SENHAS FORAM ATUALIZADAS COM SUCESSO!\n');
            console.log('📋 RESUMO DOS LOGINS:');
            console.log('\n🏢 EQUIPES:');
            USUARIOS_EQUIPES.forEach(u => {
                console.log(`   • ${u.nome}: ${u.email} / ${u.senha}`);
            });
            
            console.log('\n👤 ADMINISTRADORES:');
            USUARIOS_ADMIN.forEach(u => {
                console.log(`   • ${u.nome}: ${u.email} / ${u.senha}`);
            });
        } else {
            console.log(`⚠️  ${falhas} senha(s) não foi(ram) atualizada(s).`);
            console.log('   Verifique os erros acima.\n');
        }
        
        console.log('✨ Os usuários já podem fazer login com as novas senhas!\n');

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
processar().catch(error => {
    console.error('❌ ERRO FATAL:', error);
    process.exit(1);
});
