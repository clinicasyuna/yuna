// === DIAGNÓSTICO DE STATUS - ARQUIVO INDEPENDENTE ===
// Este arquivo resolve inconsistências de status entre cards e modal

console.log('🔧 Sistema de diagnóstico de status carregado');

// Aguardar Firebase estar pronto
setTimeout(() => {
    if (window.db) {
        console.log('✅ Firebase pronto para diagnósticos');
        
        // Disponibilizar globalmente
        window.diagnosticarSolicitacao = diagnosticarSolicitacao;
        window.corrigirStatusSolicitacao = corrigirStatusSolicitacao;
        
    } else {
        console.log('⚠️ Firebase ainda não inicializado, tentando novamente...');
        setTimeout(() => {
            if (window.db) {
                window.diagnosticarSolicitacao = diagnosticarSolicitacao;
                window.corrigirStatusSolicitacao = corrigirStatusSolicitacao;
                console.log('✅ Funções de diagnóstico disponíveis');
            }
        }, 2000);
    }
}, 1000);

async function diagnosticarSolicitacao(id) {
    console.log('=== DIAGNÓSTICO DE STATUS - SOLICITAÇÃO', id, '===');
    
    if (!window.db) {
        console.error('❌ Firestore não disponível');
        return;
    }
    
    try {
        // Buscar dados atuais do Firestore
        const doc = await window.db.collection('solicitacoes').doc(id).get();
        if (doc.exists) {
            const dados = doc.data();
            console.log('📊 DADOS DO FIRESTORE:');
            console.log('   - Status:', dados.status);
            console.log('   - DataFinalizacao:', dados.dataFinalizacao);
            console.log('   - Solucao presente:', !!dados.solucao);
            console.log('   - Dados completos:', dados);
            
            // Análise de consistência
            if (dados.dataFinalizacao && dados.status !== 'finalizada') {
                console.log('⚠️ INCONSISTÊNCIA: Tem dataFinalizacao mas status não é "finalizada"');
            }
            if (dados.solucao && dados.status !== 'finalizada') {
                console.log('⚠️ INCONSISTÊNCIA: Tem solução mas status não é "finalizada"');
            }
            
            if (!dados.dataFinalizacao && !dados.solucao && dados.status === 'finalizada') {
                console.log('⚠️ INCONSISTÊNCIA: Status finalizada mas sem dataFinalizacao ou solução');
            }
            
        } else {
            console.log('❌ Documento não encontrado no Firestore');
        }
        
        // Verificar dados do card na página
        const cards = document.querySelectorAll('.solicitacao-card');
        let cardData = null;
        
        cards.forEach(card => {
            try {
                const data = JSON.parse(card.dataset.solicitacao.replace(/&apos;/g, "'"));
                if (data.id === id) {
                    cardData = data;
                }
            } catch (e) {
                console.warn('Erro ao parsear card:', e);
            }
        });
        
        if (cardData) {
            console.log('🎯 DADOS DO CARD:');
            console.log('   - Status:', cardData.status);
            console.log('   - DataFinalizacao:', cardData.dataFinalizacao);
            console.log('   - Solucao presente:', !!cardData.solucao);
            console.log('   - Dados completos:', cardData);
        } else {
            console.log('❌ Card não encontrado na página atual');
        }
        
    } catch (error) {
        console.error('❌ Erro no diagnóstico:', error);
    }
    
    console.log('=== FIM DO DIAGNÓSTICO ===');
}

async function corrigirStatusSolicitacao(id) {
    console.log('🔧 Iniciando correção de status para:', id);
    
    if (!window.db) {
        console.error('❌ Firestore não disponível');
        return;
    }
    
    try {
        const doc = await window.db.collection('solicitacoes').doc(id).get();
        if (doc.exists) {
            const dados = doc.data();
            
            // Verificar se precisa correção
            if ((dados.dataFinalizacao || dados.solucao) && dados.status !== 'finalizada') {
                await window.db.collection('solicitacoes').doc(id).update({
                    status: 'finalizada'
                });
                
                console.log('✅ Status corrigido para "finalizada" no Firestore');
                
                if (window.showToast) {
                    window.showToast('Sucesso', 'Status da solicitação corrigido!', 'success');
                }
                
                // Recarregar para atualizar interface
                setTimeout(() => {
                    console.log('🔄 Recarregando página...');
                    location.reload();
                }, 1500);
            } else {
                console.log('✅ Status já está correto');
                if (window.showToast) {
                    window.showToast('Info', 'Status já está correto', 'info');
                }
            }
        } else {
            console.log('❌ Documento não encontrado');
            if (window.showToast) {
                window.showToast('Erro', 'Solicitação não encontrada', 'error');
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao corrigir status:', error);
        if (window.showToast) {
            window.showToast('Erro', 'Erro ao corrigir status', 'error');
        }
    }
}