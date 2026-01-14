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
        // Ocultar todas as seções
        console.log('[LOGS] Ocultando seções existentes...');
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        document.querySelectorAll('[id$="-section"]').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Ocultar teams-grid (filas de atendimento) e stats-grid (métricas)
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
        
        // Aplicar styles com setAttribute para garantir máxima precedência
        logsSection.setAttribute('style', `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 2147483647 !important;
            min-height: 100vh !important;
            padding: 24px 16px !important;
            background: #f8fafc !important;
            pointer-events: auto !important;
            transform: translateY(0) !important;
            height: auto !important;
            max-height: none !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: auto !important;
            width: 100% !important;
            overflow: visible !important;
        `);
        logsSection.classList.add('force-show');

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
                resource: 'relatorios',
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

// Expor funções globalmente
window.abrirLogsAuditoria = abrirLogsAuditoria;
window.iniciarMonitoramentoUsuariosOnline = iniciarMonitoramentoUsuariosOnline;
window.carregarHistoricoLogs = carregarHistoricoLogs;
window.exibirUsuariosOnlineExemplo = exibirUsuariosOnlineExemplo;
window.buscarAlertasSeguranca = buscarAlertasSeguranca;
window.buscarLogsComFiltros = buscarLogsComFiltros;
window.limparFiltrosLogs = limparFiltrosLogs;
window.exportarLogsExcel = exportarLogsExcel;

console.log('✅ [AUDIT-INTEGRATION] Funções de integração carregadas');
console.log('✅ [AUDIT-INTEGRATION] window.abrirLogsAuditoria disponível:', typeof window.abrirLogsAuditoria);
console.log('✅ [AUDIT-INTEGRATION] Teste no console: abrirLogsAuditoria()');

