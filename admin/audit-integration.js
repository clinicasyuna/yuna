/**
 * INTEGRAÇÕES DE AUDITORIA PARA ADMIN-PANEL.JS
 * 
 * Este arquivo contém as funções que devem ser adicionadas/modificadas
 * no admin-panel.js para integrar o sistema de auditoria.
 * 
 * INSTRUÇÕES:
 * 1. Adicionar as chamadas de auditoria nos pontos indicados
 * 2. Todas as funções já estão prontas, basta copiar e colar
 * 3. Testar cada integração individualmente
 */

// ============================================================================
// INTEGRAÇÃO 1: LOGIN (Adicionar após linha 2142)
// ============================================================================

// ADICIONAR APÓS: const userCredential = await window.auth.signInWithEmailAndPassword(email, senha);

/*
// Registrar login bem-sucedido
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'login',
        resource: 'dashboard',
        success: true
    });
}

// Iniciar sistema de presença
if (typeof window.inicializarSistemaPresenca === 'function') {
    window.inicializarSistemaPresenca();
}
*/

// ============================================================================
// INTEGRAÇÃO 2: LOGOUT (Adicionar nas funções de logout - linhas 831, 873, 1174, 2004, 2721, 12519)
// ============================================================================

// ADICIONAR ANTES DE: await window.auth.signOut();

/*
// Calcular tempo de sessão
const tempoSessao = window.currentSessionId ? 
    Math.floor((Date.now() - parseInt(window.currentSessionId.split('_')[1])) / 1000) : 0;

// Registrar logout
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'logout',
        resource: 'dashboard',
        success: true,
        details: { tempoSessao: tempoSessao }
    });
}

// Parar sistema de presença
if (typeof window.pararSistemaPresenca === 'function') {
    window.pararSistemaPresenca();
}
*/

// ============================================================================
// INTEGRAÇÃO 3: CRIAR SOLICITAÇÃO (Buscar função criarSolicitacao ou similar)
// ============================================================================

// ADICIONAR APÓS criar solicitação no Firestore

/*
// Registrar criação
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'create',
        resource: 'solicitacoes',
        resourceId: docRef.id,
        success: true,
        details: {
            after: { tipo, prioridade, status: 'pendente' }
        }
    });
}
*/

// ============================================================================
// INTEGRAÇÃO 4: ATUALIZAR SOLICITAÇÃO (Buscar função atualizarSolicitacao ou similar)
// ============================================================================

// ADICIONAR ANTES de atualizar no Firestore

/*
// Buscar estado anterior
const before = await db.collection('solicitacoes').doc(solicitacaoId).get();
const beforeData = before.data();
*/

// ADICIONAR APÓS atualizar no Firestore

/*
// Identificar campos alterados
const changes = Object.keys(dadosAtualizados);

// Registrar atualização
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'update',
        resource: 'solicitacoes',
        resourceId: solicitacaoId,
        success: true,
        details: {
            before: beforeData,
            after: dadosAtualizados,
            changes: changes
        }
    });
}
*/

// ============================================================================
// INTEGRAÇÃO 5: DELETAR SOLICITAÇÃO (Buscar função deletarSolicitacao ou similar)
// ============================================================================

// ADICIONAR ANTES de deletar do Firestore

/*
// Buscar dados antes de deletar
const solicitacaoDoc = await db.collection('solicitacoes').doc(solicitacaoId).get();
const solicitacaoData = solicitacaoDoc.data();
*/

// ADICIONAR APÓS deletar do Firestore

/*
// Registrar deleção
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'delete',
        resource: 'solicitacoes',
        resourceId: solicitacaoId,
        success: true,
        details: {
            before: solicitacaoData
        }
    });
}
*/

// ============================================================================
// INTEGRAÇÃO 6: CRIAR USUÁRIO (Buscar função criarUsuario ou similar)
// ============================================================================

// ADICIONAR APÓS criar usuário no Firestore

/*
// Registrar criação de usuário
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'create',
        resource: tipoUsuario, // 'usuarios_admin', 'usuarios_equipe', 'usuarios_acompanhantes'
        resourceId: user.uid,
        success: true,
        details: {
            after: { email, role, ativo: true }
        }
    });
}
*/

// ============================================================================
// INTEGRAÇÃO 7: DELETAR USUÁRIO (Buscar função deletarUsuario ou similar)
// ============================================================================

// ADICIONAR ANTES de deletar do Firestore

/*
// Buscar dados do usuário antes de deletar
const userDoc = await db.collection(colecao).doc(userId).get();
const userData = userDoc.data();
*/

// ADICIONAR APÓS deletar do Firestore

/*
// Registrar deleção de usuário
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'delete',
        resource: colecao, // 'usuarios_admin', 'usuarios_equipe', 'usuarios_acompanhantes'
        resourceId: userId,
        success: true,
        details: {
            before: userData
        }
    });
}
*/

