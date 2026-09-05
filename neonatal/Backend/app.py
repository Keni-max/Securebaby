from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

init_db()


@app.route("/")
def accueil():
    return "Backend NEONATAL fonctionne !"


# =========================
# CONNEXION
# =========================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    identifiant = data.get("identifiant")
    password = data.get("password")

    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT * FROM users
        WHERE identifiant = ? AND password = ?
        """,
        (identifiant, password)
    ).fetchone()

    connection.close()

    if user:
        return jsonify({
            "success": True,
            "message": "Connexion réussie",
            "role": user["role"],
            "user_id": user["id"]
        })

    return jsonify({
        "success": False,
        "message": "Identifiant ou mot de passe incorrect"
    }), 401


# =========================
# CREER UN UTILISATEUR
# =========================
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()

    nom = data.get("nom")
    prenom = data.get("prenom")
    telephone = data.get("telephone")
    email = data.get("email")
    identifiant = data.get("identifiant")
    password = data.get("password")
    role = data.get("role")

    if (
        not nom
        or not prenom
        or not telephone
        or not email
        or not identifiant
        or not password
        or not role
    ):
        return jsonify({
            "success": False,
            "message": "Veuillez remplir tous les champs obligatoires"
        }), 400

    connection = get_db_connection()

    try:
        connection.execute(
            """
            INSERT INTO users
            (nom, prenom, telephone, identifiant, email, password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                nom,
                prenom,
                telephone,
                email,
                identifiant,
                password,
                role
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Utilisateur créé avec succès"
        })

    except Exception as e:
        print("Erreur :", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    finally:
        connection.close()


# =========================
# RECUPERER TOUS LES PARENTS
# =========================
@app.route("/api/parents", methods=["GET"])
def get_parents():
    connection = get_db_connection()

    parents = connection.execute(
        """
        SELECT id, nom, prenom, telephone, email
        FROM users
        WHERE role = 'parent'
        ORDER BY nom, prenom
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(parent)
        for parent in parents
    ])


# =========================
# CREER UN BEBE
# =========================
@app.route("/api/babies", methods=["POST"])
def create_baby():
    data = request.get_json()

    nom = data.get("nom")
    prenom = data.get("prenom")
    date_naissance = data.get("dateNaissance")
    heure_naissance = data.get("heureNaissance")
    sexe = data.get("sexe")
    nom_mere = data.get("nomMere")
    telephone_mere = data.get("telephoneMere")
    email_parent = data.get("emailParent")
    parent_id = data.get("parentId")
    bracelet = data.get("bracelet")

    if (
        not nom
        or not prenom
        or not date_naissance
        or not heure_naissance
        or not sexe
        or not nom_mere
        or not telephone_mere
        or not bracelet
    ):
        return jsonify({
            "success": False,
            "message": "Veuillez remplir tous les champs obligatoires"
        }), 400

    if not parent_id:
        return jsonify({
            "success": False,
            "message": "Veuillez sélectionner un parent"
        }), 400

    connection = get_db_connection()

    try:
        # Vérifier que le parent existe
        parent = connection.execute(
            """
            SELECT id
            FROM users
            WHERE id = ? AND role = 'parent'
            """,
            (parent_id,)
        ).fetchone()

        if not parent:
            return jsonify({
                "success": False,
                "message": "Parent introuvable"
            }), 404

        # Vérifier si le bracelet est déjà utilisé
        existing_baby = connection.execute(
            """
            SELECT *
            FROM babies
            WHERE bracelet = ?
            """,
            (bracelet,)
        ).fetchone()

        if existing_baby:
            return jsonify({
                "success": False,
                "message": "Ce bracelet est déjà attribué à un bébé."
            }), 400

        connection.execute(
            """
            INSERT INTO babies
            (
                nom,
                prenom,
                date_naissance,
                heure_naissance,
                sexe,
                nom_mere,
                telephone_mere,
                email_parent,
                parent_id,
                bracelet
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                nom,
                prenom,
                date_naissance,
                heure_naissance,
                sexe,
                nom_mere,
                telephone_mere,
                email_parent,
                parent_id,
                bracelet
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Bébé enregistré avec succès"
        })

    except Exception as e:
        print("Erreur :", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    finally:
        connection.close()


# =========================
# RECUPERER LES BEBES D'UN PARENT
# =========================
@app.route("/api/babies/parent/<int:parent_id>", methods=["GET"])
def get_babies_by_parent(parent_id):
    connection = get_db_connection()

    babies = connection.execute(
        """
        SELECT *
        FROM babies
        WHERE parent_id = ?
        ORDER BY id DESC
        """,
        (parent_id,)
    ).fetchall()

    connection.close()

    return jsonify([
        dict(baby)
        for baby in babies
    ])


# =========================
# RECUPERER TOUS LES BEBES
# =========================
@app.route("/api/babies", methods=["GET"])
def get_all_babies():
    connection = get_db_connection()

    babies = connection.execute(
        """
        SELECT
            babies.*,
            users.nom AS parent_nom,
            users.prenom AS parent_prenom
        FROM babies
        LEFT JOIN users
            ON babies.parent_id = users.id
        ORDER BY babies.id DESC
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(baby)
        for baby in babies
    ])


# =========================
# RECUPERER L'HISTORIQUE
# =========================
@app.route("/api/history", methods=["GET"])
def get_history():
    connection = get_db_connection()

    records = connection.execute(
        """
        SELECT *
        FROM bracelet_history
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(record)
        for record in records
    ])


# =========================
# AJOUTER UNE ATTRIBUTION
# A L'HISTORIQUE
# =========================
@app.route("/api/history", methods=["POST"])
def create_history():
    data = request.get_json()

    bracelet = data.get("bracelet")
    baby = data.get("baby")
    mother = data.get("mother")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    reason = data.get("reason")

    if (
        not bracelet
        or not baby
        or not mother
        or not start_date
        or not end_date
        or not reason
    ):
        return jsonify({
            "success": False,
            "message": "Veuillez remplir tous les champs."
        }), 400

    connection = get_db_connection()

    try:
        connection.execute(
            """
            INSERT INTO bracelet_history
            (
                bracelet,
                baby,
                mother,
                start_date,
                end_date,
                reason
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                bracelet,
                baby,
                mother,
                start_date,
                end_date,
                reason
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Attribution ajoutée à l'historique."
        })

    except Exception as e:
        print("Erreur :", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    finally:
        connection.close()

# =========================
# LIBERER UN BRACELET
# =========================
@app.route("/api/babies/<int:baby_id>/liberer-bracelet", methods=["POST"])
def liberer_bracelet(baby_id):

    connection = get_db_connection()

    try:
        # Récupérer le bébé et son bracelet
        baby = connection.execute(
            """
            SELECT *
            FROM babies
            WHERE id = ?
            """,
            (baby_id,)
        ).fetchone()

        if not baby:
            return jsonify({
                "success": False,
                "message": "Bébé introuvable."
            }), 404

        # Vérifier que le bébé possède bien un bracelet
        if not baby["bracelet"]:
            return jsonify({
                "success": False,
                "message": "Aucun bracelet n'est attribué à ce bébé."
            }), 400

        # Date de libération
        from datetime import datetime

        date_liberation = datetime.now().strftime("%d/%m/%Y")

        # Enregistrer l'ancienne attribution dans l'historique
        connection.execute(
            """
            INSERT INTO bracelet_history
            (
                bracelet,
                baby,
                mother,
                start_date,
                end_date,
                reason
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                baby["bracelet"],
                f'{baby["nom"]} {baby["prenom"]}',
                baby["nom_mere"],
                "Date inconnue",
                date_liberation,
                "Bracelet libéré"
            )
        )

        # Supprimer l'attribution actuelle
        connection.execute(
            """
            DELETE FROM babies
            WHERE id = ?
            """,
            (baby_id,)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": f'Le bracelet {baby["bracelet"]} a été libéré avec succès.'
        })

    except Exception as e:
        connection.rollback()

        print("Erreur :", e)

        return jsonify({
            "success": False,
            "message": "Erreur lors de la libération du bracelet."
        }), 500

    finally:
        connection.close()
        # =========================
