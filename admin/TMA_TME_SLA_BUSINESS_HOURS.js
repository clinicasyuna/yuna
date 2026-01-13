// ===== SISTEMA DE PAUSA DE TMA, TME E SLA (19:00 - 07:00) =====
// Arquivo: TMA_TME_SLA_BUSINESS_HOURS.js
// 
// Este módulo implementa pausa automática de métricas de tempo (TMA, TME, SLA)
// fora do horário de funcionamento (07:00 - 19:00)
// 
// Data: 13 de janeiro de 2026
// Autor: Sistema Yuna

/**
 * Configurações de horário de funcionamento
 * Equipes atuam apenas de 07:00 às 19:00
 */
const CONFIG_HORARIO = {
    HORA_INICIO: 7,      // 07:00
    HORA_FIM: 19,        // 19:00
    ZONA_HORARIA: -3     // São Paulo (GMT-3)
};

/**
 * Calcula se estamos dentro do horário de funcionamento
 * @returns {boolean} true se está entre 07:00 e 19:00
 */
function estarDentroDoHorarioOperacional() {
    const agora = new Date();
    const horaAtual = agora.getHours();
    
    return horaAtual >= CONFIG_HORARIO.HORA_INICIO && horaAtual < CONFIG_HORARIO.HORA_FIM;
}

/**
 * Calcula o tempo de trabalho descontando as horas fora do expediente
 * Exemplo: Solicitação criada às 18:30, finalizada às 07:30 do dia seguinte
 * Tempo real: 13 horas
 * Tempo contabilizado: 30min (até 19:00) + 30min (a partir de 07:00) = 1 hora
 * 
 * @param {Date} dataInicio - Data de criação/início
 * @param {Date} dataFim - Data de conclusão/agora
 * @returns {number} Tempo em minutos (contando apenas horas operacionais)
 */
function calcularTempoComHorariosOperacionais(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return 0;
    
    dataInicio = dataInicio instanceof Date ? dataInicio : new Date(dataInicio);
    dataFim = dataFim instanceof Date ? dataFim : new Date(dataFim);
    
    let tempoTotal = 0;
    let dataAtual = new Date(dataInicio);
    
    // Iterar por cada hora até o fim
    while (dataAtual < dataFim) {
        const hora = dataAtual.getHours();
        const proximaHora = new Date(dataAtual);
        proximaHora.setHours(proximaHora.getHours() + 1);
        
        // Definir próxima hora para o fim do período ou o fim da solicitação
        let tempoFinal = proximaHora < dataFim ? proximaHora : dataFim;
        
        // Se está dentro do horário operacional, contar
        if (hora >= CONFIG_HORARIO.HORA_INICIO && hora < CONFIG_HORARIO.HORA_FIM) {
            tempoTotal += (tempoFinal - dataAtual) / (1000 * 60); // converter ms para minutos
        }
        
        dataAtual = proximaHora;
    }
    
    return Math.floor(tempoTotal);
}

/**
 * Calcula o tempo até o final do expediente
 * Útil para solicitações em andamento
 * 
 * @param {Date} dataInicio - Data de início
 * @returns {object} { minutos, ate_19h }
 */
function calcularTempoAteFinaldoExpediente(dataInicio) {
    if (!dataInicio) return { minutos: 0, ate_19h: 0 };
    
    dataInicio = dataInicio instanceof Date ? dataInicio : new Date(dataInicio);
    const agora = new Date();
    const horaAtual = agora.getHours();
    
    // Se não estamos em horário operacional, retornar 0
    if (!estarDentroDoHorarioOperacional()) {
        return { minutos: 0, ate_19h: 0, pausado: true };
    }
    
    // Se está dentro do horário, contar até as 19:00
    const fim_expediente = new Date(agora);
    fim_expediente.setHours(CONFIG_HORARIO.HORA_FIM, 0, 0, 0);
    
    let tempoTotal = calcularTempoComHorariosOperacionais(dataInicio, agora);
    let tempoAte19h = (fim_expediente - agora) / (1000 * 60);
    
    return {
        minutos: Math.floor(tempoTotal),
        ate_19h: Math.floor(tempoAte19h),
        pausado: false
    };
}

/**
 * Formata o tempo de atendimento com indicação de pausa
 * Exemplo: "45 min" ou "2h 30min (PAUSADO às 19h)"
 * 
 * @param {number} minutos - Tempo em minutos
 * @param {boolean} pausado - Se está fora do horário operacional
 * @returns {string} Tempo formatado
 */
function formatarTempoComPausa(minutos, pausado = false) {
    if (minutos <= 0) return '0 min';
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    let resultado = '';
    if (horas > 0) {
        resultado = `${horas}h ${mins}min`;
    } else {
        resultado = `${mins}min`;
    }
    
    // Se está fora do horário, adicionar indicação de pausa
    if (pausado) {
        resultado += ' ⏸️ PAUSADO';
    }
    
    return resultado;
}

/**
 * Função modificada para calcularTempoAtendimento com suporte a pausa
 * Use esta versão em vez da calcularTempoAtendimento original
 * 
 * @param {object} solicitacao - Objeto da solicitação
 * @returns {string} Tempo formatado com pausa se aplicável
 */
