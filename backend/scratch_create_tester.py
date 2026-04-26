from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

email = "yapyaptester@skillbridge.com"
password = "tester123"

try:
    # 1. Sign up via Auth API (Service Key bypasses confirmation if configured, 
    # but we'll confirm it manually just in case)
    print(f"Creating auth user: {email}")
    auth_resp = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"display_name": "YapYapTester"}
    })
    
    uid = auth_resp.user.id
    print(f"User created with ID: {uid}")

    # 2. Sync to public.users
    print("Syncing to public.users...")
    supabase.table("users").upsert({
        "id": uid,
        "email": email,
        "first_name": "YapYapTester",
        "last_name": "Tester",
        "created_at": "now()"
    }).execute()
    
    print("SUCCESS: YapYapTester is ready!")

except Exception as e:
    print(f"FAILED: {e}")
