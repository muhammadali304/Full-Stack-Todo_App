"""
Core module initialization.

This module provides core functionality for the backend application:
- config: Application configuration and settings
- database: Database connection and session management
"""

from .config import settings
from .database import engine, SessionLocal, get_db, create_db_and_tables, close_db_connection

__all__ = [
    "settings",
    "engine",
    "SessionLocal",
    "get_db",
    "create_db_and_tables",
    "close_db_connection",
]
