from pathlib import Path
import pandas as pd
import streamlit as st
import plotly.express as px

EXCEL_PATH = Path(r"E:\APP\deploy\Relatório_Chamados_15-01-2026_937 - Samuel Lacerda.xlsx")
ESTACOES_PATH = Path(r"E:\APP\deploy\Yuna - Estacoes de trabalho - 2026-01-15.xlsx")
SERVIDORES_PATH = Path(r"E:\APP\deploy\Yuna - Servidores - 2026-01-15.xlsx")
SWITCHES_PATH = Path(r"E:\APP\deploy\Yuna - switches e antenas - 2026-01-15.xlsx")

st.set_page_config(page_title="Atendimentos TI 2025 + Inventário", layout="wide", page_icon="📊")

@st.cache_data
def load_chamados():
    df = pd.read_excel(EXCEL_PATH)
    df['Data de Criação'] = pd.to_datetime(df['Data de Criação'], errors='coerce')
    df['Data de Finalização'] = pd.to_datetime(df['Data de Finalização'], errors='coerce')
    df['Duracao_h'] = (df['Data de Finalização'] - df['Data de Criação']).dt.total_seconds() / 3600
    df['Mes'] = df['Data de Criação'].dt.to_period('M').dt.to_timestamp()
    return df[df['Data de Criação'].dt.year == 2025].copy()

@st.cache_data
def load_inventory():
    return (
        pd.read_excel(ESTACOES_PATH) if ESTACOES_PATH.exists() else pd.DataFrame(),
        pd.read_excel(SERVIDORES_PATH) if SERVIDORES_PATH.exists() else pd.DataFrame(),
        pd.read_excel(SWITCHES_PATH) if SWITCHES_PATH.exists() else pd.DataFrame()
    )

df = load_chamados()
estacoes, servidores, switches = load_inventory()

tab1, tab2, tab3 = st.tabs(["📊 Chamados 2025", "🖥️ Equipamentos", "⚙️ Inventário"])

with tab1:
    st.title("Atendimentos TI 2025")
    with st.sidebar:
        st.header("Filtros")
        meses = st.multiselect("Período", sorted(df['Mes'].dt.strftime('%Y-%m').unique()), 
                              default=sorted(df['Mes'].dt.strftime('%Y-%m').unique()))
        assuntos = st.multiselect("Assuntos", sorted(df['Assunto'].dropna().unique()))
        solicitantes = st.multiselect("Solicitantes", sorted(df['Nome do Solicitante'].dropna().unique())[:30])
        status_opts = st.multiselect("Status", sorted(df['Nome do Status'].dropna().unique()))

    mask = pd.Series(True, index=df.index)
    if meses: mask &= df['Mes'].dt.strftime('%Y-%m').isin(meses)
    if assuntos: mask &= df['Assunto'].isin(assuntos)
    if solicitantes: mask &= df['Nome do Solicitante'].isin(solicitantes)
    if status_opts: mask &= df['Nome do Status'].isin(status_opts)
    
    fdf = df[mask]
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total", len(fdf))
    col2.metric("Resolvido %", f"{(fdf['Nome do Status'].eq('Resolvido').mean()*100):.1f}%")
    col3.metric("Tempo Médio (h)", f"{fdf['Duracao_h'].mean():.1f}")
    col4.metric("No dia %", f"{(fdf['Duracao_h']<=24).mean()*100:.1f}%")

    col_a, col_b = st.columns(2)
    with col_a:
        fig = px.bar(fdf['Assunto'].value_counts().head(15), title="Assuntos Principais", height=400)
        st.plotly_chart(fig, use_container_width=True)
    with col_b:
        fig = px.bar(fdf['Nome do Solicitante'].value_counts().head(15), title="Solicitantes", height=400)
        st.plotly_chart(fig, use_container_width=True)

    st.subheader("Chamados")
    cols = ['Nº Chamado', 'Data de Criação', 'Assunto', 'Nome do Solicitante', 'Nome do Status', 'Total de Horas Tarifadas']
    st.dataframe(fdf[cols].sort_values('Data de Criação', ascending=False), use_container_width=True, hide_index=True)

with tab2:
    st.title("Inventário de Equipamentos")
    col1, col2, col3 = st.columns(3)
    col1.metric("Estações", len(estacoes))
    col2.metric("Servidores", len(servidores))
    col3.metric("Switches/Antenas", len(switches))

    tipos_data = pd.DataFrame({'Tipo': ['Estações', 'Servidores', 'Switches'], 
                               'Quantidade': [len(estacoes), len(servidores), len(switches)]})
    fig = px.pie(tipos_data, values='Quantidade', names='Tipo', height=400)
    st.plotly_chart(fig, use_container_width=True)

with tab3:
    st.title("Inventário Detalhado")
    
    st.subheader("Estações de Trabalho")
    if not estacoes.empty:
        st.dataframe(estacoes.sort_values('Maquina') if 'Maquina' in estacoes.columns else estacoes,
                    use_container_width=True, hide_index=True, height=350)
    
    st.divider()
    st.subheader("Servidores")
    if not servidores.empty:
        st.dataframe(servidores.sort_values('Servidor') if 'Servidor' in servidores.columns else servidores,
                    use_container_width=True, hide_index=True, height=350)
    
    st.divider()
    st.subheader("Switches e Antenas")
    if not switches.empty:
        st.dataframe(switches.sort_values('Nome') if 'Nome' in switches.columns else switches,
                    use_container_width=True, hide_index=True, height=350)



