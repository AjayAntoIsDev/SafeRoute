#!/usr/bin/env python3
"""
Script to update GROQ API key across frontend and backend
Usage: python update_groq_key.py <new_api_key>
"""

import sys
import re
from pathlib import Path


def update_backend_env(new_key: str) -> bool:
    """Update GROQ API key in backend/.env file"""
    env_file = Path(__file__).parent / "backend" / ".env"
    
    if not env_file.exists():
        print(f"❌ File not found: {env_file}")
        return False
    
    try:
        content = env_file.read_text()
        # Match GROQ_API_KEY=... pattern
        pattern = r'(GROQ_API_KEY=)gsk_[A-Za-z0-9]+'
        new_content = re.sub(pattern, rf'\1{new_key}', content)
        
        if content != new_content:
            env_file.write_text(new_content)
            print(f"✅ Updated: {env_file}")
            return True
        else:
            print(f"⚠️  No changes needed in: {env_file}")
            return True
    except Exception as e:
        print(f"❌ Error updating {env_file}: {e}")
        return False


def update_backend_config(new_key: str) -> bool:
    """Update GROQ API key in backend/config.py file"""
    config_file = Path(__file__).parent / "backend" / "config.py"
    
    if not config_file.exists():
        print(f"❌ File not found: {config_file}")
        return False
    
    try:
        content = config_file.read_text()
        # Match GROQ_API_KEY = "..." pattern
        pattern = r'(GROQ_API_KEY = ")gsk_[A-Za-z0-9]+(")'
        new_content = re.sub(pattern, rf'\1{new_key}\2', content)
        
        if content != new_content:
            config_file.write_text(new_content)
            print(f"✅ Updated: {config_file}")
            return True
        else:
            print(f"⚠️  No changes needed in: {config_file}")
            return True
    except Exception as e:
        print(f"❌ Error updating {config_file}: {e}")
        return False


def update_frontend_file(file_path: Path, new_key: str) -> bool:
    """Update GROQ API key in a frontend TypeScript file"""
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        content = file_path.read_text()
        # Match gsk_... pattern (the API key itself)
        pattern = r'gsk_[A-Za-z0-9]+'
        new_content = re.sub(pattern, new_key, content)
        
        if content != new_content:
            file_path.write_text(new_content)
            print(f"✅ Updated: {file_path}")
            return True
        else:
            print(f"⚠️  No changes needed in: {file_path}")
            return True
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False


def main():
    if len(sys.argv) != 2:
        print("Usage: python update_groq_key.py <new_api_key>")
        print("\nExample:")
        print("  python update_groq_key.py gsk_abc123xyz456...")
        sys.exit(1)
    
    new_key = sys.argv[1].strip()
    
    # Validate the API key format
    if not new_key.startswith("gsk_"):
        print("❌ Error: GROQ API key should start with 'gsk_'")
        sys.exit(1)
    
    if len(new_key) < 20:
        print("❌ Error: API key seems too short. Please check your key.")
        sys.exit(1)
    
    print("🔄 Updating GROQ API key...\n")
    
    base_path = Path(__file__).parent
    success = True
    
    # Update backend files
    print("📁 Backend Files:")
    success &= update_backend_env(new_key)
    success &= update_backend_config(new_key)
    
    # Update frontend files
    print("\n📁 Frontend Files:")
    frontend_files = [
        base_path / "frontend" / "src" / "components" / "DisasterChatbot.tsx",
        base_path / "frontend" / "src" / "components" / "InlineDisasterChat.tsx",
        base_path / "frontend" / "src" / "services" / "intelligentFacilityService.ts",
    ]
    
    for file in frontend_files:
        success &= update_frontend_file(file, new_key)
    
    if success:
        print("\n✨ All files updated successfully!")
        print("\n📝 Note: Don't forget to restart your backend server and rebuild/reload your frontend.")
    else:
        print("\n⚠️  Some files could not be updated. Please check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
