# Verificar se o endpoint de tramitação está correto
with open('app/services/processo_service.py', 'r') as f:
    content = f.read()

# Adicionar método de tramitação se não existir
if 'async def tramitar_processo' not in content:
    print("⚠️ Método de tramitação não encontrado")
    print("Vou adicionar...")
    
    # Encontrar a classe ProcessoService
    tramitar_method = '''
    
    async def tramitar_processo(self, processo_id: int, tramitacao_data: TramitacaoCreate, usuario_id: int) -> TramitacaoResponse:
        """Tramita processo para outro setor"""
        # Verificar se processo existe
        processo = await self.buscar_processo(processo_id)
        
        # Criar tramitação
        data = tramitacao_data.model_dump()
        data["processo_id"] = processo_id
        data["usuario_responsavel_id"] = usuario_id
        data["data_envio"] = datetime.now().isoformat()
        
        result = self.supabase.table("tramitacoes").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao tramitar processo"
            )
        
        # Atualizar setor atual do processo
        self.supabase.table("processos").update({
            "setor_atual_id": tramitacao_data.setor_destino_id,
            "status": "em_tramite"
        }).eq("id", processo_id).execute()
        
        return TramitacaoResponse(**result.data[0])
'''
    
    # Adicionar o método antes do último método da classe
    content = content.replace(
        '    async def listar_tramitacoes(self, processo_id: int)',
        tramitar_method + '    async def listar_tramitacoes(self, processo_id: int)'
    )
    
    with open('app/services/processo_service.py', 'w') as f:
        f.write(content)
    
    print("✅ Método de tramitação adicionado!")
else:
    print("✓ Método de tramitação já existe")

print("\nVerificando endpoint no main.py...")

# Verificar main.py
with open('main.py', 'r') as f:
    main_content = f.read()

if '@app.post("/api/processos/{processo_id}/tramitar"' not in main_content:
    print("⚠️ Endpoint de tramitação não encontrado no main.py")
    print("Você precisa adicionar manualmente")
else:
    print("✓ Endpoint de tramitação existe")

