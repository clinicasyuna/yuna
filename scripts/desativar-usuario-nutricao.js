#!/usr/bin/env node

/**
 * Script para desativar completamente o usuário de Nutrição
 * - Desabilita no Firebase Auth (disabled: true)
 * - Marca ativo: false no Firestore (usuarios_equipe)
 *
 * Uso: node scripts/desativar-usuario-nutricao.js
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

const EMAIL_NUTRICAO = 'nutricao.jardins@yuna.com.br';

async function desativarUsuarioNutricao() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  🚫 DESATIVAR USUÁRIO NUTRIÇÃO                            ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // 1. Desativar no Firebase Auth
    console.log(`1️⃣  Buscando usuário no Firebase Auth: ${EMAIL_NUTRICAO}`);
    let authUser = null;
    try {
        authUser = await auth.getUserByEmail(EMAIL_NUTRICAO);
        console.log(`   ✅ Usuário encontrado: UID = ${authUser.uid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log('   ⚠️  Usuário não encontrado no Firebase Auth (pode já ter sido removido)');
        } else {
            console.error('   ❌ Erro ao buscar usuário:', error.message);
        }
    }

    if (authUser) {
        try {
            await auth.updateUser(authUser.uid, { disabled: true });
            console.log(`   ✅ Usuário DESABILITADO no Firebase Auth (disabled: true)`);
        } catch (error) {
            console.error('   ❌ Erro ao desabilitar no Auth:', error.message);
        }
    }

    // 2. Marcar como inativo no Firestore (usuarios_equipe)
    console.log(`\n2️⃣  Buscando documento no Firestore (usuarios_equipe)...`);
    try {
        const snapshot = await db.collection('usuarios_equipe')
            .where('email', '==', EMAIL_NUTRICAO)
            .get();

        if (snapshot.empty) {
            console.log('   ⚠️  Nenhum documento encontrado em usuarios_equipe para esse email');
        } else {
            for (const doc of snapshot.docs) {
                await doc.ref.update({ ativo: false });
                console.log(`   ✅ Documento ${doc.id} marcado como ativo: false`);
            }
        }
    } catch (error) {
        console.error('   ❌ Erro ao atualizar Firestore:', error.message);
    }

    console.log('\n✅ Processo concluído!');
    console.log(`   O usuário "${EMAIL_NUTRICAO}" está desativado e não conseguirá mais acessar o sistema.\n`);
    process.exit(0);
}

desativarUsuarioNutricao().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
