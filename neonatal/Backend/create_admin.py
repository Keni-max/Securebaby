from database import get_db_connection, init_db

init_db()

connection = get_db_connection()

try:
    connection.execute(
        """
        INSERT INTO users
        (nom, prenom, telephone, identifiant, email, password, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "Administrateur",
            "Principal",
            "690000000",
            "admin",
            "admin@neonatal.com",
            "1234",
            "admin"
        )
    )

    connection.commit()

    print("Compte administrateur créé avec succès !")

except Exception as e:
    print("Erreur :", e)

finally:
    connection.close()