function calcularTempoAtendimentoComPausa(solicitacao) {
    try {
        let dataInicio = null;
        
        // Tentar obter data de início
        if (solicitacao.cronometro && solicitacao.cronometro.inicio) {
            if (typeof solicitacao.cronometro.inicio.toDate === 'function') {
                dataInicio = solicitacao.cronometro.inicio.toDate();
            } else {
                dataInicio = new Date(solicitacao.cronometro.inicio);
            }
        } else if (solicitacao.dataAbertura) {
            if (typeof solicitacao.dataAbertura.toDate === 'function') {
                dataInicio = solicitacao.dataAbertura.toDate();
            } else {
                dataInicio = new Date(solicitacao.dataAbertura);
            }
        } else if (solicitacao.criadoEm) {
            if (typeof solicitacao.criadoEm.toDate === 'function') {
                dataInicio = solicitacao.criadoEm.toDate();
            } else {
                dataInicio = new Date(solicitacao.criadoEm);
            }
        }
        
        if (!dataInicio || isNaN(dataInicio.getTime())) {
            return 'Tempo indisponível';
        }
        
        // Se a solicitação foi finalizada, calcular com horários operacionais
        if (solicitacao.status === 'finalizada') {
            let dataFim = null;
            if (solicitacao.dataFinalizacao) {
                if (typeof solicitacao.dataFinalizacao.toDate === 'function') {
                    dataFim = solicitacao.dataFinalizacao.toDate();
                } else {
                    dataFim = new Date(solicitacao.dataFinalizacao);
                }
            } else if (solicitacao.finalizadoEm) {
                if (typeof solicitacao.finalizadoEm.toDate === 'function') {
                    dataFim = solicitacao.finalizadoEm.toDate();
                } else {
                    dataFim = new Date(solicitacao.finalizadoEm);
                }
            }
            
            if (dataFim) {
                const tempoTotal = calcularTempoComHorariosOperacionais(dataInicio, dataFim);
                const horas = Math.floor(tempoTotal / 60);
                const minutos = tempoTotal % 60;
                
                if (horas > 0) {
                    return `${horas}h ${minutos}min`;
                } else {
                    return `${minutos}min`;
                }
            }
        }
        
        // Se está em andamento, calcular até agora (com pausa se for depois das 19:00)
        const resultado = calcularTempoAteFinaldoExpediente(dataInicio);
        return formatarTempoComPausa(resultado.minutos, resultado.pausado);
        
    } catch (error) {
        console.error('[PAUSA-TMA] Erro ao calcular tempo:', error);
        return 'Erro';
    }
}

/**
 * Calcula SLA com desconto de tempo fora do expediente
 * 
 * @param {array} tempos - Array de tempos em minutos
 * @param {string} equipe - Nome da equipe (manutencao, nutricao, etc)
 * @returns {number} Percentual de SLA compliance (0-100)
 */
function calcularSLAComplianceComPausa(tempos, equipe) {
    const limites = {
        'manutencao': 240,      // 4 horas
        'nutricao': 60,         // 1 hora
        'higienizacao': 120,    // 2 horas
        'hotelaria': 180        // 3 horas
    };
    
    const limite = limites[equipe] || 240;
    const cumpridos = tempos.filter(tempo => tempo <= limite).length;
    
    return tempos.length > 0 ? Math.round((cumpridos / tempos.length) * 100) : 0;
}

/**
 * Gera relatório de tempo com análise de pausa
 * Mostra quantas solicitações foram criadas fora do horário
 * 
 * @param {array} solicitacoes - Array de solicitações
 * @returns {object} Relatório de pausa
 */
function gerarRelatorioPausaHoraria(solicitacoes) {
    let totalSolicitacoes = 0;
    let criadasNoturnas = 0;
    let finalizadasNoturnas = 0;
    let tempoEconomizado = 0; // em minutos
    
    solicitacoes.forEach(sol => {
        if (sol.criadoEm) {
            const dataCriacao = sol.criadoEm instanceof Date ? sol.criadoEm : new Date(sol.criadoEm);
            const horaCriacao = dataCriacao.getHours();
            
            totalSolicitacoes++;
            
            // Verificar se foi criada fora do horário
            if (horaCriacao < CONFIG_HORARIO.HORA_INICIO || horaCriacao >= CONFIG_HORARIO.HORA_FIM) {
                criadasNoturnas++;
            }
        }
        
        if (sol.dataFinalizacao || sol.finalizadoEm) {
            const dataFim = (sol.dataFinalizacao || sol.finalizadoEm) instanceof Date ? 
                (sol.dataFinalizacao || sol.finalizadoEm) : 
                new Date(sol.dataFinalizacao || sol.finalizadoEm);
            const horaFim = dataFim.getHours();
            
            if (horaFim < CONFIG_HORARIO.HORA_INICIO || horaFim >= CONFIG_HORARIO.HORA_FIM) {
                finalizadasNoturnas++;
            }
        }
    });
    
    return {
        total: totalSolicitacoes,
        criadasNoturnas,
        finalizadasNoturnas,
        impacto: `${criadasNoturnas + finalizadasNoturnas} solicitações afetadas pela pausa de horário`,
        horarioOperacional: `${CONFIG_HORARIO.HORA_INICIO}:00 - ${CONFIG_HORARIO.HORA_FIM}:00`
    };
}

/**
 * Expor funções globalmente
 */
window.calcularTempoComHorariosOperacionais = calcularTempoComHorariosOperacionais;
window.calcularTempoAteFinaldoExpediente = calcularTempoAteFinaldoExpediente;
window.formatarTempoComPausa = formatarTempoComPausa;
window.calcularTempoAtendimentoComPausa = calcularTempoAtendimentoComPausa;
window.calcularSLAComplianceComPausa = calcularSLAComplianceComPausa;
window.gerarRelatorioPausaHoraria = gerarRelatorioPausaHoraria;
window.estarDentroDoHorarioOperacional = estarDentroDoHorarioOperacional;

console.log('✅ [TMA-TME-SLA] Sistema de pausa de horário carregado');
console.log(`⏰ Horário operacional: ${CONFIG_HORARIO.HORA_INICIO}:00 - ${CONFIG_HORARIO.HORA_FIM}:00`);
