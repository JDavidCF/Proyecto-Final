import os

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

database_url = URL.create(
    drivername="postgresql+psycopg",
    username=os.getenv("user"),
    password=os.getenv("password"),
    host=os.getenv("host"),
    port=int(os.getenv("port", "5432")),
    database=os.getenv("dbname"),
    query={"sslmode": "require"}
)

engine = create_engine(database_url)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()