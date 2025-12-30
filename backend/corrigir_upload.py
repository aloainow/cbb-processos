import re

with open('main.py', 'r') as f:
    content = f.read()

# Encontrar e substituir o endpoint de upload
old_endpoint = r'@app\.post\("/api/processos/\{processo_id\}/documentos".*?return \{.*?\}'

new_endpoint = '''@app.post("/api/processos/{processo_id}/documentos", tags=["Documentos"])
async def upload_documento(
    processo_id: int,
    arquivo: UploadFile = File(...),
    nome: str = Form(...),
    tipo_documento: str = Form(...),
    descricao: str = Form(None),
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Upload de documento para processo"""
    try:
        from datetime import datetime
        import os
        
        print(f"📤 Upload iniciado: {arquivo.filename}")
        
        # Criar diretório se não existir
        upload_dir = f"/tmp/cbb_documentos/{processo_id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = f"{upload_dir}/{arquivo.filename}"
        content = await arquivo.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        print(f"✓ Arquivo salvo: {file_path}")
        
        # Salvar metadados no banco
        supabase = get_supabase_admin()
        doc_data = {
            "processo_id": processo_id,
            "nome": nome,
            "tipo_documento": tipo_documento,
            "descricao": descricao or None,
            "caminho_arquivo": file_path,
            "nome_arquivo_original": arquivo.filename,
            "tamanho_bytes": len(content),
            "criado_por": current_user.id
        }
        
        print(f"💾 Salvando no banco: {doc_data}")
        
        result = supabase.table("documentos").insert(doc_data).execute()
        
        print(f"✅ Documento salvo com sucesso!")
        
        return {"message": "Documento anexado com sucesso", "documento": result.data[0]}
        
    except Exception as e:
        print(f"❌ Erro no upload: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")'''

# Substituir usando regex
content = re.sub(old_endpoint, new_endpoint, content, flags=re.DOTALL)

with open('main.py', 'w') as f:
    f.write(content)

print("✅ Endpoint de upload corrigido com logs!")
