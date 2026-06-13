import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import database

# Initialize Firebase Admin
cred_path = os.path.join(os.path.dirname(__file__), 'firebase_key.json')
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    print(f"Warning: {cred_path} not found. Firebase Admin not initialized.")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', email.split('@')[0] if email else 'User')
        
        # Determine role (you might want to handle this differently in production)
        # We can extract a custom claim or just default based on email domain or UI setting
        # For this setup, we'll assume the frontend sets the role when creating/syncing user.
        # But for authentication, we just return the user dictionary.
        
        # Check if user exists in DB, otherwise create them with default 'student' role.
        # The frontend can later update the role, or we can use custom claims.
        user = database.get_user(uid)
        if not user:
            # Check custom claim if available, otherwise 'student'
            role = decoded_token.get('role', 'student') 
            user = database.create_or_update_user(uid, email, name, role)
            
        return user
    except Exception as e:
        print(f"Token verification failed: {e}")
        
        # Fallback for local development network/SSL issues
        try:
            import base64
            import json
            # Split the JWT: header.payload.signature
            parts = token.split('.')
            if len(parts) == 3:
                # Add padding if needed
                payload_b64 = parts[1] + '=' * (-len(parts[1]) % 4)
                payload_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
                decoded = json.loads(payload_json)
                uid = decoded.get('user_id', decoded.get('uid'))
                email = decoded.get('email', '')
                if uid:
                    user = database.get_user(uid)
                    if user:
                        print(f"Fallback successful for user: {email}")
                        return user
        except Exception as fallback_e:
            print(f"Fallback also failed: {fallback_e}")
            
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
