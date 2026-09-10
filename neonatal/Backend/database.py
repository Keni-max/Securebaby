import sqlite3


def get_db_connection():
    connection = sqlite3.connect("neonatal.db")
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_db_connection()

    # =========================================================
    # TABLE USERS
    # =========================================================
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

    # =========================================================
    # TABLE BABIES
    # =========================================================
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

    # =========================================================
    # TABLE ADMISSIONS
    # =========================================================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS admissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            identifiant_mere TEXT,
            nom_mere TEXT NOT NULL,
            telephone_mere TEXT NOT NULL,
            nom_pere TEXT,
            telephone_pere TEXT,
            bracelet TEXT NOT NULL,
            date_admission TEXT NOT NULL,
            statut TEXT NOT NULL DEFAULT 'reserve',
            date_activation TEXT,
            date_retrait TEXT,
            motif_retrait TEXT,
            parent_id INTEGER,
            FOREIGN KEY (parent_id) REFERENCES users(id)
        )
    """)

    # =========================================================
    # MIGRATIONS ADMISSIONS
    # =========================================================
    columns = connection.execute(
        "PRAGMA table_info(admissions)"
    ).fetchall()

    column_names = [column["name"] for column in columns]

    if "identifiant_mere" not in column_names:
        try:
            connection.execute(
                "ALTER TABLE admissions ADD COLUMN identifiant_mere TEXT"
            )
        except sqlite3.OperationalError:
            pass

    if "date_activation" not in column_names:
        try:
            connection.execute(
                "ALTER TABLE admissions ADD COLUMN date_activation TEXT"
            )
        except sqlite3.OperationalError:
            pass

    if "date_retrait" not in column_names:
        try:
            connection.execute(
                "ALTER TABLE admissions ADD COLUMN date_retrait TEXT"
            )
        except sqlite3.OperationalError:
            pass

    if "motif_retrait" not in column_names:
        try:
            connection.execute(
                "ALTER TABLE admissions ADD COLUMN motif_retrait TEXT"
            )
        except sqlite3.OperationalError:
            pass

    if "parent_id" not in column_names:
        try:
            connection.execute(
                "ALTER TABLE admissions ADD COLUMN parent_id INTEGER"
            )
        except sqlite3.OperationalError:
            pass

    # =========================================================
    # MIGRATIONS BABIES
    # =========================================================
    baby_columns = connection.execute(
        "PRAGMA table_info(babies)"
    ).fetchall()

    baby_column_names = [column["name"] for column in baby_columns]

    # Latitude GPS
    if "latitude" not in baby_column_names:
        try:
            connection.execute(
                "ALTER TABLE babies ADD COLUMN latitude REAL"
            )
        except sqlite3.OperationalError:
            pass

    # Longitude GPS
    if "longitude" not in baby_column_names:
        try:
            connection.execute(
                "ALTER TABLE babies ADD COLUMN longitude REAL"
            )
        except sqlite3.OperationalError:
            pass

    # Etat du capteur anti-arrachement
    if "tamper_alert" not in baby_column_names:
        try:
            connection.execute(
                """
                ALTER TABLE babies
                ADD COLUMN tamper_alert INTEGER DEFAULT 0
                """
            )
        except sqlite3.OperationalError:
            pass

    # Dernière communication du bracelet
    if "last_seen" not in baby_column_names:
        try:
            connection.execute(
                "ALTER TABLE babies ADD COLUMN last_seen TEXT"
            )
        except sqlite3.OperationalError:
            pass

    # =========================================================
    # ANCIEN STATUT
    # =========================================================
    try:
        connection.execute("""
            UPDATE admissions
            SET statut = 'reserve'
            WHERE statut = 'en_attente'
        """)
    except sqlite3.OperationalError:
        pass

    # =========================================================
    # TABLE HISTORIQUE
    # =========================================================
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

    # =========================================================
    # TABLE ALERTES
    # =========================================================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            message TEXT,
            bracelet TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # =========================================================
    # TABLE TELEMETRIE DES BRACELETS
    #
    # Cette table conserve les données reçues de l'ESP32.
    # =========================================================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS bracelet_telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            baby_id TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            tamper_alert INTEGER DEFAULT 0,
            received_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()