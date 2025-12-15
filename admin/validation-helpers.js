/**
 * VALIDATION HELPERS
 * Validação centralizada de inputs
 */

class ValidationHelper {
    constructor() {
        // Email: RFC 5322 simplified
        this.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Senha: mín 8 caracteres, 1 maiúscula, 1 número
        this.PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        
        // Nome: apenas letras, espaços, acentos
        this.NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/;
        
        // Departamento: lista permitida
        this.ALLOWED_DEPARTMENTS = [
            'manutencao',
            'nutricao',
            'higienizacao',
            'hotelaria',
            'recepcao',
            'administracao'
        ];
    }

    /**
     * Valida email
     * @param {string} email
     * @returns {object} {valid: bool, message: string}
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, message: 'Email é obrigatório' };
        }

        const trimmed = email.trim();

        if (trimmed.length > 255) {
            return { valid: false, message: 'Email muito longo (máx 255 caracteres)' };
        }

        if (!this.EMAIL_REGEX.test(trimmed)) {
            return { valid: false, message: 'Email inválido' };
        }

        return { valid: true, message: '' };
    }

    /**
     * Valida senha
     * @param {string} password
     * @returns {object} {valid: bool, message: string}
     */
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, message: 'Senha é obrigatória' };
        }

        if (password.length < 8) {
            return { valid: false, message: 'Senha deve ter mínimo 8 caracteres' };
        }

        if (password.length > 128) {
            return { valid: false, message: 'Senha muito longa (máx 128 caracteres)' };
        }

        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos 1 letra maiúscula' };
        }

        if (!/\d/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos 1 número' };
        }

        return { valid: true, message: '' };
    }

    /**
     * Valida nome
     * @param {string} name
     * @returns {object} {valid: bool, message: string}
     */
    validateName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, message: 'Nome é obrigatório' };
        }

        const trimmed = name.trim();

        if (trimmed.length < 2) {
            return { valid: false, message: 'Nome deve ter mínimo 2 caracteres' };
        }

        if (trimmed.length > 100) {
            return { valid: false, message: 'Nome deve ter máximo 100 caracteres' };
        }

        if (!this.NAME_REGEX.test(trimmed)) {
            return { valid: false, message: 'Nome contém caracteres inválidos' };
        }

        return { valid: true, message: '' };
    }

    /**
     * Valida departamento
     * @param {string} department
     * @returns {object} {valid: bool, message: string}
     */
    validateDepartment(department) {
        if (!department || typeof department !== 'string') {
            return { valid: false, message: 'Departamento é obrigatório' };
        }

        const lower = department.toLowerCase().trim();

        if (!this.ALLOWED_DEPARTMENTS.includes(lower)) {
            return { 
                valid: false, 
                message: `Departamento inválido. Permitidos: ${this.ALLOWED_DEPARTMENTS.join(', ')}` 
            };
        }

        return { valid: true, message: '' };
    }

    /**
     * Valida role
     * @param {string} role
     * @returns {object} {valid: bool, message: string}
     */
    validateRole(role) {
        const ALLOWED_ROLES = ['super_admin', 'admin', 'equipe', 'acompanhante', 'recepcao'];

        if (!role || typeof role !== 'string') {
            return { valid: false, message: 'Role é obrigatório' };
        }

        if (!ALLOWED_ROLES.includes(role.toLowerCase())) {
            return { valid: false, message: `Role inválido. Permitidos: ${ALLOWED_ROLES.join(', ')}` };
        }

        return { valid: true, message: '' };
    }

    /**
     * Sanitiza string para evitar XSS
     * Usa apenas métodos nativos (sem DOMPurify por enquanto)
     * @param {string} str
     * @returns {string}
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return '';

        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Valida form de login completo
     * @param {string} email
     * @param {string} password
     * @returns {object} {valid: bool, errors: {email: string, password: string}}
     */
    validateLoginForm(email, password) {
        const errors = {};
        let valid = true;

        const emailValidation = this.validateEmail(email);
        if (!emailValidation.valid) {
            errors.email = emailValidation.message;
            valid = false;
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
            errors.password = passwordValidation.message;
            valid = false;
        }

        return { valid, errors };
    }

    /**
     * Valida form de criação de usuário
     * @param {object} data - {email, password, name, role, department}
     * @returns {object} {valid: bool, errors: {...}}
     */
    validateUserForm(data) {
        const errors = {};
        let valid = true;

        const emailVal = this.validateEmail(data.email);
        if (!emailVal.valid) { errors.email = emailVal.message; valid = false; }

        const passwordVal = this.validatePassword(data.password);
        if (!passwordVal.valid) { errors.password = passwordVal.message; valid = false; }

        const nameVal = this.validateName(data.name);
        if (!nameVal.valid) { errors.name = nameVal.message; valid = false; }

        const roleVal = this.validateRole(data.role);
        if (!roleVal.valid) { errors.role = roleVal.message; valid = false; }

        // Departamento é opcional para admin/super_admin
        if (data.role === 'equipe' || data.role === 'recepcao') {
            const deptVal = this.validateDepartment(data.department);
            if (!deptVal.valid) { errors.department = deptVal.message; valid = false; }
        }

        return { valid, errors };
    }
}

// Instância global
window.validationHelper = new ValidationHelper();

/**
 * Uso em admin-panel.js:
 * 
 * // No handleLogin():
 * const validation = window.validationHelper.validateLoginForm(email, password);
 * if (!validation.valid) {
 *     showToast('Validação', Object.values(validation.errors)[0], 'error');
 *     return;
 * }
 * 
 * // No formulário de criar usuário:
 * const userValidation = window.validationHelper.validateUserForm({
 *     email: emailInput.value,
 *     password: passwordInput.value,
 *     name: nameInput.value,
 *     role: roleSelect.value,
 *     department: deptSelect.value
 * });
 * if (!userValidation.valid) {
 *     showToast('Validação', Object.values(userValidation.errors)[0], 'error');
 *     return;
 * }
 */
