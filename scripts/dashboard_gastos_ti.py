"""
Dashboard de Gastos de TI - Yuna 2025
Visualização completa de gastos por fornecedores e categorias
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import locale

# Configurar locale para formato brasileiro
try:
    locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'Portuguese_Brazil.1252')
    except:
        pass

# Configuração da página
st.set_page_config(
    page_title="Gastos TI 2025 | Yuna",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS customizado
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #6b7280;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
    }
    .metric-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def carregar_dados_gastos():
    """Carrega e processa dados de gastos de TI"""
    excel_path = Path("CF_YUNA_TI_2025.xlsx")
    
    if not excel_path.exists():
        st.error(f"❌ Arquivo não encontrado: {excel_path}")
        return None
    
    # Ler Excel pulando linhas de cabeçalho
    df = pd.read_excel(excel_path, header=None)
    
    # Encontrar linha com meses (linha 2, índice 2)
    header_row = 2
    
    # Extrair cabeçalhos
    meses = ['Descrição'] + [col for col in df.iloc[header_row, 3:15].values if pd.notna(col)] + ['Total']
    
    # Criar DataFrame limpo
    dados_limpos = []
    
    # Processar linhas de dados (começando após as linhas de cabeçalho)
    for idx in range(header_row + 2, len(df)):
        row = df.iloc[idx]
        descricao = row[2]
        
        # Pular linhas vazias ou títulos de categoria
        if pd.isna(descricao) or 'Classe Financeira' in str(descricao):
            continue
        
        # Extrair código e nome do fornecedor
        if ' - ' in str(descricao):
            partes = str(descricao).split(' - ', 1)
            codigo = partes[0].strip()
            fornecedor = partes[1].strip() if len(partes) > 1 else descricao
        else:
            codigo = ''
            fornecedor = str(descricao).strip()
        
        # Extrair valores mensais (agora de Jan a Dez, colunas 3 a 14)
        valores = []
        for col_idx in range(3, 15):  # Colunas de Jan a Dez (índices 3-14)
            valor = row[col_idx]
            if pd.isna(valor) or valor == '':
                valores.append(0)
            else:
                try:
                    valores.append(abs(float(valor)))  # Usar valor absoluto
                except:
                    valores.append(0)
        
        # Calcular total somando os valores mensais
        total = sum(valores)
        
        if total > 0:  # Só incluir se tiver gasto
            dados_limpos.append({
                'Código': codigo,
                'Fornecedor': fornecedor,
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
                'Dezembro': valores[11],
                'Total': total
            })
    
    df_final = pd.DataFrame(dados_limpos)
    
    return df_final

def formatar_moeda(valor):
    """Formata valor em reais"""
    return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

def criar_grafico_evolucao(df):
    """Cria gráfico de evolução mensal"""
    meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    # Somar gastos por mês
    gastos_mensais = [df[mes].sum() for mes in meses]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=meses,
        y=gastos_mensais,
        mode='lines+markers',
        name='Gastos',
        line=dict(color='#667eea', width=3),
        marker=dict(size=10, color='#764ba2'),
        fill='tozeroy',
        fillcolor='rgba(102, 126, 234, 0.1)'
    ))
    
    fig.update_layout(
        title='Evolução Mensal dos Gastos de TI',
        xaxis_title='Mês',
        yaxis_title='Valor (R$)',
        hovermode='x unified',
        height=400,
        template='plotly_white'
    )
    
    return fig

def criar_grafico_top_fornecedores(df, top_n=10):
    """Cria gráfico de top fornecedores"""
    df_sorted = df.nlargest(top_n, 'Total')
    
    fig = px.bar(
        df_sorted,
        x='Total',
        y='Fornecedor',
        orientation='h',
        title=f'Top {top_n} Fornecedores por Gastos',
        color='Total',
        color_continuous_scale='Purples',
        text='Total'
    )
    
    fig.update_traces(texttemplate='R$ %{text:,.2f}', textposition='outside')
    fig.update_layout(
        height=max(400, top_n * 40),
        xaxis_title='Gastos Totais (R$)',
        yaxis_title='',
        showlegend=False,
        template='plotly_white'
    )
    
    return fig

def criar_grafico_pizza(df, top_n=8):
    """Cria gráfico pizza com top fornecedores"""
    df_sorted = df.nlargest(top_n, 'Total')
    outros = df[~df['Fornecedor'].isin(df_sorted['Fornecedor'])]['Total'].sum()
    
    if outros > 0:
        df_sorted = pd.concat([
            df_sorted,
            pd.DataFrame([{'Fornecedor': 'Outros', 'Total': outros}])
        ])
    
    fig = px.pie(
        df_sorted,
        values='Total',
        names='Fornecedor',
        title='Distribuição de Gastos por Fornecedor',
        color_discrete_sequence=px.colors.sequential.Purples_r
    )
    
    fig.update_traces(textposition='inside', textinfo='percent+label')
    fig.update_layout(height=500)
    
    return fig

def criar_heatmap_fornecedores(df, top_n=15):
    """Cria heatmap de gastos mensais por fornecedor"""
    df_top = df.nlargest(top_n, 'Total')
    
    meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    # Preparar dados para heatmap
    dados_heatmap = df_top[meses].values
    fornecedores = df_top['Fornecedor'].values
    
    fig = go.Figure(data=go.Heatmap(
        z=dados_heatmap,
        x=meses,
        y=fornecedores,
        colorscale='Purples',
        text=dados_heatmap,
        texttemplate='R$%{text:,.0f}',
        textfont={"size": 8},
        hovertemplate='<b>%{y}</b><br>%{x}: R$ %{z:,.2f}<extra></extra>'
    ))
    
    fig.update_layout(
        title=f'Mapa de Calor: Gastos Mensais - Top {top_n} Fornecedores',
        xaxis_title='Mês',
        yaxis_title='Fornecedor',
        height=max(500, top_n * 30),
        template='plotly_white'
    )
    
    return fig

# ============================================================================
# INTERFACE PRINCIPAL
# ============================================================================

# Header
st.markdown('<div class="main-header">💰 Dashboard de Gastos TI 2025</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Análise completa de despesas com fornecedores de tecnologia</div>', unsafe_allow_html=True)

# Carregar dados
with st.spinner('📊 Carregando dados de gastos...'):
    df = carregar_dados_gastos()

if df is None or df.empty:
    st.error("❌ Não foi possível carregar os dados de gastos.")
    st.stop()

# Sidebar - Filtros
st.sidebar.header("🔍 Filtros")

# Filtro de fornecedor
fornecedores_disponiveis = ['Todos'] + sorted(df['Fornecedor'].unique().tolist())
fornecedor_selecionado = st.sidebar.selectbox(
    "Fornecedor:",
    fornecedores_disponiveis
)

# Filtro de valor mínimo
valor_min = st.sidebar.number_input(
    "Valor mínimo total (R$):",
    min_value=0.0,
    value=0.0,
    step=100.0
)

# Aplicar filtros
df_filtrado = df.copy()
if fornecedor_selecionado != 'Todos':
    df_filtrado = df_filtrado[df_filtrado['Fornecedor'] == fornecedor_selecionado]
if valor_min > 0:
    df_filtrado = df_filtrado[df_filtrado['Total'] >= valor_min]

# Métricas principais
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_gasto = df_filtrado['Total'].sum()
    st.metric("💵 Total Gasto", formatar_moeda(total_gasto))

with col2:
    media_mensal = total_gasto / 12
    st.metric("📊 Média Mensal", formatar_moeda(media_mensal))

with col3:
    num_fornecedores = len(df_filtrado)
    st.metric("👥 Fornecedores", num_fornecedores)

with col4:
    maior_gasto = df_filtrado['Total'].max()
    st.metric("🔝 Maior Gasto", formatar_moeda(maior_gasto))

st.markdown("---")

# Tabs para diferentes visualizações
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Visão Geral",
    "📈 Evolução Temporal",
    "🏆 Ranking Fornecedores",
    "📋 Dados Detalhados"
])

with tab1:
    st.subheader("Visão Geral dos Gastos")
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig_pizza = criar_grafico_pizza(df_filtrado, top_n=8)
        st.plotly_chart(fig_pizza, use_container_width=True)
    
    with col2:
        fig_evolucao = criar_grafico_evolucao(df_filtrado)
        st.plotly_chart(fig_evolucao, use_container_width=True)

with tab2:
    st.subheader("Evolução Temporal por Fornecedor")
    
    # Heatmap
    fig_heatmap = criar_heatmap_fornecedores(df_filtrado, top_n=15)
    st.plotly_chart(fig_heatmap, use_container_width=True)
    
    # Gráfico de linhas interativo
    st.markdown("### Comparação Mensal")
    
    top_n_linhas = st.slider("Número de fornecedores a comparar:", 3, 10, 5)
    df_top_linhas = df_filtrado.nlargest(top_n_linhas, 'Total')
    
    meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    fig_linhas = go.Figure()
    
    for idx, row in df_top_linhas.iterrows():
        valores_mensais = [row[mes] for mes in meses]
        fig_linhas.add_trace(go.Scatter(
            x=meses,
            y=valores_mensais,
            mode='lines+markers',
            name=row['Fornecedor'][:30]  # Limitar tamanho do nome
        ))
    
    fig_linhas.update_layout(
        title=f'Evolução Mensal - Top {top_n_linhas} Fornecedores',
        xaxis_title='Mês',
        yaxis_title='Gastos (R$)',
        height=500,
        hovermode='x unified',
        template='plotly_white'
    )
    
    st.plotly_chart(fig_linhas, use_container_width=True)

with tab3:
    st.subheader("Ranking de Fornecedores")
    
    top_n_ranking = st.slider("Mostrar top:", 5, 30, 15, key='ranking_slider')
    
    fig_ranking = criar_grafico_top_fornecedores(df_filtrado, top_n=top_n_ranking)
    st.plotly_chart(fig_ranking, use_container_width=True)
    
    # Tabela resumo
    st.markdown("### Resumo Estatístico")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            "🥇 Maior Fornecedor",
            df_filtrado.nlargest(1, 'Total')['Fornecedor'].values[0][:30]
        )
        st.caption(formatar_moeda(df_filtrado['Total'].max()))
    
    with col2:
        mediana = df_filtrado['Total'].median()
        st.metric("📊 Mediana de Gastos", formatar_moeda(mediana))
    
    with col3:
        desvio = df_filtrado['Total'].std()
        st.metric("📉 Desvio Padrão", formatar_moeda(desvio))

with tab4:
    st.subheader("Dados Detalhados")
    
    # Opções de visualização
    col1, col2 = st.columns([3, 1])
    
    with col1:
        busca = st.text_input("🔍 Buscar fornecedor:", "")
    
    with col2:
        ordenar_por = st.selectbox(
            "Ordenar por:",
            ['Total', 'Fornecedor', 'Código']
        )
    
    # Aplicar busca
    df_exibir = df_filtrado.copy()
    if busca:
        df_exibir = df_exibir[
            df_exibir['Fornecedor'].str.contains(busca, case=False, na=False) |
            df_exibir['Código'].str.contains(busca, case=False, na=False)
        ]
    
    # Ordenar
    ascending = ordenar_por == 'Fornecedor'
    df_exibir = df_exibir.sort_values(by=ordenar_por, ascending=ascending)
    
    # Formatar para exibição
    df_display = df_exibir.copy()
    
    # Formatar colunas monetárias
    meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Total']
    
    for mes in meses:
        df_display[mes] = df_display[mes].apply(formatar_moeda)
    
    # Exibir tabela
    st.dataframe(
        df_display,
        use_container_width=True,
        height=600
    )
    
    # Botão de download
    csv = df_exibir.to_csv(index=False, encoding='utf-8-sig')
    st.download_button(
        label="📥 Baixar dados filtrados (CSV)",
        data=csv,
        file_name=f"gastos_ti_2025_filtrado.csv",
        mime="text/csv"
    )

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #6b7280; padding: 1rem;'>
    <p><strong>Dashboard Gastos TI 2025 | Yuna</strong></p>
    <p>Atualizado automaticamente • Dados: CF_YUNA_TI_2025.xlsx</p>
</div>
""", unsafe_allow_html=True)
