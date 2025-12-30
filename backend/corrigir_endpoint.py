with open('main.py', 'r') as f:
    lines = f.readlines()

# Encontrar e corrigir a função
new_lines = []
for i, line in enumerate(lines):
    # Pular a linha do print que está no lugar errado
    if 'print(f"🔍 DEBUG' in line:
        continue
    
    # Se encontrar a função tramitar_processo, adicionar o print no lugar certo
    if line.strip().startswith('async def tramitar_processo('):
        new_lines.append(line)
        # Adicionar o print depois da definição
        continue
    
    # Se for a linha com processo_id: int, adicionar print antes
    if 'processo_id: int,' in line and len(new_lines) > 0 and 'async def tramitar_processo' in new_lines[-1]:
        new_lines.append('    print(f"🔍 DEBUG - processo_id: {processo_id}")\n')
    
    new_lines.append(line)

with open('main.py', 'w') as f:
    f.writelines(new_lines)

print("✅ Endpoint corrigido!")
