# -*- coding: utf-8 -*-
import pandas as pd
from pathlib import Path

excel_path = Path("CF_YUNA_TI_2025.xlsx")
df = pd.read_excel(excel_path, header=None)

print(f'Total de linhas no Excel: {len(df)}')
print('\nProcurando linhas de totais...\n')

for idx in range(len(df)):
    cell_value = str(df.iloc[idx, 2]).strip().lower()
    
    if 'total fluxo' in cell_value or 'total flux' in cell_value:
        print(f'[LINHA {idx}] Total fluxo de caixa: {df.iloc[idx, 2]}')
        row = df.iloc[idx]
        valores = []
        for col_idx in range(3, 15):
            valor = row[col_idx]
            try:
                valores.append(abs(float(valor)) if pd.notna(valor) else 0.0)
            except:
                valores.append(0.0)
        print(f'Valores mensais: {valores}')
        print(f'TOTAL ANUAL: R$ {sum(valores):,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.'))
        print()
    
    elif 'sdo caixa inicial' in cell_value or 'saldo caixa inicial' in cell_value:
        print(f'[LINHA {idx}] Saldo caixa inicial encontrado')
    
    elif 'saldo final' in cell_value:
        print(f'[LINHA {idx}] Saldo final encontrado')
    
    elif 'variação' in cell_value or 'variacao' in cell_value:
        print(f'[LINHA {idx}] Variação encontrada')

print('\n✅ Teste concluído!')
