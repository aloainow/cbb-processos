from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Cliente Supabase
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Cliente com service role (para operações admin)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)

def get_supabase() -> Client:
    return supabase

def get_supabase_admin() -> Client:
    return supabase_admin