# STATISTIQUES DU DASHBOARD
# =========================
@app.route("/api/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    connection = get_db_connection()

    try:
        # Nombre de bébés actuellement enregistrés
        babies_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM babies
            """
        ).fetchone()["total"]

        # Nombre de bracelets actuellement attribués
        bracelets_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM babies
            WHERE bracelet IS NOT NULL
            AND bracelet != ''
            """
        ).fetchone()["total"]

        # Nombre de membres du personnel enregistrés
        personnel_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM users
            WHERE role = 'personnel'
            """
        ).fetchone()["total"]

        # Nombre d'alertes actuellement actives
        alerts_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM alerts
            WHERE status = 'active'
            """
        ).fetchone()["total"]

        return jsonify({
            "success": True,
            "babies": babies_count,
            "bracelets": bracelets_count,
            "personnel": personnel_count,
            "alerts": alerts_count
        })

    except Exception as e:
        print("Erreur statistiques Dashboard :", e)

        return jsonify({
            "success": False,
            "message": "Impossible de récupérer les statistiques."
        }), 500

    finally:
        connection.close()
        # =========================
# ALERTES RECENTES
# =========================
@app.route("/api/dashboard/alerts", methods=["GET"])
def get_recent_alerts():
    connection = get_db_connection()

    try:
        alerts = connection.execute(
            """
            SELECT *
            FROM alerts
            ORDER BY id DESC
            LIMIT 5
            """
        ).fetchall()

        return jsonify([
            dict(alert)
            for alert in alerts
        ])

    except Exception as e:
        print("Erreur récupération alertes :", e)

        return jsonify({
            "success": False,
            "message": "Impossible de récupérer les alertes."
        }), 500

    finally:
        connection.close()
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT id, nom, prenom, telephone, identifiant, email, role
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    ).fetchone()

    connection.close()

    if user is None:
        return jsonify({
            "success": False,
            "message": "Utilisateur introuvable"
        }), 404

    return jsonify({
        "success": True,
        "user": dict(user)
    })
@app.route('/api/personnel', methods=['GET'])
def get_personnel():
    connection = get_db_connection()

    personnel = connection.execute(
        """
        SELECT id, nom, prenom, telephone, identifiant, email, role
        FROM users
        WHERE role = ?
        ORDER BY nom ASC, prenom ASC
        """,
        ('personnel',)
    ).fetchall()

    connection.close()

    return jsonify([
        dict(person)
        for person in personnel
    ])
# =========================
# LANCER LE SERVEUR
# =========================
if __name__ == "__main__":
    app.run(debug=True)