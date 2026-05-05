const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const TARGET_PROJECT_ID = 'studio-5526632052-23813';

function resolveCredentialPath() {
    const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (envPath && envPath.trim()) {
        return path.isAbsolute(envPath)
            ? envPath
            : path.resolve(process.cwd(), envPath);
    }

    const candidates = [
        path.resolve(__dirname, '../firebase-service-account.json'),
        path.resolve(__dirname, '../.secrets/firebase-service-account.json')
    ];

    const found = candidates.find((candidate) => fs.existsSync(candidate));
    return found || candidates[0];
}

function loadServiceAccount() {
    const jsonCredential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (jsonCredential && jsonCredential.trim()) {
        let serviceAccount;
        try {
            serviceAccount = JSON.parse(jsonCredential);
        } catch (error) {
            throw new Error('ERRO: FIREBASE_SERVICE_ACCOUNT_JSON nao contem JSON valido.');
        }

        if (serviceAccount.project_id !== TARGET_PROJECT_ID) {
            throw new Error(
                `ERRO: Credencial em FIREBASE_SERVICE_ACCOUNT_JSON pertence ao projeto '${serviceAccount.project_id}', mas o alvo e '${TARGET_PROJECT_ID}'.`
            );
        }

        return { serviceAccount, credentialPath: 'FIREBASE_SERVICE_ACCOUNT_JSON' };
    }

    const credentialPath = resolveCredentialPath();

    if (!fs.existsSync(credentialPath)) {
        const msg = [
            'ERRO: Credencial do Firebase Admin nao encontrada.',
            `Caminho esperado: ${credentialPath}`,
            'Defina FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON ou salve em .secrets/firebase-service-account.json'
        ].join('\n');
        throw new Error(msg);
    }

    const raw = fs.readFileSync(credentialPath, 'utf8');
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(raw);
    } catch (error) {
        throw new Error(`ERRO: JSON invalido na credencial (${credentialPath}).`);
    }

    if (serviceAccount.project_id !== TARGET_PROJECT_ID) {
        throw new Error(
            `ERRO: Credencial pertence ao projeto '${serviceAccount.project_id}', mas o alvo e '${TARGET_PROJECT_ID}'.`
        );
    }

    return { serviceAccount, credentialPath };
}

function initFirebaseAdmin() {
    if (admin.apps.length) {
        return { admin, projectId: TARGET_PROJECT_ID, reused: true };
    }

    const { serviceAccount, credentialPath } = loadServiceAccount();
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log(`[FIREBASE-ADMIN] Inicializado com chave: ${credentialPath}`);
    console.log(`[FIREBASE-ADMIN] Projeto validado: ${TARGET_PROJECT_ID}`);

    return { admin, projectId: TARGET_PROJECT_ID, reused: false };
}

module.exports = {
    admin,
    initFirebaseAdmin,
    TARGET_PROJECT_ID
};
