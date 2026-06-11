from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from sqlmodel import SQLModel
from src.config import ORIGINS, TAGS_METADATA, DESCRIPTION
from src.database import check_db_connexion, engine
from src.models import *
from src.utils import *


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère le cycle de vie de l'application (connexion BDD, migrations et création d'utilisateurs par défaut)."""
    check_db_connexion()
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        from sqlalchemy import text
        try:
            session.exec(text("ALTER TABLE entry ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'TODO'"))
            session.exec(text("ALTER TABLE entry ADD COLUMN IF NOT EXISTS priority VARCHAR DEFAULT 'MEDIUM'"))
            session.exec(text("ALTER TABLE entry ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITHOUT TIME ZONE"))
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Adding columns failed or they already exist: {e}")
            
        try:
            session.exec(text("UPDATE entry SET status = 'TODO' WHERE status = 'À faire' OR status IS NULL"))
            session.exec(text("UPDATE entry SET status = 'IN_PROGRESS' WHERE status = 'En cours'"))
            session.exec(text("UPDATE entry SET status = 'DONE' WHERE status = 'Terminée'"))
            session.exec(text("UPDATE entry SET status = 'BLOCKED' WHERE status = 'Bloquée'"))
            
            session.exec(text("UPDATE entry SET priority = 'LOW' WHERE priority = 'Faible'"))
            session.exec(text("UPDATE entry SET priority = 'MEDIUM' WHERE priority = 'Moyenne' OR priority IS NULL"))
            session.exec(text("UPDATE entry SET priority = 'HIGH' WHERE priority = 'Haute'"))
            session.commit()
            print("Database values migration checked and completed successfully!")
        except Exception as e:
            session.rollback()
            print(f"Values migration failed: {e}")
                
    with Session(engine) as session:
        statement = select(User)
        result = session.exec(statement).first()
        if not result:
            admin_user = User(
                name="admin",
                hashed_password=get_password_hash("admin")
            )
            yves_user = User(
                name="yves",
                hashed_password=get_password_hash("yves")
            )
            session.add(admin_user)
            session.add(yves_user)
            session.commit()
            print("Database was empty. Seeded default users 'admin' (pwd: 'admin') and 'yves' (pwd: 'yves')")
    yield


app = FastAPI(
    openapi_tags=TAGS_METADATA,
    title="Carnet API",
    description=DESCRIPTION,
    summary="La documentation swagger du carnet",
    version="0.0.1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/entries", tags=["Entry"], status_code=200)
def get_entries(current_user: Annotated[User, Depends(get_current_active_user)], offset: int | None = 0):
    """Récupère la liste de toutes les entrées (décisions et tâches) avec pagination."""
    return list_all_in_db(Entry, offset)

@app.delete("/entries/{entry_id}", tags=["Entry"], status_code=202)
def delete_entry(current_user: Annotated[User, Depends(get_current_active_user)], entry_id: int):
    """Supprime une entrée spécifique de la base de données par son identifiant."""
    return delete_in_db(Entry, entry_id)


@app.get("/entries/{entry_id}", tags=["Entry"], status_code=200)
def get_entry_by_id(current_user: Annotated[User, Depends(get_current_active_user)], entry_id: int):
    """Récupère les détails d'une entrée spécifique par son identifiant."""
    return list_in_db(Entry, entry_id)

@app.post("/entries", status_code=201, tags=["Entry"], response_model=Entry)
def create_entry(current_user: Annotated[User, Depends(get_current_active_user)], entry: EntryCreate):
    """Crée une nouvelle entrée (décision ou tâche) après validation."""
    if entry.type == ENTRY_DECISION or entry.type == ENTRY_TACHE:
        db_entry = Entry(
            text=entry.text,
            said_by=entry.said_by,
            label=entry.label,
            type=entry.type,
            date_added=entry.date_added,
            status=entry.status,
            priority=entry.priority,
            due_date=entry.due_date
        )
        return create_in_db(db_entry)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le type d'entrée n'est pas valide",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.put("/entries/{entry_id}", status_code=200, tags=["Entry"], response_model=Entry)
def modify_entry(current_user: Annotated[User, Depends(get_current_active_user)], entry_id: int, entry_data: EntryUpdate):
    """Modifie les informations d'une entrée existante."""
    update_data = entry_data.model_dump(exclude_unset=True)
    return update_in_db(Entry, entry_id, update_data)

@app.put("/users", status_code=200, tags=["User"])
def change_pwd(current_user: Annotated[User, Depends(get_current_active_user)], pwd_update: PasswordUpdate) -> UserDTO:
    """Modifie le mot de passe de l'utilisateur actuellement connecté."""
    if pwd_update.new_pwd == pwd_update.confirm_new_pwd:
        current_user.hashed_password = get_password_hash(pwd_update.new_pwd)
        update_in_db(User, current_user.id, current_user.model_dump())
        return UserDTO(id=current_user.id, username=current_user.name, entries=list_entry_by_user(current_user.name))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas.",
            headers={"WWW-Authenticate": "Bearer"},
        )
@app.post("/token", tags=["User"])
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """Authentifie un utilisateur et génère un jeton d'accès JWT."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.name}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer", expire_in=int(access_token_expires.total_seconds()))


@app.post("/users", tags=["User"], status_code=201)
def register_user(user_dao: UserDAO) -> UserDTO:
    """Enregistre un nouvel utilisateur dans le système."""
    u = list_user_in_db(user_dao.username)
    if not u:
        created_user = create_in_db(User(name=user_dao.username, hashed_password=get_password_hash(user_dao.password)))
        return UserDTO(id=created_user.id, username=created_user.name)
    else:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/users/me", tags=["User"])
async def read_users_me(
        current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserDTO:
    """Récupère les informations du profil de l'utilisateur connecté ainsi que ses entrées."""
    return UserDTO(id=current_user.id, username=current_user.name, entries=list_entry_by_user(current_user.name))

@app.get("/users", tags=["User"])
async def list_users() -> list[UserDTO]:
    """Récupère la liste de tous les utilisateurs enregistrés."""
    users = list_all_in_db(User, 0)
    return list(map(lambda u : UserDTO(id=u.id, username=u.name, entries=[]), users))


@app.get("/users/{user_id}", tags=["User"])
async def read_user_by_id(
        current_user: Annotated[User, Depends(get_current_active_user)],
        user_id: int
) -> UserDTO:
    """Récupère les informations d'un utilisateur par son identifiant."""
    user = list_in_db(User, user_id)
    if user:
        return UserDTO(id=user.id, username=user.name, entries=list_entry_by_user(user.name))
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found",
        headers={"WWW-Authenticate": "Bearer"},
    )