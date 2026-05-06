#!/usr/bin/env node

/**
 * ✨ SCRIPT SIMPLIFICADO - Alteração de Senhas via Email Reset
 * 
 * Este script envia emails de reset de senha para todos os usuários
 * sem precisar do Firebase Admin SDK (mais fácil de usar!)
 * 
 * Os usuários receberão um email com link para criar nova senha
 * IMPORTANTE: Usar esta abordagem é mais segura!
 */

const https = require('https');
const querystring = require('querystring');

// Configuração do Firebase
const FIREBASE_API_KEY = 'AIzaSyAlkgNvzVqcVc1YjqWOaVqLhPUHsLCmT4Y'; // Substituir pela sua chave
const FIREBASE_REST_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1';

// ============================================
// DADOS DOS USUÁRIOS
// ============================================

const USUARIOS_PARA_RESETAR = [
    {
        email: 'manutencao.jardins@yuna.com.br',
        senha: 'Manu@123456',
        nome: 'Manutenção Jardins',
        departamento: 'manutencao'
    },
    {
        email: 'hotelaria.jardins@yuna.com.br',
        senha: 'Hotel@123456',
        nome: 'Hotelaria Jardins',
        departamento: 'hotelaria'
    },
    {
        email: 'recepcao.jardins@yuna.com.br',
        senha: 'Recep@123456',
        nome: 'Recepção Jardins',
        departamento: 'higienizacao'
    },
    {
        email: 'edinar.leao@yuna.com.br',
        senha: 'Edi@123456',
        nome: 'Edinar Leão',
        tipo: 'admin'
    },
    {
        email: 'amanda.braga@yuna.com.br',
        senha: 'Aman@123456',
        nome: 'Amanda Braga',
        tipo: 'admin'
    },
    {
        email: 'caroline.chinaglia@yuna.com.br',
        senha: 'Carol@123456',
        nome: 'Caroline Chinaglia',
        tipo: 'admin'
    }
];

// ============================================
// FUNÇÕES
// ============================================

function fazerRequisicao(metodo, url, dados) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const opcoes = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(opcoes, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (dados) {
            req.write(JSON.stringify(dados));
        }
        
        req.end();
    });
}

async function enviarResetEmail(email) {
    try {
        const url = `${FIREBASE_REST_ENDPOINT}/accounts:sendPasswordResetEmail?key=${FIREBASE_API_KEY}`;
        
        const response = await fazerRequisicao('POST', url, {
            email: email,
            requestType: 'PASSWORD_RESET'
        });

        if (response.status === 200 && response.data.email) {
            console.log(`   ✅ Email de reset enviado para: ${email}`);
            return true;
        } else {
            console.log(`   ❌ Erro ao enviar email: ${response.data.error?.message || 'erro desconhecido'}`);
            return false;
        }
    } catch (error) {
        console.error(`   ❌ ERRO: ${error.message}`);
        return false;
    }
}

// ============================================
// PROCESSO PRINCIPAL
// ============================================

async function processar() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  📧 SCRIPT DE ENVIO DE EMAILS DE RESET DE SENHA          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('ℹ️  Este script envia emails para que os usuários resetem suas senhas.');
    console.log('    Os usuários receberão um link para criar uma nova senha.\n');

    let contador = 0;
    let sucessos = 0;

    for (const usuario of USUARIOS_PARA_RESETAR) {
        contador++;
        console.log(`${contador}. 🔄 Processando: ${usuario.nome} (${usuario.email})`);
        
        const sucesso = await enviarResetEmail(usuario.email);
        if (sucesso) sucessos++;
        
        // Aguardar um pouco entre requisições para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║  ✅ PROCESSAMENTO CONCLUÍDO (${sucessos}/${contador} sucessos)      ║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📋 PRÓXIMAS ETAPAS:');
    console.log('\n1. ✉️  Verifique os emails recebidos pelos usuários');
    console.log('2. 🔗 Cada usuário deve clicar no link no email');
    console.log('3. 🔐 Criar a nova senha conforme instruções');
    console.log('4. 📝 Anotar as novas senhas em local seguro\n');

    console.log('⏱️  Lembre-se: Os links de reset expiram em 1 HORA\n');
}

// Executar
processar().catch(error => {
    console.error('❌ ERRO:', error);
    process.exit(1);
});
