from datetime import datetime, UTC
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel

class User(SQLModel, table=True):
    name: str = Field(alias="username", unique=True, index=True)
    hashed_password: str
    id: int | None = Field(default=None, primary_key=True)

class EntryType(str, Enum):
    DECISION = "DECISION"
    TACHE = "TACHE"

class EntryStatus(str, Enum):
    TODO = "À faire"
    IN_PROGRESS = "En cours"
    DONE = "Terminée"
    BLOCKED = "Bloquée"

class EntryPriority(str, Enum):
    LOW = "Faible"
    MEDIUM = "Moyenne"
    HIGH = "Haute"

class Entry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str
    type: EntryType = Field(default=EntryType.DECISION)
    said_by: str | None = Field(default=None, foreign_key="user.name")
    label: str
    date_added: datetime = Field(default_factory=lambda: datetime.now(UTC))
    status: EntryStatus = Field(default=EntryStatus.TODO)
    priority: EntryPriority = Field(default=EntryPriority.MEDIUM)
    due_date: datetime | None = Field(default=None)

# SQLModel.metadata.create_all(engine) # This line should be called once, usually in main.py or a migration script.
# For now, I'll comment it out to avoid issues if the table already exists.
# We'll need to handle migrations properly later if this is a production app.
