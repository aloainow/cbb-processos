from app.database import get_supabase_admin

supabase = get_supabase_admin()

processo = supabase.table("processos").select("*").eq("id", 1).single().execute()

print("=== DADOS DO PROCESSO ===")
for key, value in processo.data.items():
    print(f"{key}: {value}")
