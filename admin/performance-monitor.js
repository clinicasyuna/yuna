/**
 * Performance Monitor - Sistema YUNA
 * Monitoramento de performance e uso de recursos
 * 
 * Objetivo: Suportar 300+ pacientes com performance estável
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoads: [],
            queryTimes: {},
            memorySnapshots: [],
            errors: []
        };
        this.maxHistorySize = 100;
        
        console.log('[PERF] 📊 Performance Monitor iniciado');
    }

    // Iniciar medição de tempo
    startTimer(label) {
        console.time(`[PERF] ${label}`);
        const startTime = performance.now();
        
        return {
            end: () => {
                console.timeEnd(`[PERF] ${label}`);
                const duration = performance.now() - startTime;
                
                if (!this.metrics.queryTimes[label]) {
                    this.metrics.queryTimes[label] = [];
                }
                
                this.metrics.queryTimes[label].push({
                    duration: Math.round(duration),
                    timestamp: new Date().toISOString()
                });
                
                // Limitar histórico
                if (this.metrics.queryTimes[label].length > this.maxHistorySize) {
                    this.metrics.queryTimes[label].shift();
                }
                
                // Alertar se demorou muito
                if (duration > 3000) {
                    console.warn(`[PERF] ⚠️ Operação lenta: ${label} levou ${Math.round(duration)}ms`);
                }
                
                return duration;
            }
        };
    }

    // Capturar snapshot de memória
    captureMemorySnapshot(label = 'snapshot') {
        if (!performance.memory) {
            console.warn('[PERF] ⚠️ Performance.memory não disponível neste navegador');
            return null;
        }

        const snapshot = {
            label,
            timestamp: new Date().toISOString(),
            usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
            totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
            jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
        };

        this.metrics.memorySnapshots.push(snapshot);
        
        // Limitar histórico
        if (this.metrics.memorySnapshots.length > this.maxHistorySize) {
            this.metrics.memorySnapshots.shift();
        }

        // Alertar se memória > 200MB
        if (snapshot.usedJSHeapSize > 200) {
            console.warn(`[PERF] ⚠️ Alto uso de memória: ${snapshot.usedJSHeapSize}MB`);
        }

        return snapshot;
    }

    // Registrar erro
    logError(error, context = '') {
        const errorLog = {
            message: error.message || String(error),
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack || 'N/A'
        };

        this.metrics.errors.push(errorLog);
        
        // Limitar histórico
        if (this.metrics.errors.length > this.maxHistorySize) {
            this.metrics.errors.shift();
        }

        console.error('[PERF] 🔴 Erro capturado:', errorLog);
    }

    // Obter estatísticas de uma operação
    getStats(label) {
        const times = this.metrics.queryTimes[label];
        if (!times || times.length === 0) return null;

        const durations = times.map(t => t.duration);
        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / durations.length);
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        return { label, avg, min, max, count: durations.length };
    }

    // Gerar relatório completo
    generateReport() {
        console.group('[PERF] 📊 Relatório de Performance');
        
        // Estatísticas de operações
        console.log('\n🔹 Tempos de Operação:');
        Object.keys(this.metrics.queryTimes).forEach(label => {
            const stats = this.getStats(label);
            if (stats) {
                console.log(`  ${label}: média ${stats.avg}ms (min: ${stats.min}ms, max: ${stats.max}ms, execuções: ${stats.count})`);
            }
        });

        // Memória
        if (this.metrics.memorySnapshots.length > 0) {
            const latest = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1];
            console.log('\n🔹 Uso de Memória:');
            console.log(`  Atual: ${latest.usedJSHeapSize}MB / ${latest.totalJSHeapSize}MB`);
            console.log(`  Limite: ${latest.jsHeapSizeLimit}MB`);
        }

        // Erros
        if (this.metrics.errors.length > 0) {
            console.log('\n🔹 Erros Recentes:');
            this.metrics.errors.slice(-5).forEach(err => {
                console.log(`  [${err.timestamp}] ${err.context}: ${err.message}`);
            });
        }

        console.groupEnd();
        
        return this.metrics;
    }

    // Exportar métricas para análise
    exportMetrics() {
        const data = {
            exportedAt: new Date().toISOString(),
            summary: {
                totalOperations: Object.keys(this.metrics.queryTimes).reduce((sum, key) => 
                    sum + this.metrics.queryTimes[key].length, 0),
                totalErrors: this.metrics.errors.length,
                memorySnapshots: this.metrics.memorySnapshots.length
            },
            operations: Object.keys(this.metrics.queryTimes).map(label => this.getStats(label)),
            recentMemory: this.metrics.memorySnapshots.slice(-10),
            recentErrors: this.metrics.errors.slice(-20)
        };

        console.log('[PERF] 📤 Métricas exportadas:', data);
        return data;
    }

    // Limpar métricas antigas
    clearOldMetrics(daysToKeep = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffTime = cutoffDate.toISOString();

        // Limpar query times
        Object.keys(this.metrics.queryTimes).forEach(label => {
            this.metrics.queryTimes[label] = this.metrics.queryTimes[label].filter(
                item => item.timestamp > cutoffTime
            );
        });

        // Limpar snapshots
        this.metrics.memorySnapshots = this.metrics.memorySnapshots.filter(
            item => item.timestamp > cutoffTime
        );

        // Limpar erros
        this.metrics.errors = this.metrics.errors.filter(
            item => item.timestamp > cutoffTime
        );

        console.log(`[PERF] 🧹 Métricas antigas limpas (mantidos últimos ${daysToKeep} dias)`);
    }

    // Monitorar carregamento da página
    trackPageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                console.log(`[PERF] 🚀 Página carregada em ${Math.round(loadTime)}ms`);
                
                this.metrics.pageLoads.push({
                    loadTime: Math.round(loadTime),
                    timestamp: new Date().toISOString()
                });
            }

            // Capturar snapshot inicial de memória
            this.captureMemorySnapshot('page-load');
        });
    }
}

// Criar instância global
window.perfMonitor = new PerformanceMonitor();
window.perfMonitor.trackPageLoad();

// Capturar snapshot de memória a cada 5 minutos
setInterval(() => {
    if (window.perfMonitor) {
        window.perfMonitor.captureMemorySnapshot('periodic');
    }
}, 5 * 60 * 1000);

// Expor no console para debug
window.showPerformanceReport = () => window.perfMonitor.generateReport();
window.exportPerformanceMetrics = () => window.perfMonitor.exportMetrics();

console.log('[PERF] ✅ Performance Monitor ativo. Use showPerformanceReport() no console para ver estatísticas.');
