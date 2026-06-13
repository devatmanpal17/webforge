from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
import database
from auth import verify_token

router = APIRouter()

# Models
class BookSessionRequest(BaseModel):
    userId: str
    deskId: str

class UpdateSessionRequest(BaseModel):
    action: str

class SyncUserRequest(BaseModel):
    role: str

@router.get("/desks")
def get_desks(floor: Optional[int] = None):
    desks = database.get_desks(floor)
    return {"desks": desks}

@router.get("/desks/{id}")
def get_desk(id: str):
    desk = database.get_desk(id)
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    
    current_session = database.get_active_session_for_desk(id)
    return {
        "desk": desk,
        "currentSession": current_session
    }

@router.get("/sessions")
def get_sessions(userId: Optional[str] = None):
    if userId:
        session = database.get_active_session_for_user(userId)
        return {"session": session}
    return {"session": None}

@router.post("/sessions")
def create_session(req: BookSessionRequest, user: dict = Depends(verify_token)):
    # Verify the user making the request matches the userId, or is admin
    if req.userId != user['id']:
        raise HTTPException(status_code=403, detail="Not authorized to book for this user")
        
    try:
        session = database.book_desk(req.userId, req.deskId)
        return {"session": session}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/sessions/{id}")
def update_session(id: str, req: UpdateSessionRequest, user: dict = Depends(verify_token)):
    try:
        if req.action == 'away':
            session = database.set_session_away(id)
        elif req.action == 'return':
            session = database.return_from_away(id)
        elif req.action == 'end':
            session = database.end_session_by_id(id)
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        return {"session": session}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sessions/{id}/release")
def release_session(id: str, user: dict = Depends(verify_token)):
    # Normally, only a librarian or the session owner should release
    # For now, allow it if authenticated
    try:
        database.release_desk_by_session_id(id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/students")
def get_students(user: dict = Depends(verify_token)):
    # In a real app we'd verify the user is a librarian here
    students = database.get_all_students()
    return {"students": students}

@router.get("/stats/floors")
def get_floor_stats():
    stats = database.get_floor_stats()
    return {"stats": stats}

@router.post("/auth/sync")
def sync_user(req: SyncUserRequest, user: dict = Depends(verify_token)):
    # Update the user's role in our SQLite db based on the login type
    updated_user = database.create_or_update_user(user['id'], user['email'], user['name'], req.role)
    return {"user": updated_user}
