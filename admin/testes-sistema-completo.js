// 🧪 SCRIPT DE TESTE PARA VALIDAÇÃO COMPLETA DO SISTEMA DE EQUIPES

console.log('🧪 [TESTE] Script de validação completa carregado');

// Função principal para executar todos os testes
window.executarTodosOsTestes = async function() {
    console.log('🚀 [TESTE COMPLETO] Iniciando validação completa do sistema...\n');
    
    const resultados = {
        usuariosEquipe: null,
        regrasPermissoes: null,
        filtrosSolicitacoes: null,
        botaosSuperAdmin: null,
        paineisPorEquipe: null,
        novoUsuarioValidacao: null
    };
    
    // 1. Validar usuários de equipe no Firestore
    console.log('📋 [TESTE 1] Validando usuários de equipe no Firestore...');
    if (typeof window.validarUsuariosEquipe === 'function') {
        resultados.usuariosEquipe = await window.validarUsuariosEquipe();
    } else {
        console.error('❌ Função validarUsuariosEquipe não encontrada');
    }
    
    // 2. Testar regras de permissões para cada tipo de usuário
    console.log('\n🔐 [TESTE 2] Testando regras de permissões...');
    resultados.regrasPermissoes = testarRegrasPermissoes();
    
    // 3. Testar filtros de solicitações
    console.log('\n🔍 [TESTE 3] Testando filtros de solicitações...');
    if (typeof window.testarFiltrosSolicitacoes === 'function') {
        resultados.filtrosSolicitacoes = await window.testarFiltrosSolicitacoes();
    }
    
    // 4. Verificar visibilidade de botões para super admin
    console.log('\n🔘 [TESTE 4] Verificando botões para super admin...');
    resultados.botaosSuperAdmin = verificarBotoesSuperAdmin();
    
    // 5. Verificar painéis por equipe
    console.log('\n🏢 [TESTE 5] Verificando painéis de equipe...');
    resultados.paineisPorEquipe = verificarPaineisPorEquipe();
    
    // 6. Testar validação para novos usuários
    console.log('\n✨ [TESTE 6] Testando validação para novos usuários...');
    resultados.novoUsuarioValidacao = testarValidacaoNovoUsuario();
    
    // Relatório final
    console.log('\n📊 [RELATÓRIO FINAL] Resumo de todos os testes:');
    console.log('================================================');
    
    let testesPassaram = 0;
    let totalTestes = 0;
    
    Object.entries(resultados).forEach(([teste, resultado]) => {
        totalTestes++;
        if (resultado && (resultado.success !== false)) {
            testesPassaram++;
            console.log(`✅ ${teste}: PASSOU`);
        } else {
            console.log(`❌ ${teste}: FALHOU`);
            if (resultado && resultado.problemas) {
                console.log(`   Problemas: ${resultado.problemas.length}`);
            }
        }
    });
    
    const porcentagem = Math.round((testesPassaram / totalTestes) * 100);
    console.log(`\n🎯 RESULTADO: ${testesPassaram}/${totalTestes} testes passaram (${porcentagem}%)`);
    
    if (porcentagem === 100) {
        console.log('🎉 SUCESSO: Sistema funcionando perfeitamente!');
    } else if (porcentagem >= 80) {
        console.log('⚠️ ATENÇÃO: Sistema funcionando com pequenos problemas');
    } else {
        console.log('❌ CRÍTICO: Sistema precisa de correções importantes');
    }
    
    return resultados;
};

