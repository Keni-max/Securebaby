from database import get_db_connection

connection = get_db_connection()

try:
    connection.execute(
        """
        INSERT INTO alerts
        (
            type,
            message,
            bracelet,
            baby,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        """,
        (
            "Zone dépassée",
            "Le bracelet a quitté la zone autorisée.",
            "BR-001",
            "Bébé Test",
            "active"
        )
    )

    connection.commit()

    print("Alerte de test créée avec succès !")

except Exception as e:
    print("Erreur :", e)

finally:
    connection.close()