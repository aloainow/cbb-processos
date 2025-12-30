with open('main.py', 'r') as f:
    content = f.read()

# Procurar pelo endpoint de tramitação
if '@app.post("/api/processos/{processo_id}/tramitar"' in content:
    # Adicionar log antes de processar
    old_line = 'async def tramitar_processo('
    new_line = '''async def tramitar_processo(
    print(f"🔍 DEBUG - Dados recebidos: {tramitacao_data}")
    '''
    
    # Substituir só se ainda não tiver o log
    if '🔍 DEBUG' not in content:
        content = content.replace('async def tramitar_processo(', new_line)
        
        with open('main.py', 'w') as f:
            f.write(content)
        
        print("✅ Log adicionado!")
    else:
        print("✓ Log já existe")
else:
    print("⚠️ Endpoint não encontrado")