// Função para testar regras de permissões
function testarRegrasPermissoes() {
    console.log('🔐 Testando regras de permissões para diferentes tipos de usuário...');
    
    const usuarios = [
        {
            nome: 'Super Admin Teste',
            role: 'super_admin',
            email: 'admin@teste.com'
        },
        {
            nome: 'Equipe Manutenção',
            role: 'equipe',
            equipe: 'manutencao',
            email: 'manutencao@teste.com'
        },
        {
            nome: 'Equipe Nutrição',
            role: 'equipe', 
            equipe: 'nutricao',
            email: 'nutricao@teste.com'
        }
    ];
    
    const solicitacoes = [
        { equipe: 'manutencao', titulo: 'Solicitação Manutenção' },
        { equipe: 'nutricao', titulo: 'Solicitação Nutrição' },
        { equipe: 'higienizacao', titulo: 'Solicitação Higienização' },
        { equipe: 'hotelaria', titulo: 'Solicitação Hotelaria' }
    ];
    
    let testesPassaram = 0;
    let totalTestes = 0;
    
    usuarios.forEach(usuario => {
        console.log(`\n👤 Testando usuário: ${usuario.nome} (${usuario.role})`);
        
        solicitacoes.forEach(solicitacao => {
            totalTestes++;
            const podeVer = podeVerSolicitacaoJS(usuario, solicitacao);
            
            // Definir expectativa
            let esperado = false;
            if (usuario.role === 'super_admin') {
                esperado = true; // Super admin vê tudo
            } else if (usuario.role === 'equipe' && usuario.equipe === solicitacao.equipe) {
                esperado = true; // Equipe vê apenas suas solicitações
            }
            
            const passou = podeVer === esperado;
            if (passou) testesPassaram++;
            
            const status = passou ? '✅' : '❌';
            console.log(`${status} ${solicitacao.equipe}: ${podeVer ? 'pode ver' : 'não pode ver'} (esperado: ${esperado})`);
        });
    });
    
    console.log(`\n📊 Resultado: ${testesPassaram}/${totalTestes} testes de permissão passaram`);
    
    return {
        success: testesPassaram === totalTestes,
        testesPassaram,
        totalTestes
    };
}

// Função para verificar botões de super admin
function verificarBotoesSuperAdmin() {
    console.log('🔘 Verificando visibilidade dos botões administrativos...');
    
    const botoesAdmin = [
        { id: 'btn-novo-usuario', nome: 'Criar Usuário' },
        { id: 'manage-users-btn', nome: 'Gerenciar Usuários' },
        { id: 'relatorios-btn', nome: 'Relatórios' },
        { id: 'acompanhantes-btn', nome: 'Acompanhantes' }
    ];
    
    const usuarioAtual = window.usuarioAdmin || {};
    const isSuperAdmin = usuarioAtual.role === 'super_admin';
    
    let botoesCorretos = 0;
    let totalBotoes = botoesAdmin.length;
    
    botoesAdmin.forEach(botaoInfo => {
        const botao = document.getElementById(botaoInfo.id);
        if (!botao) {
            console.log(`⚠️ ${botaoInfo.nome}: Elemento não encontrado`);
            return;
        }
        
        const visivel = !botao.classList.contains('btn-hide') && botao.style.display !== 'none';
        const correto = isSuperAdmin ? visivel : !visivel;
        
        if (correto) botoesCorretos++;
        
        const status = correto ? '✅' : '❌';
        const estadoEsperado = isSuperAdmin ? 'visível' : 'oculto';
        const estadoAtual = visivel ? 'visível' : 'oculto';
        
        console.log(`${status} ${botaoInfo.nome}: ${estadoAtual} (esperado: ${estadoEsperado})`);
    });
    
    return {
        success: botoesCorretos === totalBotoes,
        botoesCorretos,
        totalBotoes,
        usuarioTipo: isSuperAdmin ? 'super_admin' : usuarioAtual.role || 'desconhecido'
    };
}

