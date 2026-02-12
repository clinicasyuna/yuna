"""
Dashboard Unificado Yuna TI 2025
Integra: Chamados + Inventário + Gastos + Análise Integrada
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path

st.set_page_config(
    page_title="Dashboard Yuna TI 2025 - Apresentação Diretoria",
    layout="wide",
    page_icon="📊",
    initial_sidebar_state="expanded"
)

# CSS customizado - Profissional para apresentação
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
        text-align: center;
    }
    
    .subheader-presentation {
        font-size: 1rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .metric-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# ============================================================================
# CARREGAR DADOS - CHAMADOS
# ============================================================================

@st.cache_data
def load_chamados():
    """Carrega dados de chamados"""
    try:
        df = pd.read_excel(r"E:\APP\deploy\Relatório_Chamados_15-01-2026_937 - Samuel Lacerda.xlsx")
        df['Data de Criação'] = pd.to_datetime(df['Data de Criação'], errors='coerce')
        df['Data de Finalização'] = pd.to_datetime(df['Data de Finalização'], errors='coerce')
        df['Duracao_h'] = (df['Data de Finalização'] - df['Data de Criação']).dt.total_seconds() / 3600
        return df[df['Data de Criação'].dt.year == 2025].copy()
    except Exception as e:
        st.error(f"Erro ao carregar chamados: {e}")
        return pd.DataFrame()

# ============================================================================
# CARREGAR DADOS - INVENTÁRIO
# ============================================================================

@st.cache_data
def load_inventario():
    """Carrega dados de inventário"""
    est, srv, sw = pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    cftv = pd.DataFrame()
    cftv_counts = {}
    
    try:
        est = pd.read_excel(r"E:\APP\deploy\Yuna - Estacoes de trabalho - 2026-01-15.xlsx")
        # Converter todas colunas para string para evitar erro Arrow
        est = est.astype(str)
    except:
        pass
    try:
        srv = pd.read_excel(r"E:\APP\deploy\Yuna - Servidores - 2026-01-15.xlsx")
        srv = srv.astype(str)
    except:
        pass
    try:
        sw = pd.read_excel(r"E:\APP\deploy\Yuna - switches e antenas - 2026-01-15.xlsx")
        sw = sw.astype(str)
    except:
        pass
    try:
        cftv = pd.read_excel(r"E:\APP\deploy\Samuel- Planilha com equipamentos.xlsx", sheet_name="Planilha1")
        cftv = cftv.dropna(how="all")
        if "Tipo de dispositivo" in cftv.columns:
            tipo_series = cftv["Tipo de dispositivo"].dropna().astype(str).str.strip()
            cftv_counts = tipo_series.value_counts().to_dict()
        cftv = cftv.astype(str)
    except:
        pass
    
    # Extrair totais de switches e antenas
    n_switches, n_antenas = 0, 0
    if not sw.empty:
        try:
            totais = sw[sw['Nome'].str.contains('TOTAL', case=False, na=False)]
            if len(totais) >= 2:
                n_switches = int(totais.iloc[0]['Dispositivo'])
                n_antenas = int(totais.iloc[1]['Dispositivo'])
        except:
            pass
    
    return est, srv, sw, n_switches, n_antenas, cftv, cftv_counts

# ============================================================================
# CARREGAR DADOS - GASTOS
# ============================================================================

@st.cache_data
def load_gastos():
    """Carrega dados de gastos de TI - Total + Fornecedores"""
    excel_path = Path("CF_YUNA_TI_2025.xlsx")
    
    if not excel_path.exists():
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    
    df = pd.read_excel(excel_path, header=None)
    header_row = 2
    
    # Procurar linha "Total fluxo de caixa" e outras métricas
    total_fluxo_row = None
    total_fluxo_idx = None
    saldo_inicial_row = None
    saldo_final_row = None
    variacao_row = None
    
    for idx in range(len(df)):
        cell_value = str(df.iloc[idx, 2]).strip().lower()
        if 'total fluxo de caixa' in cell_value or 'total flux' in cell_value:
            total_fluxo_row = df.iloc[idx]
            total_fluxo_idx = idx
        elif 'sdo caixa inicial' in cell_value or 'saldo caixa inicial' in cell_value:
            saldo_inicial_row = df.iloc[idx]
        elif 'saldo final' in cell_value or 'saldo caixa final' in cell_value:
            saldo_final_row = df.iloc[idx]
        elif 'variação' in cell_value or 'variacao' in cell_value:
            variacao_row = df.iloc[idx]
    
    if total_fluxo_row is None:
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    
    # Extrair valores mensais do Total fluxo de caixa
    valores_mensais = []
    for col_idx in range(3, 15):  # Colunas D até O (Jan-Dez)
        valor = total_fluxo_row[col_idx]
        try:
            valores_mensais.append(abs(float(valor)) if pd.notna(valor) else 0.0)
        except:
            valores_mensais.append(0.0)
    
    # DataFrame principal com gastos mensais
    df_gastos = pd.DataFrame({
        'Mês': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        'Valor': valores_mensais
    })
    
    # Extrair fornecedores (linhas antes do total fluxo de caixa)
    fornecedores_data = []
    
    for idx in range(header_row + 2, total_fluxo_idx):
        row = df.iloc[idx]
        descricao = row[2]
        
        # Pular linhas vazias ou cabeçalhos
        if pd.isna(descricao) or 'Classe Financeira' in str(descricao):
            continue
        
        # Extrair nome do fornecedor
        if ' - ' in str(descricao):
            partes = str(descricao).split(' - ', 1)
            fornecedor = partes[1].strip() if len(partes) > 1 else str(descricao).strip()
        else:
            fornecedor = str(descricao).strip()
        
        # Extrair valores mensais do fornecedor
        valores = []
        for col_idx in range(3, 15):
            valor = row[col_idx]
            if pd.isna(valor) or valor == '':
                valores.append(0.0)
            else:
                try:
                    valores.append(abs(float(valor)))
                except:
                    valores.append(0.0)
        
        total = sum(valores)
        
        if total > 0:
            fornecedores_data.append({
                'Fornecedor': fornecedor,
                'Total': float(total),
                'Janeiro': float(valores[0]),
                'Fevereiro': float(valores[1]),
                'Março': float(valores[2]),
                'Abril': float(valores[3]),
                'Maio': float(valores[4]),
                'Junho': float(valores[5]),
                'Julho': float(valores[6]),
                'Agosto': float(valores[7]),
                'Setembro': float(valores[8]),
                'Outubro': float(valores[9]),
                'Novembro': float(valores[10]),
                'Dezembro': float(valores[11])
            })
    
    df_fornecedores = pd.DataFrame(fornecedores_data)
    
    # DataFrame com métricas financeiras
    metricas = []
    
    if total_fluxo_row is not None:
        total_anual = sum(valores_mensais)
        metricas.append({
            'Métrica': 'Total Fluxo de Caixa',
            'Valor Anual': total_anual,
            'Média Mensal': total_anual / 12
        })
    
    if saldo_inicial_row is not None:
        valores_inicial = []
        for col_idx in range(3, 15):
            try:
                valores_inicial.append(abs(float(saldo_inicial_row[col_idx])) if pd.notna(saldo_inicial_row[col_idx]) else 0.0)
            except:
                valores_inicial.append(0.0)
        metricas.append({
            'Métrica': 'Saldo Caixa Inicial',
            'Valor Anual': sum(valores_inicial),
            'Média Mensal': sum(valores_inicial) / 12
        })
    
    if saldo_final_row is not None:
        valores_final = []
        for col_idx in range(3, 15):
            try:
                valores_final.append(abs(float(saldo_final_row[col_idx])) if pd.notna(saldo_final_row[col_idx]) else 0.0)
            except:
                valores_final.append(0.0)
        metricas.append({
            'Métrica': 'Saldo Caixa Final',
            'Valor Anual': sum(valores_final),
            'Média Mensal': sum(valores_final) / 12
        })
    
    if variacao_row is not None:
        valores_variacao = []
        for col_idx in range(3, 15):
            try:
                valores_variacao.append(abs(float(variacao_row[col_idx])) if pd.notna(variacao_row[col_idx]) else 0.0)
            except:
                valores_variacao.append(0.0)
        metricas.append({
            'Métrica': 'Variação Mensal',
            'Valor Anual': sum(valores_variacao),
            'Média Mensal': sum(valores_variacao) / 12
        })
    
    df_metricas = pd.DataFrame(metricas)
    
    return df_gastos, df_metricas, df_fornecedores

def formatar_moeda(valor):
    """Formata valor em reais"""
    return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

# ============================================================================
# CARREGAR TODOS OS DADOS
# ============================================================================

df_chamados = load_chamados()
est, srv, sw, n_switches, n_antenas, cftv, cftv_counts = load_inventario()
df_gastos, df_metricas, df_fornecedores = load_gastos()

# Header principal
st.markdown('<div class="main-header">📊 Dashboard Yuna TI 2025</div>', unsafe_allow_html=True)
st.markdown('<div class="subheader-presentation">Apresentação Executiva - Análise Completa do Ano 2025</div>', unsafe_allow_html=True)
st.markdown("**Visão Integrada:** Chamados • Inventário • Gastos • Análises de Eficiência")

# ============================================================================
# CRIAR ABAS PRINCIPAIS
# ============================================================================

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📞 Chamados 2025",
    "📦 Inventário",
    "💰 Gastos TI",
    "📈 Análise Integrada",
    "📊 Visão Executiva"
])

# ============================================================================
# ABA 1: CHAMADOS
# ============================================================================

with tab1:
    st.header("Atendimentos TI 2025")
    
    if not df_chamados.empty:
        # Métricas
        col1, col2, col3, col4, col5 = st.columns(5)
        
        total_chamados = len(df_chamados)
        resolvido_pct = (df_chamados['Nome do Status'].eq('Resolvido').mean() * 100)
        tempo_medio = df_chamados['Duracao_h'].mean()
        no_dia_pct = (df_chamados['Duracao_h'] <= 24).mean() * 100
        
        with col1:
            st.metric("📋 Total de Chamados", total_chamados)
        with col2:
            st.metric("✅ Resolvido %", f"{resolvido_pct:.1f}%")
        with col3:
            st.metric("⏱️ Tempo Médio (h)", f"{tempo_medio:.1f}")
        with col4:
            st.metric("🎯 No Prazo %", f"{no_dia_pct:.1f}%")
        with col5:
            st.metric("👥 Solicitantes", df_chamados['Nome do Solicitante'].nunique())
        
        st.divider()
        
        # Gráficos
        col_a, col_b = st.columns(2)
        
        with col_a:
            st.subheader("Assuntos Mais Comuns")
            fig = px.bar(
                df_chamados['Assunto'].value_counts().head(12),
                orientation='h',
                color_discrete_sequence=['#667eea']
            )
            fig.update_layout(height=400, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
        
        with col_b:
            st.subheader("Solicitantes Mais Ativos")
            fig = px.bar(
                df_chamados['Nome do Solicitante'].value_counts().head(12),
                orientation='h',
                color_discrete_sequence=['#764ba2']
            )
            fig.update_layout(height=400, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
        
        # Tabela de chamados
        st.subheader("Chamados Recentes")
        df_display = df_chamados[['Nº Chamado', 'Data de Criação', 'Assunto', 'Nome do Solicitante', 'Nome do Status']].sort_values('Data de Criação', ascending=False)
        st.dataframe(df_display, use_container_width=True, hide_index=True, height=400)
    else:
        st.warning("⚠️ Dados de chamados não disponíveis")

# ============================================================================
# ABA 2: INVENTÁRIO
# ============================================================================

with tab2:
    st.header("Inventário de Equipamentos")
    
    # Métricas
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    
    n_nvr = int(cftv_counts.get('NVR', 0))
    n_ipc = int(cftv_counts.get('IPC', 0))
    n_cftv = len(cftv)
    total_equip = len(est) + len(srv) + n_switches + n_antenas + n_cftv
    
    with col1:
        st.metric("🖥️ Estações de Trabalho", len(est))
    with col2:
        st.metric("🗄️ Servidores", len(srv))
    with col3:
        st.metric("🔌 Switches", n_switches)
    with col4:
        st.metric("📡 Antenas", n_antenas)
    with col5:
        st.metric("📹 NVR", n_nvr)
    with col6:
        st.metric("🎥 IPC", n_ipc)
    
    st.divider()
    
    # Gráfico de distribuição
    col_left, col_right = st.columns(2)
    
    with col_left:
        st.subheader("Distribuição de Equipamentos")
        dados_dist = {
            'Estações': len(est),
            'Servidores': len(srv),
            'Switches': n_switches,
            'Antenas': n_antenas,
            'NVR': n_nvr,
            'IPC': n_ipc
        }
        fig = px.pie(
            values=list(dados_dist.values()),
            names=list(dados_dist.keys()),
            color_discrete_sequence=['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#06b6d4']
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    with col_right:
        st.subheader("Total de Equipamentos")
        st.metric("📊 Total", total_equip)
        if total_equip > 0:
            st.info(f"""
            - Estações: {len(est)} ({len(est)/total_equip*100:.1f}%)
            - Servidores: {len(srv)} ({len(srv)/total_equip*100:.1f}%)
            - Switches: {n_switches} ({n_switches/total_equip*100:.1f}%)
            - Antenas: {n_antenas} ({n_antenas/total_equip*100:.1f}%)
            - NVR: {n_nvr} ({n_nvr/total_equip*100:.1f}%)
            - IPC: {n_ipc} ({n_ipc/total_equip*100:.1f}%)
            """)
        else:
            st.info("Sem dados de inventário disponíveis.")
    
    st.divider()
    
    # Tabelas de equipamentos
    st.subheader("Estações de Trabalho")
    if not est.empty:
        st.dataframe(est, use_container_width=True, hide_index=True, height=300)
    else:
        st.info("Sem dados")
    
    st.subheader("Servidores")
    if not srv.empty:
        st.dataframe(srv, use_container_width=True, hide_index=True, height=300)
    else:
        st.info("Sem dados")
    
    if not sw.empty:
        st.subheader("Switches e Antenas")
        st.dataframe(sw, use_container_width=True, hide_index=True, height=300)

    st.subheader("CFTV (NVR e IPC)")
    if not cftv.empty:
        st.dataframe(cftv, use_container_width=True, hide_index=True, height=300)
    else:
        st.info("Sem dados")

# ============================================================================
# ABA 3: GASTOS
# ============================================================================

with tab3:
    st.header("Gastos de TI em 2025")
    
    if not df_gastos.empty:
        # Métricas principais
        col1, col2, col3, col4 = st.columns(4)
        
        total_gasto = df_gastos['Valor'].sum()
        media_mensal = total_gasto / 12
        maior_mes_idx = df_gastos['Valor'].idxmax()
        maior_mes = df_gastos.loc[maior_mes_idx, 'Mês']
        maior_valor = df_gastos.loc[maior_mes_idx, 'Valor']
        
        with col1:
            st.metric("💵 Total Gasto Anual", formatar_moeda(total_gasto))
            st.caption("Total fluxo de caixa")
        with col2:
            st.metric("📊 Média Mensal", formatar_moeda(media_mensal))
            st.caption("Média dos 12 meses")
        with col3:
            st.metric("🔝 Maior Gasto Mensal", formatar_moeda(maior_valor))
            st.caption(f"Em {maior_mes}")
        with col4:
            menor_mes_idx = df_gastos['Valor'].idxmin()
            menor_valor = df_gastos.loc[menor_mes_idx, 'Valor']
            st.metric("📉 Menor Gasto", formatar_moeda(menor_valor))
            st.caption(f"Em {df_gastos.loc[menor_mes_idx, 'Mês']}")
        
        st.divider()
        
        # Gráfico de evolução mensal
        st.subheader("📈 Evolução Mensal dos Gastos")
        
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=df_gastos['Mês'],
            y=df_gastos['Valor'],
            name='Gastos Mensais',
            marker=dict(
                color=df_gastos['Valor'],
                colorscale='Purples',
                showscale=True,
                colorbar=dict(title="Valor (R$)")
            ),
            text=[formatar_moeda(v) for v in df_gastos['Valor']],
            textposition='outside'
        ))
        
        # Linha de média
        fig.add_hline(
            y=media_mensal,
            line_dash="dash",
            line_color="red",
            annotation_text=f"Média: {formatar_moeda(media_mensal)}",
            annotation_position="right"
        )
        
        fig.update_layout(
            height=500,
            hovermode='x unified',
            template='plotly_white',
            showlegend=False,
            yaxis_title="Valor (R$)",
            xaxis_title="Mês"
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        st.divider()
        
        # Tabela com dados mensais
        st.subheader("📋 Detalhamento Mensal")
        
        df_display = df_gastos.copy()
        df_display['Valor Formatado'] = df_display['Valor'].apply(formatar_moeda)
        df_display['% do Total'] = (df_display['Valor'] / total_gasto * 100).apply(lambda x: f"{x:.2f}%")
        
        st.dataframe(
            df_display[['Mês', 'Valor Formatado', '% do Total']],
            use_container_width=True,
            hide_index=True,
            height=400
        )
        
        # Métricas financeiras adicionais
        if not df_metricas.empty:
            st.divider()
            st.subheader("📊 Métricas Financeiras Consolidadas")
            
            df_metricas_display = df_metricas.copy()
            df_metricas_display['Valor Anual'] = df_metricas_display['Valor Anual'].apply(formatar_moeda)
            df_metricas_display['Média Mensal'] = df_metricas_display['Média Mensal'].apply(formatar_moeda)
            
            st.dataframe(
                df_metricas_display,
                use_container_width=True,
                hide_index=True
            )
        
        # Análise por Fornecedor
        if not df_fornecedores.empty:
            st.divider()
            st.header("💼 Análise por Fornecedor")
            
            # Métricas de fornecedores
            col1, col2, col3 = st.columns(3)
            
            num_fornecedores = len(df_fornecedores)
            maior_fornecedor = df_fornecedores.nlargest(1, 'Total').iloc[0]
            total_fornecedores = df_fornecedores['Total'].sum()
            
            with col1:
                st.metric("👥 Total de Fornecedores", num_fornecedores)
            with col2:
                st.metric("🏆 Maior Fornecedor", maior_fornecedor['Fornecedor'][:30])
                st.caption(formatar_moeda(maior_fornecedor['Total']))
            with col3:
                st.metric("📊 Soma Fornecedores", formatar_moeda(total_fornecedores))
                st.caption(f"{(total_fornecedores/total_gasto*100):.1f}% do total")
            
            st.divider()
            
            # Gráficos lado a lado
            col_a, col_b = st.columns(2)
            
            with col_a:
                st.subheader("🏆 Top 10 Fornecedores")
                df_top10 = df_fornecedores.nlargest(10, 'Total')
                
                fig = px.bar(
                    df_top10,
                    x='Total',
                    y='Fornecedor',
                    orientation='h',
                    color='Total',
                    color_continuous_scale='Purples',
                    text=[formatar_moeda(v) for v in df_top10['Total']]
                )
                fig.update_traces(textposition='outside')
                fig.update_layout(
                    height=450,
                    showlegend=False,
                    xaxis_title="Valor Gasto (R$)",
                    yaxis_title=""
                )
                st.plotly_chart(fig, use_container_width=True)
            
            with col_b:
                st.subheader("📊 Distribuição de Gastos")
                df_top8 = df_fornecedores.nlargest(8, 'Total')
                outros = df_fornecedores[~df_fornecedores['Fornecedor'].isin(df_top8['Fornecedor'])]['Total'].sum()
                
                if outros > 0:
                    df_pie = pd.concat([
                        df_top8[['Fornecedor', 'Total']],
                        pd.DataFrame([{'Fornecedor': 'Outros', 'Total': outros}])
                    ])
                else:
                    df_pie = df_top8[['Fornecedor', 'Total']]
                
                fig = px.pie(
                    df_pie,
                    values='Total',
                    names='Fornecedor',
                    color_discrete_sequence=px.colors.sequential.Purples_r,
                    hole=0.3
                )
                fig.update_traces(
                    textposition='inside',
                    textinfo='percent+label',
                    hovertemplate='<b>%{label}</b><br>%{value:,.2f}<br>%{percent}<extra></extra>'
                )
                fig.update_layout(height=450)
                st.plotly_chart(fig, use_container_width=True)
            
            # Tabela completa de fornecedores
            st.subheader("📋 Lista Completa de Fornecedores")
            
            busca = st.text_input("🔍 Buscar fornecedor:", key="busca_fornecedor")
            df_busca = df_fornecedores.copy()
            
            if busca:
                df_busca = df_busca[df_busca['Fornecedor'].str.contains(busca, case=False, na=False)]
            
            df_busca = df_busca.sort_values('Total', ascending=False)
            
            # Preparar para exibição
            df_display_forn = df_busca.copy()
            df_display_forn['Total'] = df_display_forn['Total'].apply(formatar_moeda)
            df_display_forn['% do Total'] = (df_busca['Total'] / total_gasto * 100).apply(lambda x: f"{x:.2f}%")
            
            # Mostrar apenas colunas principais na tabela
            colunas_exibir = ['Fornecedor', 'Total', '% do Total']
            
            st.dataframe(
                df_display_forn[colunas_exibir],
                use_container_width=True,
                hide_index=True,
                height=400
            )
            
            # Botão para expandir detalhes mensais
            with st.expander("📅 Ver Detalhamento Mensal por Fornecedor"):
                fornecedor_selecionado = st.selectbox(
                    "Selecione um fornecedor:",
                    options=df_busca['Fornecedor'].tolist()
                )
                
                if fornecedor_selecionado:
                    df_fornecedor = df_busca[df_busca['Fornecedor'] == fornecedor_selecionado].iloc[0]
                    
                    meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
                    valores_fornecedor = [df_fornecedor[mes] for mes in meses]
                    
                    # Gráfico mensal do fornecedor
                    fig = go.Figure()
                    fig.add_trace(go.Bar(
                        x=meses,
                        y=valores_fornecedor,
                        marker_color='#667eea',
                        text=[formatar_moeda(v) for v in valores_fornecedor],
                        textposition='outside'
                    ))
                    
                    fig.update_layout(
                        title=f"Gastos Mensais - {fornecedor_selecionado}",
                        xaxis_title="Mês",
                        yaxis_title="Valor (R$)",
                        height=400,
                        template='plotly_white'
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("⚠️ Dados de gastos não disponíveis")

# ============================================================================
# ABA 4: ANÁLISE INTEGRADA
# ============================================================================

with tab4:
    st.header("Análise Integrada - TI Completo")
    
    if not df_chamados.empty and not df_gastos.empty:
        col1, col2, col3 = st.columns(3)
        
        n_nvr = int(cftv_counts.get('NVR', 0))
        n_ipc = int(cftv_counts.get('IPC', 0))
        n_cftv = len(cftv)
        total_equipamentos = len(est) + len(srv) + n_switches + n_antenas + n_cftv
        total_gasto = df_gastos['Valor'].sum()
        total_chamados_ano = len(df_chamados)
        
        with col1:
            st.metric("📦 Total Equipamentos", total_equipamentos)
        
        with col2:
            st.metric("💰 Total Gastos 2025", formatar_moeda(total_gasto))
        
        with col3:
            st.metric("📞 Total Chamados", total_chamados_ano)
        
        st.divider()
        
        col_a, col_b = st.columns(2)
        
        with col_a:
            st.subheader("📊 Indicadores de Eficiência")
            
            if total_equipamentos > 0:
                custo_por_equip = total_gasto / total_equipamentos
                st.info(f"""
                **Custo Médio/Equipamento:** {formatar_moeda(custo_por_equip)}
                
                Com {total_equipamentos} equipamentos ativos
                """)
            
            media_mensal = total_gasto / 12
            st.success(f"""
            **Gasto Médio Mensal:** {formatar_moeda(media_mensal)}
            
            Baseado em 12 meses de 2025
            """)
            
            if not df_chamados.empty:
                chamados_por_equip = total_chamados_ano / total_equipamentos if total_equipamentos > 0 else 0
                st.warning(f"""
                **Chamados/Equipamento:** {chamados_por_equip:.2f}
                
                Média de {chamados_por_equip:.1f} chamados por equipamento
                """)
        
        with col_b:
            st.subheader("📈 Distribuição de Recursos")
            
            # Informações sobre fluxo de caixa
            st.info(f"""
            **Total Fluxo de Caixa Anual:**
            
            {formatar_moeda(total_gasto)}
            
            Baseado na soma dos 12 meses de 2025
            """)
            
            # Distribuição por equipamento
            if total_equipamentos > 0:
                st.success(f"""
                **Distribuição de Equipamentos:**
                - Estações: {len(est)} ({len(est)/total_equipamentos*100:.1f}%)
                - Servidores: {len(srv)} ({len(srv)/total_equipamentos*100:.1f}%)
                - Switches: {n_switches} ({n_switches/total_equipamentos*100:.1f}%)
                - Antenas: {n_antenas} ({n_antenas/total_equipamentos*100:.1f}%)
                - NVR: {n_nvr} ({n_nvr/total_equipamentos*100:.1f}%)
                - IPC: {n_ipc} ({n_ipc/total_equipamentos*100:.1f}%)
                """)
        
        st.divider()
        
        # Análise temporal
        st.subheader("Tendência de Gastos ao Longo do Ano")
        
        gastos_mensais = df_gastos['Valor'].tolist()
        meses = df_gastos['Mês'].tolist()
        
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
            height=400,
            hovermode='x unified',
            template='plotly_white'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        if z[0] > 0:
            st.warning("⚠️ **Tendência de AUMENTO** nos gastos ao longo do ano")
        elif z[0] < 0:
            st.success("✅ **Tendência de REDUÇÃO** nos gastos ao longo do ano")
        else:
            st.info("ℹ️ Gastos **ESTÁVEIS** ao longo do ano")
    else:
        st.warning("⚠️ Dados insuficientes para análise integrada")

# ============================================================================
# ABA 5: VISÃO EXECUTIVA
# ============================================================================

with tab5:
    st.header("📊 Visão Executiva - 2025")
    
    st.markdown("""
    ### Resumo Executivo do Setor de TI Yuna
    """)
    
    col1, col2, col3 = st.columns(3)
    
    if not df_chamados.empty:
        with col1:
            st.metric("📞 Chamados Atendidos", len(df_chamados))
            taxa_resolucao = (df_chamados['Nome do Status'].eq('Resolvido').mean() * 100)
            st.caption(f"Taxa de resolução: {taxa_resolucao:.1f}%")
    
    if not df_gastos.empty:
        with col2:
            total_gasto = df_gastos['Valor'].sum()
            st.metric("💰 Investimento TI", formatar_moeda(total_gasto))
            st.caption(f"Média mensal: {formatar_moeda(total_gasto/12)}")
    
    total_eq = len(est) + len(srv) + n_switches + n_antenas
    with col3:
        st.metric("📦 Equipamentos", total_eq)
        st.caption(f"{len(est)} estações, {len(srv)} servidores, {n_switches} switches, {n_antenas} antenas")
    
    st.divider()
    
    st.markdown("### KPIs Principais")
    
    total_gasto_kpi = df_gastos['Valor'].sum() if not df_gastos.empty else 0
    
    kpis = pd.DataFrame({
        'Indicador': [
            'Taxa de Resolução',
            'Tempo Médio (horas)',
            'Chamados no Prazo',
            'Total Fluxo de Caixa',
            'Gasto por Equipamento'
        ],
        'Valor': [
            f"{(df_chamados['Nome do Status'].eq('Resolvido').mean() * 100):.1f}%" if not df_chamados.empty else "N/A",
            f"{df_chamados['Duracao_h'].mean():.1f}h" if not df_chamados.empty else "N/A",
            f"{(df_chamados['Duracao_h'] <= 24).mean() * 100:.1f}%" if not df_chamados.empty else "N/A",
            formatar_moeda(total_gasto_kpi) if not df_gastos.empty else "N/A",
            formatar_moeda((total_gasto_kpi / total_eq)) if not df_gastos.empty and total_eq > 0 else "N/A"
        ],
        'Status': ['✅', '⏱️', '🎯', '👥', '💵']
    })
    
    # Garantir que todas as colunas sejam strings
    kpis = kpis.astype(str)
    
    st.dataframe(kpis, use_container_width=True, hide_index=True)
    
    st.divider()
    
    st.markdown("### Observações")
    
    obs = []
    if not df_chamados.empty:
        assunto_top = df_chamados['Assunto'].value_counts().index[0]
        obs.append(f"🔹 Assunto mais comum em chamados: **{assunto_top}**")
    
    if not df_gastos.empty:
        maior_mes_idx = df_gastos['Valor'].idxmax()
        maior_mes = df_gastos.loc[maior_mes_idx, 'Mês']
        maior_valor = df_gastos.loc[maior_mes_idx, 'Valor']
        obs.append(f"🔹 Maior gasto mensal: **{maior_mes}** ({formatar_moeda(maior_valor)})")
    
    obs.append(f"🔹 Total de equipamentos sob gerenciamento: **{total_eq}**")
    
    for o in obs:
        st.markdown(o)

# ============================================================================
# FOOTER
# ============================================================================

st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #6b7280; padding: 1rem;'>
    <p><strong>Dashboard Yuna TI 2025</strong></p>
    <p>Chamados • Inventário • Gastos • Análises Integradas</p>
    <p style='font-size: 0.85rem;'>Dados atualizados em tempo real</p>
</div>
""", unsafe_allow_html=True)
