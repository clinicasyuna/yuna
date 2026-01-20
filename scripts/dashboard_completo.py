"""
Dashboard Completo - Yuna
Inventário de Equipamentos + Gastos de TI 2025
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path

# Configuração da página
st.set_page_config(
    page_title="Dashboard Completo | Yuna",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS customizado
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .metric-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-left: 4px solid #667eea;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def carregar_inventario():
    """Carrega dados de inventário"""
    excel_path = Path("Yuna - switches e antenas - 2026-01-15.xlsx")
    
    if not excel_path.exists():
        return None, None
    
    df = pd.read_excel(excel_path)
    
    # Encontrar linhas TOTAL
    total_switches_idx = df[df.iloc[:, 0].astype(str).str.contains('TOTAL', na=False)].index[0]
    total_antenas_idx = df[df.iloc[:, 0].astype(str).str.contains('TOTAL', na=False)].index[1]
    
    total_switches = int(df.iloc[total_switches_idx, 1])
    total_antenas = int(df.iloc[total_antenas_idx, 1])
    
    return total_switches, total_antenas

@st.cache_data
def carregar_gastos():
    """Carrega dados de gastos de TI"""
    excel_path = Path("CF_YUNA_TI_2025.xlsx")
    
    if not excel_path.exists():
        return None
    
    df = pd.read_excel(excel_path, header=None)
    header_row = 2
    
    dados_limpos = []
    
    for idx in range(header_row + 2, len(df)):
        row = df.iloc[idx]
        descricao = row[2]
        
        if pd.isna(descricao) or 'Classe Financeira' in str(descricao):
            continue
        
        if ' - ' in str(descricao):
            partes = str(descricao).split(' - ', 1)
            codigo = partes[0].strip()
            fornecedor = partes[1].strip() if len(partes) > 1 else descricao
        else:
            codigo = ''
            fornecedor = str(descricao).strip()
        
        valores = []
        for col_idx in range(3, 15):  # Colunas de Jan a Dez (índices 3-14)
            valor = row[col_idx]
            if pd.isna(valor) or valor == '':
                valores.append(0)
            else:
                try:
                    valores.append(abs(float(valor)))
                except:
                    valores.append(0)
        
        # Calcular total sumando os valores mensais
        total = sum(valores)
        
        if total > 0:
            dados_limpos.append({
                'Fornecedor': fornecedor,
                'Total': total,
                'Janeiro': valores[0],
                'Fevereiro': valores[1],
                'Março': valores[2],
                'Abril': valores[3],
                'Maio': valores[4],
                'Junho': valores[5],
                'Julho': valores[6],
                'Agosto': valores[7],
                'Setembro': valores[8],
                'Outubro': valores[9],
                'Novembro': valores[10],
                'Dezembro': valores[11]
            })
    
    return pd.DataFrame(dados_limpos)

def formatar_moeda(valor):
    """Formata valor em reais"""
    return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

# ============================================================================
# INTERFACE PRINCIPAL
# ============================================================================

st.markdown('<div class="main-header">📊 Dashboard Completo - Yuna TI</div>', unsafe_allow_html=True)

# Sidebar - Navegação
st.sidebar.header("🧭 Navegação")
pagina = st.sidebar.radio(
    "Escolha a visualização:",
    ["📊 Visão Geral", "📦 Inventário", "💰 Gastos 2025", "📈 Análise Integrada"]
)

# ============================================================================
# PÁGINA: VISÃO GERAL
# ============================================================================

if pagina == "📊 Visão Geral":
    st.header("Visão Geral do Setor de TI")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📦 Inventário de Equipamentos")
        switches, antenas = carregar_inventario()
        
        if switches and antenas:
            col_a, col_b = st.columns(2)
            with col_a:
                st.metric("🔌 Switches", switches)
            with col_b:
                st.metric("📡 Antenas", antenas)
            
            total_equipamentos = switches + antenas
            st.metric("📊 Total de Equipamentos", total_equipamentos)
        else:
            st.warning("⚠️ Dados de inventário não disponíveis")
    
    with col2:
        st.subheader("💰 Gastos 2025")
        df_gastos = carregar_gastos()
        
        if df_gastos is not None:
            total_gasto = df_gastos['Total'].sum()
            media_mensal = total_gasto / 12
            num_fornecedores = len(df_gastos)
            
            st.metric("💵 Total Gasto em 2025", formatar_moeda(total_gasto))
            st.metric("📊 Média Mensal", formatar_moeda(media_mensal))
            st.metric("👥 Fornecedores Ativos", num_fornecedores)
        else:
            st.warning("⚠️ Dados de gastos não disponíveis")
    
    st.markdown("---")
    
    # Gráficos resumidos
    if df_gastos is not None:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Top 5 Fornecedores")
            df_top5 = df_gastos.nlargest(5, 'Total')
            
            fig = px.bar(
                df_top5,
                x='Total',
                y='Fornecedor',
                orientation='h',
                color='Total',
                color_continuous_scale='Purples'
            )
            fig.update_layout(height=300, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Distribuição de Gastos")
            df_top8 = df_gastos.nlargest(8, 'Total')
            outros = df_gastos[~df_gastos['Fornecedor'].isin(df_top8['Fornecedor'])]['Total'].sum()
            
            if outros > 0:
                df_top8 = pd.concat([
                    df_top8,
                    pd.DataFrame([{'Fornecedor': 'Outros', 'Total': outros}])
                ])
            
            fig = px.pie(
                df_top8,
                values='Total',
                names='Fornecedor',
                color_discrete_sequence=px.colors.sequential.Purples_r
            )
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)

# ============================================================================
# PÁGINA: INVENTÁRIO
# ============================================================================

elif pagina == "📦 Inventário":
    st.header("Inventário de Equipamentos")
    
    switches, antenas = carregar_inventario()
    
    if switches and antenas:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("🔌 Switches", switches, delta=None)
        with col2:
            st.metric("📡 Antenas", antenas, delta=None)
        with col3:
            total = switches + antenas
            st.metric("📊 Total", total, delta=None)
        
        # Gráfico de pizza
        fig = go.Figure(data=[go.Pie(
            labels=['Switches', 'Antenas'],
            values=[switches, antenas],
            hole=.4,
            marker=dict(colors=['#667eea', '#764ba2'])
        )])
        
        fig.update_layout(
            title="Distribuição de Equipamentos",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        st.info(f"📊 **Fonte:** Yuna - switches e antenas - 2026-01-15.xlsx")
    else:
        st.error("❌ Não foi possível carregar os dados de inventário.")

# ============================================================================
# PÁGINA: GASTOS 2025
# ============================================================================

elif pagina == "💰 Gastos 2025":
    st.header("Gastos de TI em 2025")
    
    df_gastos = carregar_gastos()
    
    if df_gastos is not None:
        # Métricas
        col1, col2, col3, col4 = st.columns(4)
        
        total_gasto = df_gastos['Total'].sum()
        media_mensal = total_gasto / 12
        num_fornecedores = len(df_gastos)
        maior_gasto = df_gastos['Total'].max()
        
        with col1:
            st.metric("💵 Total Gasto", formatar_moeda(total_gasto))
        with col2:
            st.metric("📊 Média Mensal", formatar_moeda(media_mensal))
        with col3:
            st.metric("👥 Fornecedores", num_fornecedores)
        with col4:
            st.metric("🔝 Maior Gasto", formatar_moeda(maior_gasto))
        
        st.markdown("---")
        
        # Tabs
        tab1, tab2, tab3 = st.tabs(["📈 Evolução", "🏆 Ranking", "📋 Tabela"])
        
        with tab1:
            meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            
            gastos_mensais = [df_gastos[mes].sum() for mes in meses]
            
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=meses,
                y=gastos_mensais,
                mode='lines+markers',
                line=dict(color='#667eea', width=3),
                marker=dict(size=10),
                fill='tozeroy'
            ))
            
            fig.update_layout(
                title='Evolução Mensal dos Gastos',
                xaxis_title='Mês',
                yaxis_title='Gastos (R$)',
                height=400
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with tab2:
            top_n = st.slider("Top fornecedores:", 5, 20, 10)
            df_top = df_gastos.nlargest(top_n, 'Total')
            
            fig = px.bar(
                df_top,
                x='Total',
                y='Fornecedor',
                orientation='h',
                color='Total',
                color_continuous_scale='Purples',
                text='Total'
            )
            
            fig.update_traces(texttemplate='R$ %{text:,.2f}', textposition='outside')
            fig.update_layout(
                height=max(400, top_n * 40),
                showlegend=False
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with tab3:
            busca = st.text_input("🔍 Buscar fornecedor:")
            
            df_exibir = df_gastos.copy()
            if busca:
                df_exibir = df_exibir[
                    df_exibir['Fornecedor'].str.contains(busca, case=False, na=False)
                ]
            
            df_exibir = df_exibir.sort_values('Total', ascending=False)
            
            # Formatar valores
            df_display = df_exibir.copy()
            meses_completos = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Total']
            
            for mes in meses_completos:
                df_display[mes] = df_display[mes].apply(formatar_moeda)
            
            st.dataframe(df_display, use_container_width=True, height=500)
    else:
        st.error("❌ Não foi possível carregar os dados de gastos.")

# ============================================================================
# PÁGINA: ANÁLISE INTEGRADA
# ============================================================================

elif pagina == "📈 Análise Integrada":
    st.header("Análise Integrada - Equipamentos vs Gastos")
    
    switches, antenas = carregar_inventario()
    df_gastos = carregar_gastos()
    
    if switches and antenas and df_gastos is not None:
        total_equipamentos = switches + antenas
        total_gasto = df_gastos['Total'].sum()
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("📦 Total Equipamentos", total_equipamentos)
        
        with col2:
            st.metric("💰 Total Gastos 2025", formatar_moeda(total_gasto))
        
        with col3:
            custo_por_equip = total_gasto / total_equipamentos if total_equipamentos > 0 else 0
            st.metric("💵 Custo Médio/Equipamento", formatar_moeda(custo_por_equip))
        
        st.markdown("---")
        
        st.subheader("📊 Indicadores de Eficiência")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Gasto médio mensal
            media_mensal = total_gasto / 12
            st.info(f"""
            **Gasto Médio Mensal:** {formatar_moeda(media_mensal)}
            
            Para manter {total_equipamentos} equipamentos ativos
            """)
        
        with col2:
            # Proporção switches/antenas
            prop_switches = (switches / total_equipamentos * 100) if total_equipamentos > 0 else 0
            prop_antenas = (antenas / total_equipamentos * 100) if total_equipamentos > 0 else 0
            
            st.success(f"""
            **Distribuição de Equipamentos:**
            - Switches: {prop_switches:.1f}%
            - Antenas: {prop_antenas:.1f}%
            """)
        
        # Análise temporal
        st.subheader("📈 Análise Temporal de Gastos")
        
        meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        
        gastos_mensais = [df_gastos[mes].sum() for mes in meses]
        
        # Calcular tendência
        import numpy as np
        x = np.arange(len(meses))
        y = np.array(gastos_mensais)
        z = np.polyfit(x, y, 1)
        p = np.poly1d(z)
        tendencia = p(x)
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=meses,
            y=gastos_mensais,
            mode='lines+markers',
            name='Gastos Reais',
            line=dict(color='#667eea', width=3),
            marker=dict(size=10)
        ))
        
        fig.add_trace(go.Scatter(
            x=meses,
            y=tendencia,
            mode='lines',
            name='Tendência',
            line=dict(color='#764ba2', width=2, dash='dash')
        ))
        
        fig.update_layout(
            title='Evolução Mensal com Linha de Tendência',
            xaxis_title='Mês',
            yaxis_title='Gastos (R$)',
            height=400,
            hovermode='x unified'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Insights
        if z[0] > 0:
            st.warning("⚠️ **Tendência de AUMENTO** nos gastos ao longo do ano")
        elif z[0] < 0:
            st.success("✅ **Tendência de REDUÇÃO** nos gastos ao longo do ano")
        else:
            st.info("ℹ️ Gastos **ESTÁVEIS** ao longo do ano")
    else:
        st.warning("⚠️ Dados insuficientes para análise integrada")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #6b7280; padding: 1rem;'>
    <p><strong>Dashboard Completo Yuna TI</strong></p>
    <p>Inventário • Gastos • Análises • Atualizado em tempo real</p>
</div>
""", unsafe_allow_html=True)