// ============================================================================
// INTEGRAÇÃO 8: EXPORTAR RELATÓRIOS (Buscar função exportarExcel ou similar)
// ============================================================================

// ADICIONAR APÓS exportação bem-sucedida

/*
// Registrar exportação
if (typeof window.registrarAcaoAuditoria === 'function') {
    window.registrarAcaoAuditoria({
        action: 'export',
        resource: 'relatorios',
        success: true,
        details: {
            tipoRelatorio: 'solicitacoes', // ou 'usuarios', 'dashboard', etc.
            quantidadeRegistros: dados.length
        }
    });
}
*/

// ============================================================================
// NOVA FUNÇÃO: ABRIR SEÇÃO DE LOGS E AUDITORIA
// ============================================================================

/**
 * Abre a seção de Logs e Auditoria
 */
function abrirLogsAuditoria() {
    console.log('🎯 [LOGS] ===== ABRINDO SEÇÃO DE LOGS E AUDITORIA =====');
    
    try {
        // Ocultar TODAS as seções EXCETO logs-auditoria-section
        console.log('[LOGS] Ocultando seções existentes...');
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.style.display = 'none';
        });
        document.querySelectorAll('[id$="-section"]').forEach(section => {
            if (section.id !== 'logs-auditoria-section') {
                section.classList.add('hidden');
                section.style.display = 'none !important';
            }
        });
        
        // Força ocultar explicitamente relatorios-section para garantir
        const relatoriosSection = document.getElementById('relatorios-section');
        if (relatoriosSection) {
            relatoriosSection.classList.add('hidden');
            relatoriosSection.setAttribute('style', 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; border: none !important;');
            console.log('[LOGS] ✅ relatorios-section ocultada com force-hide');
            
            // MutationObserver para reforçar ocultação caso algo tente reexibir
            const observer = new MutationObserver(() => {
                const currentStyle = relatoriosSection.getAttribute('style');
                if (!currentStyle || !currentStyle.includes('display: none')) {
                    relatoriosSection.setAttribute('style', 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; border: none !important;');
                    relatoriosSection.classList.add('hidden');
                    console.log('[LOGS] 🔒 relatorios-section reforçada ocultada (MutationObserver)');
                }
            });
            
            observer.observe(relatoriosSection, {
                attributes: true,
                attributeFilter: ['style', 'class'],
                attributeOldValue: true
            });
            
            // Armazenar observer para limpeza depois
            window.relatoriosSectionObserver = observer;
        }
        
        // Flag para indicar modo logs
        window.MODO_LOGS_ATIVO = true;
        
        // Ocultar teams-grid e stats-grid
        console.log('[LOGS] Ocultando teams-grid e stats-grid...');
        const teamsGrid = document.querySelector('.teams-grid');
        const statsGrid = document.querySelector('.stats-grid');
        if (teamsGrid) {
            teamsGrid.classList.add('hidden');
            teamsGrid.style.display = 'none';
        }
        if (statsGrid) {
            statsGrid.classList.add('hidden');
            statsGrid.style.display = 'none';
        }
        
        // Mostrar seção de logs
        console.log('[LOGS] Buscando seção logs-auditoria-section...');
        const logsSection = document.getElementById('logs-auditoria-section');
        
        if (!logsSection) {
            console.error('❌ [LOGS] Seção logs-auditoria-section NÃO ENCONTRADA!');
            if (typeof showToast === 'function') {
                showToast('Erro', 'Seção de logs não encontrada. Recarregue a página.', 'error');
            } else {
                alert('Erro: Seção de logs não encontrada. Recarregue a página.');
            }
            return;
        }
        
        console.log('✅ [LOGS] Seção encontrada! Exibindo...');
        logsSection.classList.remove('hidden');
        logsSection.classList.add('force-show');
        logsSection.style.display = 'block !important';
        logsSection.style.visibility = 'visible';
        logsSection.style.opacity = '1';
        logsSection.style.position = 'fixed';
        logsSection.style.top = '0';
        logsSection.style.left = '0';
        logsSection.style.right = '0';
        logsSection.style.bottom = '0';
        logsSection.style.width = '100vw';
        logsSection.style.height = '100vh';
        logsSection.style.zIndex = '2147483647';
        logsSection.style.overflow = 'auto';
        logsSection.style.padding = '24px 16px';
        logsSection.style.background = '#f8fafc';
        logsSection.style.pointerEvents = 'auto';

        // Desbloquear possíveis ancestrais escondidos
        let parent = logsSection.parentElement;
        while (parent) {
            if (parent.classList && parent.classList.contains('hidden')) {
                parent.classList.remove('hidden');
                parent.style.display = 'block';
                parent.style.visibility = 'visible';
                parent.style.opacity = '1';
                parent.style.maxHeight = 'none';
                parent.style.height = 'auto';
            }
            parent = parent.parentElement;
        }

        // Garantir que body/html possam rolar até a seção
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';

        // Garantir que o usuário veja a seção imediatamente
        if (typeof logsSection.scrollIntoView === 'function') {
            logsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: logsSection.offsetTop || 0, behavior: 'smooth' });
        }

        // 🔑 REMOVER CLASSE .hidden DE TODOS OS CARDS DENTRO DE LOGS
        console.log('[LOGS] 🔑 Removendo classe .hidden dos cards...');
        const cardsWithHidden = logsSection.querySelectorAll('.card.hidden, .card');
        cardsWithHidden.forEach(card => {
            card.classList.remove('hidden');
            
            // 💣 REMOVE ATRIBUTOS INLINE CONFLITANTES
            card.removeAttribute('style'); // Limpa qualquer inline style anterior
            
            // 🔥🔥🔥 FORÇA NUCLEAR - setProperty com !important
            card.style.setProperty('display', 'block', 'important');
            card.style.setProperty('visibility', 'visible', 'important');
            card.style.setProperty('opacity', '1', 'important');
            card.style.setProperty('max-height', 'none', 'important');
            card.style.setProperty('min-height', '200px', 'important');
            card.style.setProperty('height', 'auto', 'important');
            card.style.setProperty('overflow', 'visible', 'important');
            card.style.setProperty('position', 'static', 'important'); // MUDADO PARA STATIC (no fluxo)
            card.style.setProperty('margin-bottom', '2rem', 'important');
            card.style.setProperty('width', '100%', 'important'); // GARANTIR LARGURA
            card.style.setProperty('z-index', 'auto', 'important'); // REMOVER Z-INDEX FIXO
            
            // FORÇA EXPANSÃO DOS FILHOS
            Array.from(card.children).forEach(child => {
                child.style.setProperty('position', 'static', 'important'); 
                child.style.setProperty('display', 'block', 'important');
                child.style.setProperty('visibility', 'visible', 'important');
                child.style.setProperty('min-height', '20px', 'important'); // Filhos com altura mínima
            });
            
            console.log('[LOGS] ✅ Card desbloqueado:', card.id || card.className);
        });
        
        // 🔄 REASSERÇÃO CONTÍNUA (previne outros scripts de sobrescrever)
        setTimeout(() => {
            cardsWithHidden.forEach(card => {
                card.style.setProperty('position', 'static', 'important');
                card.style.setProperty('display', 'block', 'important');
                card.style.setProperty('min-height', '200px', 'important');
            });
            console.log('[LOGS] 🔄 Estilos reassertados após 100ms');
        }, 100);
        
        // Também desbloquear container interno se existir
        const logsAlertasContainer = document.getElementById('alertas-seguranca-container');
        if (logsAlertasContainer && logsAlertasContainer.classList.contains('hidden')) {
            logsAlertasContainer.classList.remove('hidden');
            logsAlertasContainer.style.display = 'block';
            logsAlertasContainer.style.visibility = 'visible';
            console.log('[LOGS] ✅ Alertas container desbloqueado');
        }

        // BANNER de fallback visível para validar renderização
        let banner = document.getElementById('logs-visibility-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'logs-visibility-banner';
            banner.innerText = 'Seção de Logs e Auditoria ativa (banner de verificação)';
            banner.style.position = 'fixed';
            banner.style.top = '10px';
            banner.style.left = '10px';
            banner.style.zIndex = '2147483647';
            banner.style.background = '#f59e0b';
            banner.style.color = '#111827';
            banner.style.padding = '12px 16px';
            banner.style.border = '2px solid #b45309';
            banner.style.borderRadius = '8px';
            banner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
            banner.style.fontWeight = '700';
            banner.style.pointerEvents = 'none';
            document.body.appendChild(banner);
        }
        
        // DEBUG: Verificar estilos aplicados com bounding box
        const cs = window.getComputedStyle(logsSection);
        const rect = logsSection.getBoundingClientRect();
        console.log('[DEBUG] 🔍 Estilos computados após aplicação:', {
            display: cs.display,
            visibility: cs.visibility,
            opacity: cs.opacity,
            position: cs.position,
            zIndex: cs.zIndex,
            width: cs.width,
            height: cs.height,
            padding: cs.padding,
            top: rect.top,
            left: rect.left,
            clientHeight: logsSection.clientHeight,
            scrollHeight: logsSection.scrollHeight,
            classList: Array.from(logsSection.classList).join(', ')
        });
        
        // Iniciar monitoramento de usuários online
        console.log('[LOGS] Iniciando monitoramento de usuários online...');
        iniciarMonitoramentoUsuariosOnline();
        
        // Buscar alertas de segurança
        console.log('[LOGS] Buscando alertas de segurança...');
        buscarAlertasSeguranca();
        
        // Preencher filtro de usuários
        console.log('[LOGS] Preenchendo filtro de usuários...');
        preencherFiltroUsuarios();
        
        // Carregar histórico de logs
        console.log('[LOGS] Carregando histórico de ações...');
        carregarHistoricoLogs();
        
        // Registrar visualização
        if (typeof window.registrarAcaoAuditoria === 'function') {
            console.log('[LOGS] Registrando visualização em auditoria...');
            window.registrarAcaoAuditoria({
                action: 'view',
                resource: 'audit_logs',
                success: true,
                details: { tipo: 'logs_auditoria' }
            });
        }
        
        console.log('✅ [LOGS] Seção de Logs e Auditoria aberta com sucesso!');
        
    } catch (error) {
        console.error('❌ [LOGS] Erro ao abrir seção de logs:', error);
        if (typeof showToast === 'function') {
            showToast('Erro', 'Erro ao abrir logs: ' + error.message, 'error');
        } else {
            alert('Erro ao abrir logs: ' + error.message);
        }
    }
}

