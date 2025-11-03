// Integração de verificação de admin e permissões do painel React para JS
// Adapte para uso no painel JS (admin-panel.js)

// Função para verificar se usuário é administrador (Firestore)
async function verificarUsuarioAdminJS(user) {
  if (!user) return null;
  try {
    console.log('🔍 Verificando usuário admin:', user.email);
    
    // Verificar se existe na coleção usuarios_admin
    const adminDoc = await window.db.collection('usuarios_admin').doc(user.uid).get();
    
    if (adminDoc.exists) {
      const dadosAdmin = adminDoc.data();
      console.log('✅ Usuário admin encontrado:', dadosAdmin);
      
      if (!dadosAdmin.ativo) {
        showToast('Erro', 'Usuário administrativo inativo', 'error');
        return null;
      }
      return {
        ...dadosAdmin,
        uid: user.uid,
        isAdmin: true,
        isSuperAdmin: dadosAdmin.role === 'super_admin'
      };
    }
    
    // Verificar se é usuário de equipe
    const equipeDoc = await window.db.collection('usuarios_equipe').doc(user.uid).get();
    
    if (equipeDoc.exists) {
      const dadosEquipe = equipeDoc.data();
      console.log('👥 Usuário de equipe encontrado:', dadosEquipe);
      
      if (!dadosEquipe.ativo) {
        showToast('Erro', 'Usuário de equipe inativo', 'error');
        return null;
      }
      
      return {
        ...dadosEquipe,
        uid: user.uid,
        isAdmin: false,
        isEquipe: true,
        role: 'equipe',
        permissoes: {
          verSolicitacoes: true,
          atualizarSolicitacoes: true,
          // Equipes NÃO podem criar usuários, gerenciar usuários, ver relatórios
          criarUsuarios: false,
          gerenciarDepartamentos: false,
          verRelatorios: false,
          gerenciarSolicitacoes: true
        }
      };
    }
    
    // Se não encontrou nem em admin nem em equipe
    console.log('❌ Usuário não encontrado em nenhuma coleção autorizada');
    
    // MODO DESENVOLVIMENTO COMPLETAMENTE REMOVIDO
    // Este usuário deve estar configurado corretamente nas coleções
    
    showToast('Erro', 'Usuário não autorizado a acessar o painel administrativo', 'error');
    return null;
    
  } catch (error) {
    console.error('Erro ao verificar usuário admin:', error);
    
    // Se está offline, ainda assim não criar super admin automático
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.log('🔄 Modo offline detectado, mas usuário deve estar previamente autorizado');
      showToast('Erro', 'Modo offline detectado. Apenas usuários previamente autorizados podem acessar.', 'error');
      return null;
    }
    
    showToast('Erro', 'Falha ao verificar permissões: ' + (error.message || error), 'error');
    return null;
  }
}

// Função para obter permissões do usuário
function temPermissaoJS(usuarioAdmin, permissao) {
  if (!usuarioAdmin || !usuarioAdmin.permissoes) return false;
  if (usuarioAdmin.role === 'super_admin') return true;
  // Aceita tanto 'criarUsuarios' quanto 'create_users' para compatibilidade
  if (permissao === 'create_users' && usuarioAdmin.permissoes['criarUsuarios'] === true) return true;
  if (permissao === 'manage_users' && usuarioAdmin.permissoes['gerenciarDepartamentos'] === true) return true;
  return usuarioAdmin.permissoes[permissao] === true;
}

// Função para filtrar solicitações por equipe
function podeVerSolicitacaoJS(usuarioAdmin, solicitacao) {
  if (!usuarioAdmin) return false;
  if (usuarioAdmin.role === 'super_admin') return true;
  if (usuarioAdmin.isEquipe && usuarioAdmin.equipe) {
    // Usuário de equipe só vê solicitações da sua equipe
    return solicitacao.equipe === usuarioAdmin.equipe;
  }
  // Para outros casos (admin geral), mostrar todas
  return true;
}

window.verificarUsuarioAdminJS = verificarUsuarioAdminJS;
window.temPermissaoJS = temPermissaoJS;
window.podeVerSolicitacaoJS = podeVerSolicitacaoJS;
