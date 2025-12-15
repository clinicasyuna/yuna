/**
 * LOGIN RATE LIMITING
 * Protege contra brute force attacks
 * Máx 5 tentativas por email em 5 minutos
 */

class LoginRateLimiter {
    constructor() {
        this.ATTEMPTS_LIMIT = 5;
        this.TIME_WINDOW = 5 * 60 * 1000; // 5 minutos
        this.STORAGE_KEY = 'yuna_login_attempts';
        this.DELAYS = [0, 1000, 2000, 5000, 10000, 30000]; // ms progressivos
    }

    /**
     * Registra uma tentativa de login
     * @param {string} email - Email do usuário
     * @returns {object} {blocked: bool, attemptsLeft: number, blockedUntil: timestamp}
     */
    recordAttempt(email) {
        const now = Date.now();
        const attempts = this.getAttempts();

        // Limpar tentativas antigas
        const emailAttempts = (attempts[email] || []).filter(t => now - t < this.TIME_WINDOW);

        if (emailAttempts.length >= this.ATTEMPTS_LIMIT) {
            const blockedUntil = Math.max(...emailAttempts) + this.TIME_WINDOW;
            return {
                blocked: true,
                attemptsLeft: 0,
                blockedUntil: blockedUntil,
                waitSeconds: Math.ceil((blockedUntil - now) / 1000)
            };
        }

        // Registrar nova tentativa
        emailAttempts.push(now);
        attempts[email] = emailAttempts;
        this.saveAttempts(attempts);

        return {
            blocked: false,
            attemptsLeft: this.ATTEMPTS_LIMIT - emailAttempts.length,
            blockedUntil: null,
            waitSeconds: 0
        };
    }

    /**
     * Limpa tentativas após login bem-sucedido
     * @param {string} email
     */
    clearAttempts(email) {
        const attempts = this.getAttempts();
        delete attempts[email];
        this.saveAttempts(attempts);
    }

    /**
     * Retorna delay recomendado baseado no número de tentativas
     * @param {number} attemptNumber
     * @returns {number} delay em ms
     */
    getDelay(attemptNumber) {
        return this.DELAYS[Math.min(attemptNumber, this.DELAYS.length - 1)] || 30000;
    }

    /**
     * Verifica se email está bloqueado
     * @param {string} email
     * @returns {object}
     */
    isBlocked(email) {
        const now = Date.now();
        const attempts = this.getAttempts();
        const emailAttempts = (attempts[email] || []).filter(t => now - t < this.TIME_WINDOW);

        if (emailAttempts.length >= this.ATTEMPTS_LIMIT) {
            const blockedUntil = Math.max(...emailAttempts) + this.TIME_WINDOW;
            return {
                blocked: true,
                waitSeconds: Math.ceil((blockedUntil - now) / 1000)
            };
        }

        return { blocked: false, waitSeconds: 0 };
    }

    // === PRIVADAS ===
    getAttempts() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    saveAttempts(attempts) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attempts));
    }
}

// Instância global
window.loginRateLimiter = new LoginRateLimiter();

/**
 * Uso em admin-panel.js:
 * 
 * async function handleLogin(email, password) {
 *     // NOVO: Verificar rate limit
 *     const blocked = window.loginRateLimiter.isBlocked(email);
 *     if (blocked.blocked) {
 *         showToast('Bloqueado', `Muitas tentativas. Tente em ${blocked.waitSeconds}s`, 'error');
 *         return;
 *     }
 * 
 *     try {
 *         const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
 *         
 *         // NOVO: Limpar tentativas após sucesso
 *         window.loginRateLimiter.clearAttempts(email);
 *         // ... resto do código
 *     } catch (error) {
 *         // NOVO: Registrar tentativa
 *         const result = window.loginRateLimiter.recordAttempt(email);
 *         
 *         let message = 'Erro ao fazer login';
 *         if (result.blocked) {
 *             message = `Muitas tentativas. Tente em ${result.waitSeconds}s`;
 *         } else if (result.attemptsLeft > 0) {
 *             message = `Credenciais inválidas (${result.attemptsLeft} tentativas restantes)`;
 *         } else {
 *             message = 'Conta bloqueada por segurança';
 *         }
 *         showToast('Erro', message, 'error');
 *     }
 * }
 */
