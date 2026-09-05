import sqlite3


def get_db_connection():
    connection = sqlite3.connect('neonatal.db')
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_db_connection()

    # =========================
    # TABLE DES UTILISATEURS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            telephone TEXT NOT NULL,
            identifiant TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    # =========================
    # TABLE DES BEBES
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS babies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            date_naissance TEXT NOT NULL,
            heure_naissance TEXT NOT NULL,
            sexe TEXT NOT NULL,
            nom_mere TEXT NOT NULL,
            telephone_mere TEXT NOT NULL,
            email_parent TEXT,
            parent_id INTEGER,
            bracelet TEXT NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES users(id)
        )
    """)

    # =========================
    # TABLE HISTORIQUE
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS bracelet_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bracelet TEXT NOT NULL,
            baby TEXT NOT NULL,
            mother TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            reason TEXT NOT NULL
        )
    """)

    # =========================
    # TABLE DES ALERTES
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            bracelet TEXT,
            baby TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()