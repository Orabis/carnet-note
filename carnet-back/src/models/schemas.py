from datetime import datetime, UTC
from typing import Optional
from pydantic import BaseModel
from sqlmodel import Field, SQLModel
from .db_models import EntryStatus, EntryPriority

# ---------------------------------------------------------------------------
# User related schemas
# ---------------------------------------------------------------------------

class UserCreate(SQLModel):
    name: str = Field(alias="username", unique=True, index=True)
    hashed_password: str


class UserDAO(BaseModel):
    username: str
    password: str


class UserDTO(BaseModel):
    id: int
    username: str
    entries: list['EntryCreate'] = []


# ---------------------------------------------------------------------------
# Authentication token schemas
# ---------------------------------------------------------------------------

class Token(BaseModel):
    access_token: str
    token_type: str
    expire_in: int

class PasswordUpdate(BaseModel):
    new_pwd: str
    confirm_new_pwd: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ---------------------------------------------------------------------------
# Entry related schemas
# ---------------------------------------------------------------------------

ENTRY_DECISION = "DECISION"
ENTRY_TACHE = "TACHE"

class EntryCreate(SQLModel):
    text: str
    said_by: str
    type: str
    label: str
    date_added: datetime = Field(default_factory=lambda: datetime.now(UTC))
    status: EntryStatus = Field(default=EntryStatus.TODO)
    priority: EntryPriority = Field(default=EntryPriority.MEDIUM)
    due_date: Optional[datetime] = None


class EntryUpdate(SQLModel):
    text: Optional[str] = None
    label: Optional[str] = None
    type: Optional[str] = None
    said_by: Optional[str] = None
    status: Optional[EntryStatus] = None
    priority: Optional[EntryPriority] = None
    due_date: Optional[datetime] = None