// Função para verificar painéis por equipe
function verificarPaineisPorEquipe() {
    console.log('🏢 Verificando visibilidade dos painéis de equipe...');
    
    const equipes = ['manutencao', 'nutricao', 'higienizacao', 'hotelaria'];
    const usuarioAtual = window.usuarioAdmin || {};
    const isSuperAdmin = usuarioAtual.role === 'super_admin';
    const isEquipe = usuarioAtual.role === 'equipe';
    
    let paineisCorretos = 0;
    let totalPaineis = equipes.length;
    
    equipes.forEach(equipe => {
        const painel = document.querySelector(`[data-department="${equipe}"]`);
        if (!painel) {
            console.log(`⚠️ Painel ${equipe}: Elemento não encontrado`);
            return;
        }
        
        const visivel = !painel.classList.contains('hidden') && painel.style.display !== 'none';
        
        // Definir expectativa
        let esperado = false;
        if (isSuperAdmin) {
            esperado = true; // Super admin vê todos
        } else if (isEquipe && usuarioAtual.equipe === equipe) {
            esperado = true; // Equipe vê apenas o seu
        }
        
        const correto = visivel === esperado;
        if (correto) paineisCorretos++;
        
        const status = correto ? '✅' : '❌';
        console.log(`${status} Painel ${equipe}: ${visivel ? 'visível' : 'oculto'} (esperado: ${esperado ? 'visível' : 'oculto'})`);
    });
    
    return {
        success: paineisCorretos === totalPaineis,
        paineisCorretos,
        totalPaineis,
        usuarioTipo: isSuperAdmin ? 'super_admin' : isEquipe ? `equipe_${usuarioAtual.equipe}` : 'outro'
    };
}

// Função para testar validação de novos usuários
function testarValidacaoNovoUsuario() {
    console.log('✨ Testando validação para criação de novos usuários...');
    
    const casosDeTest = [
        {
            nome: 'Usuário válido',
            usuario: {
                nome: 'João Silva',
                email: 'joao@yuna.com.br',
                role: 'equipe',
                equipe: 'manutencao',
                ativo: true
            },
            devePassar: true
        },
        {
            nome: 'Sem campo nome',
            usuario: {
                email: 'test@yuna.com.br',
                role: 'equipe',
                equipe: 'nutricao',
                ativo: true
            },
            devePassar: false
        },
        {
            nome: 'Equipe inválida',
            usuario: {
                nome: 'Maria Santos',
                email: 'maria@yuna.com.br',
                role: 'equipe',
                equipe: 'equipeinvalida',
                ativo: true
            },
            devePassar: false
        },
        {
            nome: 'Role inválido',
            usuario: {
                nome: 'Pedro Costa',
                email: 'pedro@yuna.com.br',
                role: 'roleinvalido',
                equipe: 'higienizacao',
                ativo: true
            },
            devePassar: false
        }
    ];
    
    let testesPassaram = 0;
    
    if (typeof window.validarRegrasParaNovoUsuario !== 'function') {
        console.log('❌ Função validarRegrasParaNovoUsuario não encontrada');
        return { success: false, erro: 'Função de validação não encontrada' };
    }
    
    casosDeTest.forEach(caso => {
        const resultado = window.validarRegrasParaNovoUsuario(caso.usuario);
        const passou = resultado === caso.devePassar;
        
        if (passou) testesPassaram++;
        
        const status = passou ? '✅' : '❌';
        console.log(`${status} ${caso.nome}: ${resultado ? 'válido' : 'inválido'} (esperado: ${caso.devePassar ? 'válido' : 'inválido'})`);
    });
    
    return {
        success: testesPassaram === casosDeTest.length,
        testesPassaram,
        totalTestes: casosDeTest.length
    };
}

// Função de help para testes
window.testesHelp = function() {
    console.log(`
🧪 [AJUDA] Funções de teste disponíveis:

1. executarTodosOsTestes() - Executa validação completa do sistema
2. validarUsuariosEquipe() - Valida usuários no Firestore  
3. testarLoginsEquipes() - Testa filtros para cada equipe
4. verificarSistemaEquipes() - Verifica estado geral
5. testesHelp() - Mostra esta ajuda

📋 Usuários de equipe esperados:
- Hotelaria: caroline.chinaglia@yuna.com.br
- Higienização: recepcao.jardins@yuna.com.br  
- Nutrição: leticia.costa@yuna.com.br
- Manutenção: manutencao.jardins@yuna.com.br

🎯 Execute executarTodosOsTestes() para validação completa!
    `);
};

console.log('✅ [TESTE] Sistema de testes carregado. Use executarTodosOsTestes() para validação completa.');