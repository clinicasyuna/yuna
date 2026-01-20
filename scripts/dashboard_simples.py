import streamlit as st
import pandas as pd
import plotly.express as px
from pathlib import Path

st.set_page_config(page_title="Dashboard TI 2025", layout="wide", page_icon="📊")

# Carregar dados
@st.cache_data
def load_data():
    df = pd.read_excel(r"E:\APP\deploy\Relatório_Chamados_15-01-2026_937 - Samuel Lacerda.xlsx")
    df['Data de Criação'] = pd.to_datetime(df['Data de Criação'], errors='coerce')
    df['Data de Finalização'] = pd.to_datetime(df['Data de Finalização'], errors='coerce')
    df['Duracao_h'] = (df['Data de Finalização'] - df['Data de Criação']).dt.total_seconds() / 3600
    return df[df['Data de Criação'].dt.year == 2025].copy()

@st.cache_data
def load_equip():
    try:
        est = pd.read_excel(r"E:\APP\deploy\Yuna - Estacoes de trabalho - 2026-01-15.xlsx")
    except:
        est = pd.DataFrame()
    try:
        srv = pd.read_excel(r"E:\APP\deploy\Yuna - Servidores - 2026-01-15.xlsx")
    except:
        srv = pd.DataFrame()
    try:
        sw = pd.read_excel(r"E:\APP\deploy\Yuna - switches e antenas - 2026-01-15.xlsx")
    except:
        sw = pd.DataFrame()
    return est, srv, sw

df = load_data()
est, srv, sw = load_equip()

# Extrair quantidade de switches e antenas das linhas TOTAL
if not sw.empty:
    # Procurar linhas onde Nome = 'TOTAL'
    try:
        totais = sw[sw['Nome'].astype(str).str.contains('TOTAL', case=False, na=False)]
        if len(totais) >= 2:
            n_switches = int(totais.iloc[0]['Dispositivo'])  # Primeira linha TOTAL = Switches
            n_antenas = int(totais.iloc[1]['Dispositivo'])   # Segunda linha TOTAL = Antenas
        else:
            n_switches = 0
            n_antenas = 0
    except Exception as e:
        st.error(f"Erro ao extrair totais: {e}")
        n_switches = 0
        n_antenas = 0
else:
    n_switches = 0
    n_antenas = 0

# Debug info
st.sidebar.info(f"Debug: Switches={n_switches}, Antenas={n_antenas}")

tabs = st.tabs(["📊 Chamados 2025", "📋 Inventário"])

with tabs[0]:
    st.title("Atendimentos TI 2025")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total", len(df))
    c2.metric("Resolvido %", f"{(df['Nome do Status'].eq('Resolvido').mean()*100):.1f}%")
    c3.metric("Tempo Médio (h)", f"{df['Duracao_h'].mean():.1f}")
    c4.metric("No Dia %", f"{(df['Duracao_h']<=24).mean()*100:.1f}%")
    
    col_a, col_b = st.columns(2)
    with col_a:
        st.plotly_chart(px.bar(df['Assunto'].value_counts().head(15), height=400), use_container_width=True)
    with col_b:
        st.plotly_chart(px.bar(df['Nome do Solicitante'].value_counts().head(15), height=400), use_container_width=True)
    
    st.dataframe(df[['Nº Chamado', 'Data de Criação', 'Assunto', 'Nome do Solicitante', 'Nome do Status']].sort_values('Data de Criação', ascending=False), use_container_width=True, hide_index=True)

with tabs[1]:
    st.title("Inventário de Equipamentos")
    
    # Métricas de quantidade
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("🖥️ Estações de Trabalho", len(est))
    col2.metric("🗄️ Servidores", len(srv))
    col3.metric("🔌 Switches", n_switches)
    col4.metric("📡 Antenas", n_antenas)
    
    st.divider()
    
    st.subheader(f"Estações de Trabalho  {len(est)}")
    if not est.empty:
        st.dataframe(est, use_container_width=True, hide_index=True, height=300)
    else:
        st.info("Sem dados")
    
    st.subheader(f"Servidores  {len(srv)}")
    if not srv.empty:
        st.dataframe(srv, use_container_width=True, hide_index=True, height=300)
    else:
        st.info("Sem dados")
    
    st.subheader(f"Switches e Antenas  Switch {n_switches} Antena {n_antenas}")
    if not sw.empty:
        st.dataframe(sw, use_container_width=True, hide_index=True, height=300)
    else:
        st.info("Sem dados")