/**
 * Inicia monitoramento de usuários online em tempo real
 */
function iniciarMonitoramentoUsuariosOnline() {
    console.log('[LOGS-DEBUG] Iniciando monitoramento de usuários online...');
    
    if (typeof window.monitorarUsuariosOnline !== 'function') {
        console.error('[LOGS] Função monitorarUsuariosOnline não encontrada');
        // Mostrar dado de exemplo/fallback
        exibirUsuariosOnlineExemplo();
        return;
    }
    
    window.monitorarUsuariosOnline((usuariosOnline) => {
        console.log('[LOGS-DEBUG] Usuários online recebidos:', usuariosOnline.length, usuariosOnline);
        
        const countEl = document.getElementById('usuarios-online-count');
        const listaEl = document.getElementById('usuarios-online-lista');
        
        if (countEl) countEl.textContent = usuariosOnline.length;
        
        if (listaEl) {
            listaEl.innerHTML = '';
            
            if (usuariosOnline.length === 0) {
                console.log('[LOGS-DEBUG] Nenhum usuário online, exibindo mensagem');
                listaEl.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">Nenhum usuário online no momento</p>';
                return;
            }
            
            usuariosOnline.forEach(usuario => {
                const statusColor = {
                    'online': '#10b981',
                    'idle': '#f59e0b',
                    'offline': '#6b7280'
                }[usuario.status] || '#6b7280';
                
                const roleIcon = {
                    'super_admin': '👑',
                    'admin': '🛡️',
                    'equipe': '👷',
                    'acompanhante': '👤',
                    'desconhecido': '❓'
                }[usuario.role] || '❓';
                
                const card = document.createElement('div');
                card.style.cssText = `
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    background: white;
                `;
                
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${statusColor};"></div>
                        <div>
                            <div style="font-weight: 600; color: #1f2937;">${roleIcon} ${usuario.email}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">${usuario.role}</div>
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                        📄 ${usuario.page || 'Página desconhecida'}<br>
                        ⏱️ ${window.formatarTempoSessao ? window.formatarTempoSessao(usuario.tempoSessao) : usuario.tempoSessao + 's'}
                    </div>
                `;
                
                listaEl.appendChild(card);
            });
        }
    });
}

/**
 * Busca e exibe alertas de segurança
 */
async function buscarAlertasSeguranca() {
    if (typeof window.detectarAtividadesSuspeitas !== 'function') {
        console.error('[LOGS] Função detectarAtividadesSuspeitas não encontrada');
        return;
    }
    
    const alertas = await window.detectarAtividadesSuspeitas();
    
    const containerEl = document.getElementById('alertas-seguranca-container');
    const listaEl = document.getElementById('alertas-seguranca-lista');
    
    if (alertas.length === 0) {
        if (containerEl) containerEl.style.display = 'none';
        return;
    }
    
    if (containerEl) containerEl.style.display = 'block';
    
    if (listaEl) {
        listaEl.innerHTML = alertas.map(alerta => {
            const corSeveridade = {
                'alta': '#ef4444',
                'media': '#f59e0b',
                'baixa': '#3b82f6'
            }[alerta.severidade] || '#6b7280';
            
            const iconeSeveridade = {
                'alta': '🚨',
                'media': '⚠️',
                'baixa': 'ℹ️'
            }[alerta.severidade] || '📌';
            
            return `
                <div style="padding: 1rem; border-left: 4px solid ${corSeveridade}; background: #fef2f2; border-radius: 0.375rem; margin-bottom: 0.75rem;">
                    <div style="font-weight: 600; color: #991b1b; margin-bottom: 0.5rem;">
                        ${iconeSeveridade} ${alerta.tipo.replace(/_/g, ' ')}
                    </div>
                    <div style="font-size: 0.875rem; color: #7f1d1d;">
                        <strong>Usuário:</strong> ${alerta.userEmail || alerta.userId}<br>
                        <strong>Detalhes:</strong> ${alerta.detalhes}<br>
                        <strong>Quando:</strong> ${alerta.timestamp.toLocaleString('pt-BR')}
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * Preenche filtro de usuários com todos os usuários do sistema
 */
async function preencherFiltroUsuarios() {
    const selectEl = document.getElementById('filtro-usuario');
    if (!selectEl) return;
    
    try {
        const usuarios = [];
        
        // Buscar de todas as coleções
        const colecoes = ['usuarios_admin', 'usuarios_equipe', 'usuarios_acompanhantes'];
        
        for (const colecao of colecoes) {
            const snapshot = await firebase.firestore().collection(colecao).get();
            snapshot.forEach(doc => {
                const data = doc.data();
                usuarios.push({
                    uid: doc.id,
                    email: data.email,
                    role: data.role || colecao.replace('usuarios_', '')
                });
            });
        }
        
        // Ordenar por email
        usuarios.sort((a, b) => a.email.localeCompare(b.email));
        
        // Preencher select
        selectEl.innerHTML = '<option value="">Todos os usuários</option>';
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.uid;
            option.textContent = `${usuario.email} (${usuario.role})`;
            selectEl.appendChild(option);
        });
        
    } catch (error) {
        console.error('[LOGS] Erro ao preencher filtro de usuários:', error);
    }
}

/**
 * Busca logs com os filtros aplicados
 */
async function buscarLogsComFiltros() {
    if (typeof window.buscarLogsAuditoria !== 'function') {
        console.error('[LOGS] Função buscarLogsAuditoria não encontrada');
        return;
    }
    
    const filtros = {
        userId: document.getElementById('filtro-usuario')?.value || undefined,
        action: document.getElementById('filtro-acao')?.value || undefined,
        resource: document.getElementById('filtro-recurso')?.value || undefined,
        limite: 200
    };
    
    // Data início
    const dataInicio = document.getElementById('filtro-data-inicio')?.value;
    if (dataInicio) {
        filtros.dataInicio = firebase.firestore.Timestamp.fromDate(new Date(dataInicio));
    }
    
    // Data fim
    const dataFim = document.getElementById('filtro-data-fim')?.value;
    if (dataFim) {
        const dataFimDate = new Date(dataFim);
        dataFimDate.setHours(23, 59, 59, 999);
        filtros.dataFim = firebase.firestore.Timestamp.fromDate(dataFimDate);
    }
    
    console.log('[LOGS] Buscando logs com filtros:', filtros);
    
    const logs = await window.buscarLogsAuditoria(filtros);
    
    preencherTabelaLogs(logs);
}

/**
 * Preenche tabela com os logs
 */
function preencherTabelaLogs(logs) {
    const tbodyEl = document.getElementById('logs-tbody');
    if (!tbodyEl) return;
    
    if (logs.length === 0) {
        tbodyEl.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhum log encontrado com os filtros aplicados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbodyEl.innerHTML = logs.map(log => {
        const actionIcons = {
            'login': '🔐',
            'logout': '🚪',
            'create': '➕',
            'update': '✏️',
            'delete': '🗑️',
            'view': '👁️',
            'export': '📤'
        };
        
        const statusIcon = log.metadata?.success !== false ? '✅' : '❌';
        const statusColor = log.metadata?.success !== false ? '#10b981' : '#ef4444';
        
        const detalhes = [];
        if (log.resourceId) detalhes.push(`ID: ${log.resourceId.substring(0, 8)}...`);
        if (log.details?.changes?.length) detalhes.push(`Campos: ${log.details.changes.join(', ')}`);
        if (log.metadata?.error) detalhes.push(`Erro: ${log.metadata.error}`);
        
        return `
            <tr>
                <td style="white-space: nowrap;">${log.timestamp.toLocaleString('pt-BR')}</td>
                <td>${log.userEmail}</td>
                <td><span style="background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">${log.userRole}</span></td>
                <td>${actionIcons[log.action] || '📌'} ${log.action}</td>
                <td>${log.resource}</td>
                <td style="font-size: 0.875rem;">${detalhes.join('<br>') || '-'}</td>
                <td style="text-align: center;"><span style="font-size: 1.25rem;">${statusIcon}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Limpa filtros de busca
 */
function limparFiltrosLogs() {
    document.getElementById('filtro-usuario').value = '';
    document.getElementById('filtro-acao').value = '';
    document.getElementById('filtro-recurso').value = '';
    document.getElementById('filtro-data-inicio').value = '';
    document.getElementById('filtro-data-fim').value = '';
    
    document.getElementById('logs-tbody').innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Use os filtros acima para buscar logs</p>
            </td>
        </tr>
    `;
}

/**
 * Exporta logs para Excel
 */
async function exportarLogsExcel() {
    // Buscar logs atuais
    await buscarLogsComFiltros();
    
    // Implementar exportação com XLSX.js (já está carregado no admin)
    const logs = []; // Pegar logs da tabela
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;
    
    // ... implementar exportação
    showToast('Info', 'Funcionalidade de exportação será implementada em breve', 'info');
}

/**
 * Carrega histórico de logs/auditoria do Firestore
 */
async function carregarHistoricoLogs() {
    console.log('[LOGS-DEBUG] Carregando histórico de logs...');
    const tbody = document.getElementById('logs-tbody');
    
    if (!tbody) return;
    
    try {
        // Buscar últimos 50 logs da coleção audit_logs
        const logsRef = firebase.firestore().collection('audit_logs');
        const snapshot = await logsRef.orderBy('timestamp', 'desc').limit(50).get();
        
        console.log('[LOGS-DEBUG] Logs encontrados:', snapshot.size);
        
        if (snapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
                        <p>Nenhum log disponível ainda</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const log = doc.data();
            console.log('[AUDIT] 📝 Estrutura do log:', log); // DEBUG
            const timestamp = log.timestamp?.toDate() || new Date();
            const dataFormatada = timestamp.toLocaleDateString('pt-BR') + ' ' + timestamp.toLocaleTimeString('pt-BR');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${log.userEmail || log.userId || '-'}</td>
                <td><span style="background: #e0e7ff; color: #4c1d95; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem;">${log.userRole || '-'}</span></td>
                <td><strong>${log.action || '-'}</strong></td>
                <td>${log.resource || '-'}</td>
                <td style="font-size: 0.875rem; color: #6b7280; max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                    ${log.metadata?.details || log.details || '-'}
                </td>
                <td>
                    <span style="background: ${log.metadata?.success === false ? '#fee2e2' : '#dcfce7'}; color: ${log.metadata?.success === false ? '#991b1b' : '#166534'}; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem;">
                        ${log.metadata?.success === false ? 'Erro' : 'Sucesso'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // 🔥 FORÇAR VISIBILIDADE DA TABELA E CONTAINERS PAIS
        console.log('[LOGS-DEBUG] 🔥 Forçando visibilidade da tabela e containers...');
        const tabela = document.getElementById('logs-tabela');
        const tabelaContainer = document.getElementById('logs-tabela-container');
        const cardPai = tbody.closest('.card');
        
        if (tabela) {
            tabela.style.display = 'table';
            tabela.style.visibility = 'visible';
            tabela.style.opacity = '1';
            console.log('[LOGS-DEBUG] ✅ Tabela forçada visível');
        }
        
        if (tabelaContainer) {
            tabelaContainer.style.display = 'block';
            tabelaContainer.style.visibility = 'visible';
            tabelaContainer.style.opacity = '1';
            tabelaContainer.style.height = 'auto';
            tabelaContainer.style.overflow = 'auto';
            console.log('[LOGS-DEBUG] ✅ Container da tabela forçado visível');
        }
        
        if (cardPai) {
            cardPai.classList.remove('hidden');
            cardPai.style.display = 'block';
            cardPai.style.visibility = 'visible';
            cardPai.style.opacity = '1';
            cardPai.style.height = 'auto';
            cardPai.style.maxHeight = 'none';
            console.log('[LOGS-DEBUG] ✅ Card pai da tabela forçado visível');
        }
        
        console.log('[LOGS-DEBUG] ✅ Tabela renderizada com', snapshot.size, 'linhas');
        
    } catch (error) {
        console.error('[LOGS] Erro ao carregar histórico de logs:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">
                    <p>Erro ao carregar logs: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

/**
 * Exibe dados de exemplo quando monitoramento não está disponível
 */
function exibirUsuariosOnlineExemplo() {
    console.log('[LOGS-DEBUG] Exibindo usuários online de exemplo (fallback)');
    const countEl = document.getElementById('usuarios-online-count');
    const listaEl = document.getElementById('usuarios-online-lista');
    
    if (countEl) countEl.textContent = '1';
    
    if (listaEl) {
        listaEl.innerHTML = `
            <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; background: white;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
                    <div>
                        <div style="font-weight: 600; color: #1f2937;">👑 ${window.currentUser?.email || 'usuario@admin.com'}</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">super_admin</div>
                    </div>
                </div>
                <div style="font-size: 0.875rem; color: #6b7280;">
                    📄 /admin/<br>
                    ⏱️ Agora
                </div>
            </div>
        `;
    }
}

/**
 * Gera relatório de auditoria em HTML/Excel
 * Substitui gerarRelatorioAdmin() para mostrar logs de auditoria
 */
async function gerarRelatorioAuditoria() {
    try {
        console.log('[AUDIT-REPORT] Iniciando geração de relatório de auditoria...');
        
        if (!window.db) {
            if (typeof showToast === 'function') {
                showToast('Erro', 'Firestore não inicializado!', 'error');
            }
            return;
        }

        // Mostrar loading
        if (typeof showToast === 'function') {
            showToast('Gerando...', 'Coletando dados de auditoria...', 'info');
        }

        // Buscar logs de auditoria
        const snapshot = await window.db.collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(500)
            .get();

        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
        }));

        console.log(`[AUDIT-REPORT] ${logs.length} registros de auditoria encontrados`);

        if (logs.length === 0) {
            if (typeof showToast === 'function') {
                showToast('Aviso', 'Nenhum registro de auditoria encontrado', 'warning');
            }
            return;
        }

        // Gerar relatório HTML
        gerarRelatorioAuditoriaHTML(logs);

        if (typeof showToast === 'function') {
            showToast('Sucesso', 'Relatório de auditoria gerado com sucesso!', 'success');
        }

    } catch (error) {
        console.error('[AUDIT-REPORT] Erro ao gerar relatório:', error);
        if (typeof showToast === 'function') {
            showToast('Erro', `Falha ao gerar relatório: ${error.message}`, 'error');
        }
    }
}

/**
 * Gera HTML do relatório de auditoria
 */
function gerarRelatorioAuditoriaHTML(logs) {
    const agora = new Date();
    const dataRelatorio = agora.toLocaleDateString('pt-BR');
    const horaRelatorio = agora.toLocaleTimeString('pt-BR');

    // Agrupar logs por usuário
    const logsPorUsuario = {};
    const acoesPorTipo = {};
    const acoesPorRecurso = {};

    logs.forEach(log => {
        const user = log.userEmail || 'Desconhecido';
        const action = log.action || 'N/A';
        const resource = log.resource || 'N/A';

        if (!logsPorUsuario[user]) logsPorUsuario[user] = 0;
        if (!acoesPorTipo[action]) acoesPorTipo[action] = 0;
        if (!acoesPorRecurso[resource]) acoesPorRecurso[resource] = 0;

        logsPorUsuario[user]++;
        acoesPorTipo[action]++;
        acoesPorRecurso[resource]++;
    });

    // Criar HTML do relatório
    const htmlRelatorio = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relatório de Auditoria - Yuna Solicite</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #f5f5f5;
                    padding: 20px;
                }
                .relatorio-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    padding: 30px;
                }
                .header {
                    border-bottom: 3px solid #3b82f6;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #1f2937;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .header-info {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 15px;
                    font-size: 14px;
                    color: #666;
                }
                .info-item {
                    background: #f9fafb;
                    padding: 10px;
                    border-radius: 4px;
                }
                .info-label { font-weight: 600; color: #374151; }
                .section {
                    margin-bottom: 40px;
                }
                .section h2 {
                    color: #1f2937;
                    font-size: 18px;
                    margin-bottom: 15px;
                    border-left: 4px solid #3b82f6;
                    padding-left: 10px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .stat-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-card h3 { font-size: 32px; margin-bottom: 5px; }
                .stat-card p { font-size: 12px; opacity: 0.9; }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                .table th {
                    background: #f3f4f6;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 2px solid #e5e7eb;
                }
                .table td {
                    padding: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .table tr:hover { background: #f9fafb; }
                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .badge-success { background: #d1fae5; color: #065f46; }
                .badge-danger { background: #fee2e2; color: #991b1b; }
                .badge-warning { background: #fef3c7; color: #92400e; }
                .badge-info { background: #dbeafe; color: #0c4a6e; }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                }
                @media print {
                    body { background: white; }
                    .relatorio-container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="relatorio-container">
                <div class="header">
                    <h1>📊 Relatório de Auditoria - Yuna Solicite</h1>
                    <div class="header-info">
                        <div class="info-item">
                            <div class="info-label">Data do Relatório:</div>
                            <div>${dataRelatorio} às ${horaRelatorio}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Total de Registros:</div>
                            <div>${logs.length}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Usuários Rastreados:</div>
                            <div>${Object.keys(logsPorUsuario).length}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>📈 Resumo de Atividades</h2>
                    <div class="stats-grid">
                        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h3>${logs.length}</h3>
                            <p>Total de Ações</p>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <h3>${Object.keys(logsPorUsuario).length}</h3>
                            <p>Usuários Ativos</p>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <h3>${Object.keys(acoesPorTipo).length}</h3>
                            <p>Tipos de Ações</p>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                            <h3>${Object.keys(acoesPorRecurso).length}</h3>
                            <p>Recursos</p>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>👤 Ações por Usuário</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Total de Ações</th>
                                <th>Percentual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(logsPorUsuario)
                                .sort(([, a], [, b]) => b - a)
                                .map(([user, count]) => `
                                    <tr>
                                        <td>${user}</td>
                                        <td><strong>${count}</strong></td>
                                        <td>${((count / logs.length) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>🎯 Ações por Tipo</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Tipo de Ação</th>
                                <th>Quantidade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(acoesPorTipo)
                                .sort(([, a], [, b]) => b - a)
                                .map(([action, count]) => {
                                    let badgeClass = 'badge-info';
                                    if (action === 'delete') badgeClass = 'badge-danger';
                                    if (action === 'update') badgeClass = 'badge-warning';
                                    if (action === 'create' || action === 'login') badgeClass = 'badge-success';
                                    return `
                                        <tr>
                                            <td><span class="badge ${badgeClass}">${action.toUpperCase()}</span></td>
                                            <td><strong>${count}</strong></td>
                                            <td>${((count / logs.length) * 100).toFixed(1)}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>📑 Últimas Ações Registradas</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Usuário</th>
                                <th>Ação</th>
                                <th>Recurso</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.slice(0, 50).map(log => `
                                <tr>
                                    <td>${log.timestamp?.toLocaleString?.('pt-BR') || new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                    <td>${log.userEmail || 'N/A'}</td>
                                    <td><span class="badge badge-info">${log.action || 'N/A'}</span></td>
                                    <td>${log.resource || 'N/A'}</td>
                                    <td>
                                        ${log.metadata?.success === false ? 
                                            '<span class="badge badge-danger">ERRO</span>' :
                                            '<span class="badge badge-success">OK</span>'
                                        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${logs.length > 50 ? `<p style="margin-top: 10px; color: #666; font-size: 12px;">Mostrando 50 de ${logs.length} registros</p>` : ''}
                </div>

                <div class="footer">
                    <p>Relatório gerado automaticamente pelo Sistema Yuna Solicite</p>
                    <p>© 2026 Clínicas YUNA - Todos os direitos reservados</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Abrir em nova janela/tab para impressão
    const win = window.open('', 'Relatório de Auditoria', 'width=1200,height=800');
    win.document.write(htmlRelatorio);
    win.document.close();

    console.log('[AUDIT-REPORT] Relatório gerado e aberto em nova janela');
}

/**
 * Fecha a seção de Logs e Auditoria e volta ao painel principal
 */
function fecharLogsAuditoria() {
    try {
        console.log('🔽 [LOGS] Fechando seção de Logs e Auditoria...');
        
        // Limpar MutationObserver do relatorios-section
        if (window.relatoriosSectionObserver) {
            window.relatoriosSectionObserver.disconnect();
            window.relatoriosSectionObserver = null;
            console.log('[LOGS] ✅ MutationObserver removido');
        }
        
        // Limpar flag de modo logs
        window.MODO_LOGS_ATIVO = false;
        
        // 1. Remover banner de verificação
        const banner = document.getElementById('logs-visibility-banner');
        if (banner) {
            banner.remove();
            console.log('[LOGS] ✅ Banner removido');
        }
        
        // 2. Ocultar seção de logs
        const logsSection = document.getElementById('logs-auditoria-section');
        if (logsSection) {
            logsSection.classList.add('hidden');
            logsSection.style.display = 'none';
            console.log('[LOGS] ✅ Seção ocultada');
        }
        
        // 3. Mostrar painel principal (teams-grid e stats-grid)
        const teamsGrid = document.getElementById('teams-grid');
        const statsGrid = document.getElementById('stats-grid');
        
        if (teamsGrid) {
            teamsGrid.classList.remove('hidden');
            teamsGrid.style.display = '';
            console.log('[LOGS] ✅ Teams-grid exibida');
        }
        
        if (statsGrid) {
            statsGrid.classList.remove('hidden');
            statsGrid.style.display = '';
            console.log('[LOGS] ✅ Stats-grid exibida');
        }
        
        // 4. Voltar ao topo da página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅ [LOGS] Seção fechada com sucesso, voltando ao painel principal');
        
        // 5. Opcional: recarregar solicitações para atualizar cards
        if (typeof window.carregarSolicitacoes === 'function') {
            console.log('[LOGS] Recarregando solicitações...');
            window.carregarSolicitacoes();
        }
        
    } catch (error) {
        console.error('❌ [LOGS] Erro ao fechar seção:', error);
    }
}

// Expor funções globalmente
window.abrirLogsAuditoria = abrirLogsAuditoria;
window.fecharLogsAuditoria = fecharLogsAuditoria;
window.iniciarMonitoramentoUsuariosOnline = iniciarMonitoramentoUsuariosOnline;
window.carregarHistoricoLogs = carregarHistoricoLogs;
window.exibirUsuariosOnlineExemplo = exibirUsuariosOnlineExemplo;
window.buscarAlertasSeguranca = buscarAlertasSeguranca;
window.buscarLogsComFiltros = buscarLogsComFiltros;
window.limparFiltrosLogs = limparFiltrosLogs;
window.exportarLogsExcel = exportarLogsExcel;
window.gerarRelatorioAuditoria = gerarRelatorioAuditoria;

console.log('✅ [AUDIT-INTEGRATION] Funções de integração carregadas');
console.log('✅ [AUDIT-INTEGRATION] window.abrirLogsAuditoria disponível:', typeof window.abrirLogsAuditoria);
console.log('✅ [AUDIT-INTEGRATION] window.fecharLogsAuditoria disponível:', typeof window.fecharLogsAuditoria);
console.log('✅ [AUDIT-INTEGRATION] window.gerarRelatorioAuditoria disponível:', typeof window.gerarRelatorioAuditoria);
console.log('✅ [AUDIT-INTEGRATION] Teste no console: abrirLogsAuditoria()');

