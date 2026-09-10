from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db
from datetime import datetime

app = Flask(__name__)
CORS(app)

init_db()


@app.route("/")
def accueil():
    return "Backend NEONATAL fonctionne !"


# ============================================================
# CONNEXION
# ============================================================
@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    identifiant = data.get("identifiant")
    password = data.get("password")

    if not identifiant or not password:
        return jsonify({
            "success": False,
            "message": (
                "Veuillez renseigner votre "
                "identifiant/email et votre mot de passe."
            )
        }), 400

    connection = get_db_connection()

    try:

        user = connection.execute(
            """
            SELECT *
            FROM users
            WHERE (identifiant = ? OR email = ?)
            AND password = ?
            """,
            (
                identifiant,
                identifiant,
                password
            )
        ).fetchone()

        if user:

            return jsonify({
                "success": True,
                "message": "Connexion réussie",
                "role": user["role"],
                "user_id": user["id"],
                "nom": user["nom"],
                "prenom": user["prenom"],
                "email": user["email"]
            })

        return jsonify({
            "success": False,
            "message": (
                "Identifiant/email ou mot de passe incorrect"
            )
        }), 401

    finally:
        connection.close()


# ============================================================
# CREER UN UTILISATEUR
# ============================================================
@app.route("/api/users", methods=["POST"])
def create_user():

    data = request.get_json() or {}

    nom = data.get("nom")
    prenom = data.get("prenom")
    telephone = data.get("telephone")
    email = data.get("email") or ""
    identifiant = data.get("identifiant")
    password = data.get("password")
    role = data.get("role")

    baby_nom = data.get("babyNom")
    baby_prenom = data.get("babyPrenom")
    baby_date_naissance = data.get("babyDateNaissance")
    baby_heure_naissance = data.get("babyHeureNaissance")
    baby_sexe = data.get("babySexe")
    baby_bracelet = data.get("babyBracelet")

    if (
        not nom
        or not prenom
        or not telephone
        or not identifiant
        or not password
        or not role
    ):
        return jsonify({
            "success": False,
            "message": (
                "Veuillez remplir tous les champs obligatoires."
            )
        }), 400

    roles_autorises = [
        "parent",
        "personnel",
        "admin"
    ]

    if role not in roles_autorises:
        return jsonify({
            "success": False,
            "message": "Rôle utilisateur invalide."
        }), 400

    if role == "parent":

        if (
            not baby_nom
            or not baby_prenom
            or not baby_date_naissance
            or not baby_heure_naissance
            or not baby_sexe
            or not baby_bracelet
        ):
            return jsonify({
                "success": False,
                "message": (
                    "Veuillez remplir toutes les "
                    "informations du bébé."
                )
            }), 400

    connection = get_db_connection()

    try:

        # ====================================================
        # DOUBLONS UTILISATEUR
        # ====================================================

        existing_identifiant = connection.execute(
            """
            SELECT id
            FROM users
            WHERE identifiant = ?
            LIMIT 1
            """,
            (identifiant,)
        ).fetchone()

        if existing_identifiant:
            return jsonify({
                "success": False,
                "message": (
                    "Cet identifiant est déjà utilisé."
                )
            }), 400

        existing_telephone = connection.execute(
            """
            SELECT id
            FROM users
            WHERE telephone = ?
            LIMIT 1
            """,
            (telephone,)
        ).fetchone()

        if existing_telephone:
            return jsonify({
                "success": False,
                "message": (
                    "Ce numéro de téléphone est déjà utilisé."
                )
            }), 400

        if email:

            existing_email = connection.execute(
                """
                SELECT id
                FROM users
                WHERE email = ?
                LIMIT 1
                """,
                (email,)
            ).fetchone()

            if existing_email:
                return jsonify({
                    "success": False,
                    "message": (
                        "Cette adresse email est déjà utilisée."
                    )
                }), 400

        # ====================================================
        # VERIFIER LE BRACELET
        # ====================================================

        if role == "parent":

            existing_admission = connection.execute(
                """
                SELECT id
                FROM admissions
                WHERE bracelet = ?
                AND statut IN ('reserve', 'actif')
                LIMIT 1
                """,
                (baby_bracelet,)
            ).fetchone()

            if existing_admission:

                return jsonify({
                    "success": False,
                    "message": (
                        "Ce bracelet est déjà réservé "
                        "ou actif."
                    )
                }), 400

            existing_baby = connection.execute(
                """
                SELECT id
                FROM babies
                WHERE bracelet = ?
                AND bracelet != ''
                LIMIT 1
                """,
                (baby_bracelet,)
            ).fetchone()

            if existing_baby:

                return jsonify({
                    "success": False,
                    "message": (
                        "Ce bracelet est déjà attribué "
                        "à un bébé."
                    )
                }), 400

        # ====================================================
        # CREER UTILISATEUR
        # ====================================================

        cursor = connection.execute(
            """
            INSERT INTO users
            (
                nom,
                prenom,
                telephone,
                identifiant,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                nom,
                prenom,
                telephone,
                identifiant,
                email,
                password,
                role
            )
        )

        user_id = cursor.lastrowid

        baby_id = None
        admission_id = None

        # ====================================================
        # CREER BEBE + ADMISSION
        # ====================================================

        if role == "parent":

            cursor = connection.execute(
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
                    bracelet,
                    tamper_alert,
                    last_seen
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
                """,
                (
                    baby_nom,
                    baby_prenom,
                    baby_date_naissance,
                    baby_heure_naissance,
                    baby_sexe,
                    nom,
                    telephone,
                    email,
                    user_id,
                    baby_bracelet
                )
            )

            baby_id = cursor.lastrowid

            cursor = connection.execute(
                """
                INSERT INTO admissions
                (
                    identifiant_mere,
                    nom_mere,
                    telephone_mere,
                    bracelet,
                    date_admission,
                    statut,
                    parent_id,
                    date_activation
                )
                VALUES
                (
                    ?, ?, ?, ?,
                    datetime('now'),
                    'actif',
                    ?,
                    datetime('now')
                )
                """,
                (
                    identifiant,
                    nom,
                    telephone,
                    baby_bracelet,
                    user_id
                )
            )

            admission_id = cursor.lastrowid

        connection.commit()

        if role == "parent":

            return jsonify({
                "success": True,
                "message": (
                    "Compte parent, bébé et bracelet "
                    "créés avec succès."
                ),
                "user_id": user_id,
                "parent_id": user_id,
                "baby_id": baby_id,
                "admission_id": admission_id,
                "role": "parent",
                "bracelet": baby_bracelet,
                "statut": "actif"
            })

        return jsonify({
            "success": True,
            "message": "Utilisateur créé avec succès.",
            "user_id": user_id,
            "role": role
        })

    except Exception as e:

        connection.rollback()

        print(
            "Erreur création utilisateur :",
            e
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# RECUPERER TOUS LES PARENTS
# ============================================================
@app.route("/api/parents", methods=["GET"])
def get_parents():

    connection = get_db_connection()

    try:

        parents = connection.execute(
            """
            SELECT
                id,
                nom,
                prenom,
                telephone,
                email,
                identifiant
            FROM users
            WHERE role = 'parent'
            ORDER BY nom, prenom
            """
        ).fetchall()

        return jsonify([
            dict(parent)
            for parent in parents
        ])

    finally:
        connection.close()


# ============================================================
# CREER UN BEBE
# ============================================================
@app.route("/api/babies", methods=["POST"])
def create_baby():

    data = request.get_json() or {}

    nom = data.get("nom")
    prenom = data.get("prenom")
    date_naissance = data.get("dateNaissance")
    heure_naissance = data.get("heureNaissance")
    sexe = data.get("sexe")

    nom_mere = data.get("nomMere")
    telephone_mere = data.get("telephoneMere")
    email_parent = data.get("emailParent")

    parent_id = data.get("parentId")
    admission_id = data.get("admissionId")
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
            "message": (
                "Veuillez remplir tous les champs obligatoires."
            )
        }), 400

    connection = get_db_connection()

    try:

        admission = None

        if admission_id:

            admission = connection.execute(
                """
                SELECT *
                FROM admissions
                WHERE id = ?
                """,
                (admission_id,)
            ).fetchone()

            if not admission:

                return jsonify({
                    "success": False,
                    "message": "Admission introuvable."
                }), 404

            if admission["statut"] != "reserve":

                return jsonify({
                    "success": False,
                    "message": (
                        "Cette admission n'est plus "
                        "en attente d'activation."
                    )
                }), 400

            if admission["bracelet"] != bracelet:

                return jsonify({
                    "success": False,
                    "message": (
                        "Le bracelet ne correspond "
                        "pas à l'admission."
                    )
                }), 400

            if admission["parent_id"]:

                parent_id = admission["parent_id"]

            else:

                parent = connection.execute(
                    """
                    SELECT id
                    FROM users
                    WHERE role = 'parent'
                    AND (
                        identifiant = ?
                        OR telephone = ?
                    )
                    LIMIT 1
                    """,
                    (
                        admission["identifiant_mere"],
                        admission["telephone_mere"]
                    )
                ).fetchone()

                if parent:

                    parent_id = parent["id"]

                    connection.execute(
                        """
                        UPDATE admissions
                        SET parent_id = ?
                        WHERE id = ?
                        """,
                        (
                            parent_id,
                            admission_id
                        )
                    )

        if not parent_id:

            parent = connection.execute(
                """
                SELECT id
                FROM users
                WHERE role = 'parent'
                AND (
                    telephone = ?
                    OR (email = ? AND email != '')
                )
                LIMIT 1
                """,
                (
                    telephone_mere,
                    email_parent
                )
            ).fetchone()

            if parent:

                parent_id = parent["id"]

        if parent_id:

            parent = connection.execute(
                """
                SELECT id
                FROM users
                WHERE id = ?
                AND role = 'parent'
                """,
                (parent_id,)
            ).fetchone()

            if not parent:

                return jsonify({
                    "success": False,
                    "message": "Parent introuvable."
                }), 404

        existing_baby = connection.execute(
            """
            SELECT id
            FROM babies
            WHERE bracelet = ?
            AND bracelet != ''
            """,
            (bracelet,)
        ).fetchone()

        if existing_baby:

            return jsonify({
                "success": False,
                "message": (
                    "Ce bracelet est déjà attribué "
                    "à un bébé."
                )
            }), 400

        cursor = connection.execute(
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
                bracelet,
                tamper_alert,
                last_seen
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
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

        baby_id = cursor.lastrowid

        if admission_id:

            connection.execute(
                """
                UPDATE admissions
                SET statut = 'actif',
                    date_activation = datetime('now')
                WHERE id = ?
                """,
                (admission_id,)
            )

        connection.commit()

        return jsonify({
            "success": True,
            "message": (
                "Bébé enregistré et bracelet "
                "activé avec succès."
            ),
            "baby_id": baby_id,
            "parent_id": parent_id,
            "bracelet": bracelet
        })

    except Exception as e:

        connection.rollback()

        print(
            "Erreur création bébé :",
            e
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# BEBES D'UN PARENT
# ============================================================
@app.route(
    "/api/babies/parent/<int:parent_id>",
    methods=["GET"]
)
def get_babies_by_parent(parent_id):

    connection = get_db_connection()

    try:

        babies = connection.execute(
            """
            SELECT *
            FROM babies
            WHERE parent_id = ?
            ORDER BY id DESC
            """,
            (parent_id,)
        ).fetchall()

        return jsonify([
            dict(baby)
            for baby in babies
        ])

    finally:
        connection.close()


# ============================================================
# SITUATION DU PARENT
# ============================================================
@app.route(
    "/api/parent/<int:user_id>/situation",
    methods=["GET"]
)
def get_parent_situation(user_id):

    connection = get_db_connection()

    try:

        parent = connection.execute(
            """
            SELECT
                id,
                nom,
                prenom,
                telephone,
                email,
                identifiant,
                role
            FROM users
            WHERE id = ?
            AND role = 'parent'
            """,
            (user_id,)
        ).fetchone()

        if not parent:

            return jsonify({
                "success": False,
                "message": "Compte parent introuvable."
            }), 404

        admissions = connection.execute(
            """
            SELECT *
            FROM admissions
            WHERE parent_id = ?
            AND statut IN ('reserve', 'actif')
            ORDER BY id DESC
            """,
            (user_id,)
        ).fetchall()

        babies = connection.execute(
            """
            SELECT *
            FROM babies
            WHERE parent_id = ?
            ORDER BY id DESC
            """,
            (user_id,)
        ).fetchall()

        admission_list = []

        for admission in admissions:

            admission_dict = dict(admission)

            baby = connection.execute(
                """
                SELECT *
                FROM babies
                WHERE bracelet = ?
                AND parent_id = ?
                LIMIT 1
                """,
                (
                    admission["bracelet"],
                    user_id
                )
            ).fetchone()

            if baby:
                admission_dict["baby"] = dict(baby)
            else:
                admission_dict["baby"] = None

            admission_list.append(admission_dict)

        return jsonify({
            "success": True,
            "parent": dict(parent),
            "admissions": admission_list,
            "babies": [
                dict(baby)
                for baby in babies
            ]
        })

    except Exception as e:

        print(
            "Erreur situation parent :",
            e
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# TOUS LES BEBES
# ============================================================
@app.route("/api/babies", methods=["GET"])
def get_all_babies():

    connection = get_db_connection()

    try:

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

        return jsonify([
            dict(baby)
            for baby in babies
        ])

    finally:
        connection.close()


# ============================================================
# HISTORIQUE
# ============================================================
@app.route("/api/history", methods=["GET"])
def get_history():

    connection = get_db_connection()

    try:

        records = connection.execute(
            """
            SELECT *
            FROM bracelet_history
            ORDER BY id DESC
            """
        ).fetchall()

        return jsonify([
            dict(record)
            for record in records
        ])

    finally:
        connection.close()


# ============================================================
# AJOUTER HISTORIQUE
# ============================================================
@app.route("/api/history", methods=["POST"])
def create_history():

    data = request.get_json() or {}

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
            "message": (
                "Attribution ajoutée à l'historique."
            )
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    finally:
        connection.close()


# ============================================================
# LIBERER UN BRACELET DEPUIS UN BEBE
# ============================================================
@app.route(
    "/api/babies/<int:baby_id>/liberer-bracelet",
    methods=["POST"]
)
def liberer_bracelet(baby_id):

    connection = get_db_connection()

    try:

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

        if not baby["bracelet"]:

            return jsonify({
                "success": False,
                "message": (
                    "Aucun bracelet n'est attribué "
                    "à ce bébé."
                )
            }), 400

        date_liberation = datetime.now().strftime(
            "%d/%m/%Y"
        )

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

        connection.execute(
            """
            UPDATE babies
            SET bracelet = '',
                tamper_alert = 0,
                latitude = NULL,
                longitude = NULL,
                last_seen = NULL
            WHERE id = ?
            """,
            (baby_id,)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": (
                f'Le bracelet {baby["bracelet"]} '
                'a été libéré avec succès.'
            )
        })

    except Exception as e:

        connection.rollback()

        print(
            "Erreur libération bracelet :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Erreur lors de la libération "
                "du bracelet."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# STATISTIQUES DASHBOARD
# ============================================================
@app.route(
    "/api/dashboard/stats",
    methods=["GET"]
)
def get_dashboard_stats():

    connection = get_db_connection()

    try:

        babies_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM babies
            """
        ).fetchone()["total"]

        bracelets_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM admissions
            WHERE statut = 'actif'
            """
        ).fetchone()["total"]

        personnel_count = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM users
            WHERE role = 'personnel'
            """
        ).fetchone()["total"]

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

        print(
            "Erreur statistiques Dashboard :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Impossible de récupérer "
                "les statistiques."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# ALERTES ACTIVES
# ============================================================
@app.route(
    "/api/dashboard/alerts",
    methods=["GET"]
)
def get_recent_alerts():

    connection = get_db_connection()

    try:

        # On affiche uniquement les alertes encore actives.
        # Une alerte résolue ne doit plus apparaître
        # dans le tableau des alertes du dashboard.
        alerts = connection.execute(
            """
            SELECT *
            FROM alerts
            WHERE status = 'active'
            ORDER BY id DESC
            LIMIT 5
            """
        ).fetchall()

        return jsonify([
            dict(alert)
            for alert in alerts
        ])

    except Exception as e:

        print(
            "Erreur récupération alertes :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Impossible de récupérer "
                "les alertes."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# RECUPERER UN UTILISATEUR
# ============================================================
@app.route(
    "/api/users/<int:user_id>",
    methods=["GET"]
)
def get_user(user_id):

    connection = get_db_connection()

    try:

        user = connection.execute(
            """
            SELECT
                id,
                nom,
                prenom,
                telephone,
                identifiant,
                email,
                role
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()

        if user is None:

            return jsonify({
                "success": False,
                "message": "Utilisateur introuvable"
            }), 404

        return jsonify({
            "success": True,
            "user": dict(user)
        })

    finally:
        connection.close()


# ============================================================
# PERSONNEL
# ============================================================
@app.route(
    "/api/personnel",
    methods=["GET"]
)
def get_personnel():

    connection = get_db_connection()

    try:

        personnel = connection.execute(
            """
            SELECT
                id,
                nom,
                prenom,
                telephone,
                identifiant,
                email,
                role
            FROM users
            WHERE role = ?
            ORDER BY nom ASC, prenom ASC
            """,
            ("personnel",)
        ).fetchall()

        return jsonify([
            dict(person)
            for person in personnel
        ])

    finally:
        connection.close()


# ============================================================
# CREER ADMISSION + COMPTE PARENT
# ============================================================
@app.route(
    "/api/admissions",
    methods=["POST"]
)
def create_admission():

    data = request.get_json() or {}

    identifiant_mere = data.get("identifiant_mere")
    nom_mere = data.get("nom_mere")
    telephone_mere = data.get("telephone_mere")

    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    bracelet = data.get("bracelet")

    if (
        not identifiant_mere
        or not nom_mere
        or not telephone_mere
        or not email
        or not password
        or not confirm_password
        or not bracelet
    ):
        return jsonify({
            "success": False,
            "message": (
                "Veuillez remplir tous les "
                "champs obligatoires."
            )
        }), 400

    if password != confirm_password:

        return jsonify({
            "success": False,
            "message": (
                "Les mots de passe "
                "ne correspondent pas."
            )
        }), 400

    if len(password) < 6:

        return jsonify({
            "success": False,
            "message": (
                "Le mot de passe doit contenir "
                "au moins 6 caractères."
            )
        }), 400

    connection = get_db_connection()

    try:

        existing_bracelet = connection.execute(
            """
            SELECT id
            FROM admissions
            WHERE bracelet = ?
            AND statut IN ('reserve', 'actif')
            """,
            (bracelet,)
        ).fetchone()

        if existing_bracelet:

            return jsonify({
                "success": False,
                "message": (
                    "Ce bracelet est déjà réservé "
                    "ou actif."
                )
            }), 400

        # ====================================================
        # RECHERCHER LE PARENT
        # ====================================================

        existing_user = connection.execute(
            """
            SELECT *
            FROM users
            WHERE identifiant = ?
               OR telephone = ?
               OR (email = ? AND email != '')
            LIMIT 1
            """,
            (
                identifiant_mere,
                telephone_mere,
                email
            )
        ).fetchone()

        if existing_user:

            if existing_user["role"] != "parent":

                return jsonify({
                    "success": False,
                    "message": (
                        "Cet identifiant, email ou "
                        "téléphone est déjà utilisé "
                        "par un autre utilisateur."
                    )
                }), 400

            parent_id = existing_user["id"]

            connection.execute(
                """
                UPDATE users
                SET nom = ?,
                    telephone = ?,
                    email = ?,
                    password = ?
                WHERE id = ?
                """,
                (
                    nom_mere,
                    telephone_mere,
                    email,
                    password,
                    parent_id
                )
            )

        else:

            cursor = connection.execute(
                """
                INSERT INTO users
                (
                    nom,
                    prenom,
                    telephone,
                    identifiant,
                    email,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    nom_mere,
                    "",
                    telephone_mere,
                    identifiant_mere,
                    email,
                    password,
                    "parent"
                )
            )

            parent_id = cursor.lastrowid

        cursor = connection.execute(
            """
            INSERT INTO admissions
            (
                identifiant_mere,
                nom_mere,
                telephone_mere,
                bracelet,
                date_admission,
                statut,
                parent_id
            )
            VALUES
            (?, ?, ?, ?, datetime('now'), 'reserve', ?)
            """,
            (
                identifiant_mere,
                nom_mere,
                telephone_mere,
                bracelet,
                parent_id
            )
        )

        admission_id = cursor.lastrowid

        connection.commit()

        return jsonify({
            "success": True,
            "message": (
                "Admission et compte parent "
                "créés avec succès."
            ),
            "parent_id": parent_id,
            "admission_id": admission_id,
            "role": "parent",
            "bracelet": bracelet,
            "statut": "reserve"
        })

    except Exception as e:

        connection.rollback()

        print(
            "Erreur création admission :",
            e
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# RECUPERER TOUTES LES ADMISSIONS
# ============================================================
@app.route(
    "/api/admissions",
    methods=["GET"]
)
def get_admissions():

    connection = get_db_connection()

    try:

        admissions = connection.execute(
            """
            SELECT
                admissions.*,
                users.nom AS parent_nom,
                users.prenom AS parent_prenom,
                users.email AS parent_email
            FROM admissions
            LEFT JOIN users
                ON admissions.parent_id = users.id
            ORDER BY admissions.date_admission DESC
            """
        ).fetchall()

        return jsonify([
            dict(admission)
            for admission in admissions
        ])

    except Exception as e:

        print(
            "Erreur récupération admissions :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Impossible de récupérer "
                "les admissions."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# RECUPERER UNE ADMISSION
# ============================================================
@app.route(
    "/api/admissions/<int:admission_id>",
    methods=["GET"]
)
def get_admission(admission_id):

    connection = get_db_connection()

    try:

        admission = connection.execute(
            """
            SELECT
                admissions.*,
                users.nom AS parent_nom,
                users.prenom AS parent_prenom,
                users.email AS parent_email
            FROM admissions
            LEFT JOIN users
                ON admissions.parent_id = users.id
            WHERE admissions.id = ?
            """,
            (admission_id,)
        ).fetchone()

        if not admission:

            return jsonify({
                "success": False,
                "message": "Admission introuvable."
            }), 404

        return jsonify({
            "success": True,
            "admission": dict(admission)
        })

    except Exception as e:

        print(
            "Erreur récupération admission :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Impossible de récupérer "
                "l'admission."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# MODIFIER LE BRACELET
# ============================================================
@app.route(
    "/api/admissions/<int:admission_id>/modifier-bracelet",
    methods=["PUT"]
)
def modifier_bracelet(admission_id):

    data = request.get_json() or {}

    nouveau_bracelet = data.get("bracelet")

    if not nouveau_bracelet:

        return jsonify({
            "success": False,
            "message": (
                "L'identifiant du bracelet "
                "est obligatoire."
            )
        }), 400

    connection = get_db_connection()

    try:

        admission = connection.execute(
            """
            SELECT *
            FROM admissions
            WHERE id = ?
            """,
            (admission_id,)
        ).fetchone()

        if not admission:

            return jsonify({
                "success": False,
                "message": "Admission introuvable."
            }), 404

        existing = connection.execute(
            """
            SELECT id
            FROM admissions
            WHERE bracelet = ?
            AND statut IN ('reserve', 'actif')
            AND id != ?
            """,
            (
                nouveau_bracelet,
                admission_id
            )
        ).fetchone()

        if existing:

            return jsonify({
                "success": False,
                "message": (
                    "Ce bracelet est déjà utilisé."
                )
            }), 400

        existing_baby = connection.execute(
            """
            SELECT id
            FROM babies
            WHERE bracelet = ?
            AND bracelet != ''
            """,
            (nouveau_bracelet,)
        ).fetchone()

        if existing_baby:

            return jsonify({
                "success": False,
                "message": (
                    "Ce bracelet est déjà attribué "
                    "à un bébé."
                )
            }), 400

        connection.execute(
            """
            UPDATE admissions
            SET bracelet = ?
            WHERE id = ?
            """,
            (
                nouveau_bracelet,
                admission_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": (
                "Bracelet modifié avec succès."
            )
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# AJOUTER UN BRACELET
# ============================================================
@app.route(
    "/api/admissions/<int:admission_id>/ajouter-bracelet",
    methods=["POST"]
)
def ajouter_bracelet(admission_id):

    data = request.get_json() or {}

    nouveau_bracelet = data.get("bracelet")

    if not nouveau_bracelet:

        return jsonify({
            "success": False,
            "message": (
                "L'identifiant du bracelet "
                "est obligatoire."
            )
        }), 400

    connection = get_db_connection()

    try:

        admission = connection.execute(
            """
            SELECT *
            FROM admissions
            WHERE id = ?
            """,
            (admission_id,)
        ).fetchone()

        if not admission:

            return jsonify({
                "success": False,
                "message": (
                    "Admission introuvable."
                )
            }), 404

        existing = connection.execute(
            """
            SELECT id
            FROM admissions
            WHERE bracelet = ?
            AND statut IN ('reserve', 'actif')
            """,
            (nouveau_bracelet,)
        ).fetchone()

        if existing:

            return jsonify({
                "success": False,
                "message": (
                    "Ce bracelet est déjà utilisé."
                )
            }), 400

        existing_baby = connection.execute(
            """
            SELECT id
            FROM babies
            WHERE bracelet = ?
            AND bracelet != ''
            """,
            (nouveau_bracelet,)
        ).fetchone()

        if existing_baby:

            return jsonify({
                "success": False,
                "message": (
                    "Ce bracelet est déjà attribué "
                    "à un bébé."
                )
            }), 400

        cursor = connection.execute(
            """
            INSERT INTO admissions
            (
                identifiant_mere,
                nom_mere,
                telephone_mere,
                bracelet,
                date_admission,
                statut,
                parent_id
            )
            VALUES
            (?, ?, ?, ?, datetime('now'), 'reserve', ?)
            """,
            (
                admission["identifiant_mere"],
                admission["nom_mere"],
                admission["telephone_mere"],
                nouveau_bracelet,
                admission["parent_id"]
            )
        )

        new_admission_id = cursor.lastrowid

        connection.commit()

        return jsonify({
            "success": True,
            "message": (
                "Bracelet ajouté avec succès."
            ),
            "admission_id": new_admission_id,
            "parent_id": admission["parent_id"],
            "bracelet": nouveau_bracelet,
            "statut": "reserve"
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# ACTIVER UN BRACELET
# ============================================================
@app.route(
    "/api/admissions/<int:admission_id>/activer",
    methods=["POST"]
)
def activer_bracelet(admission_id):

    connection = get_db_connection()

    try:

        admission = connection.execute(
            """
            SELECT *
            FROM admissions
            WHERE id = ?
            """,
            (admission_id,)
        ).fetchone()

        if not admission:

            return jsonify({
                "success": False,
                "message": (
                    "Admission introuvable."
                )
            }), 404

        if admission["statut"] != "reserve":

            return jsonify({
                "success": False,
                "message": (
                    "Seul un bracelet réservé "
                    "peut être activé."
                )
            }), 400

        return jsonify({
            "success": True,
            "message": (
                "Admission prête pour "
                "l'enregistrement du bébé."
            ),
            "admission": dict(admission)
        })

    except Exception as e:

        print(
            "Erreur activation bracelet :",
            e
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        connection.close()


# ============================================================
# RETIRER UN BRACELET
# ============================================================
@app.route(
    "/api/admissions/<int:admission_id>/retirer",
    methods=["POST"]
)
def retirer_bracelet(admission_id):

    data = request.get_json() or {}

    motif = data.get(
        "motif_retrait",
        "Sortie de l’hôpital"
    )

    connection = get_db_connection()

    try:

        admission = connection.execute(
            """
            SELECT *
            FROM admissions
            WHERE id = ?
            """,
            (admission_id,)
        ).fetchone()

        if not admission:

            return jsonify({
                "success": False,
                "message": "Admission introuvable."
            }), 404

        if admission["statut"] != "actif":

            return jsonify({
                "success": False,
                "message": (
                    "Seul un bracelet actif "
                    "peut être retiré."
                )
            }), 400

        baby = connection.execute(
            """
            SELECT *
            FROM babies
            WHERE bracelet = ?
            AND parent_id = ?
            LIMIT 1
            """,
            (
                admission["bracelet"],
                admission["parent_id"]
            )
        ).fetchone()

        if baby:
            baby_name = (
                f'{baby["nom"]} {baby["prenom"]}'
            )
        else:
            baby_name = "Bébé non renseigné"

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
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                datetime('now'),
                ?
            )
            """,
            (
                admission["bracelet"],
                baby_name,
                admission["nom_mere"],
                admission["date_admission"],
                motif
            )
        )

        if baby:

            connection.execute(
                """
                UPDATE babies
                SET bracelet = '',
                    tamper_alert = 0,
                    latitude = NULL,
                    longitude = NULL,
                    last_seen = NULL
                WHERE id = ?
                """,
                (baby["id"],)
            )

        connection.execute(
            """
            UPDATE admissions
            SET statut = 'retire',
                date_retrait = datetime('now'),
                motif_retrait = ?
            WHERE id = ?
            """,
            (
                motif,
                admission_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": (
                "Bracelet retiré avec succès "
                "et attribution enregistrée "
                "dans l'historique."
            ),
            "bracelet": admission["bracelet"],
            "statut": "retire"
        })

    except Exception as e:

        connection.rollback()

        print(
            "Erreur retrait bracelet :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Erreur lors du retrait "
                "du bracelet."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# ============================================================
#        BRACELET ESP32 → SERVEUR
# ============================================================
# ============================================================

@app.route(
    "/api/bracelet/data",
    methods=["POST"]
)
def receive_bracelet_data():

    data = request.get_json() or {}

    baby_id = data.get("baby_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    tamper_alert = data.get("tamperAlert", False)

    # --------------------------------------------------------
    # VERIFICATION
    # --------------------------------------------------------

    if not baby_id:

        return jsonify({
            "success": False,
            "message": "Identifiant du bracelet manquant."
        }), 400

    # --------------------------------------------------------
    # CONVERSION SECURISEE DU TAMper
    # --------------------------------------------------------

    if isinstance(tamper_alert, str):

        tamper_alert = tamper_alert.strip().lower()

        if tamper_alert in ("true", "1", "yes", "oui"):
            tamper_alert = True

        elif tamper_alert in ("false", "0", "no", "non", ""):
            tamper_alert = False

        else:
            return jsonify({
                "success": False,
                "message": (
                    "Valeur tamperAlert invalide."
                )
            }), 400

    else:

        tamper_alert = bool(tamper_alert)

    try:

        if latitude is not None:
            latitude = float(latitude)

        if longitude is not None:
            longitude = float(longitude)

    except (ValueError, TypeError):

        return jsonify({
            "success": False,
            "message": "Données GPS invalides."
        }), 400

    connection = get_db_connection()

    try:

        now = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        # ====================================================
        # RECHERCHER LE BEBE PAR NUMERO DE BRACELET
        # ====================================================

        baby = connection.execute(
            """
            SELECT *
            FROM babies
            WHERE bracelet = ?
            AND bracelet != ''
            LIMIT 1
            """,
            (baby_id,)
        ).fetchone()

        # ====================================================
        # IDENTIFIANT REEL DU BRACELET
        # ====================================================

        bracelet_label = (
            baby["bracelet"]
            if baby
            else baby_id
        )

        # ====================================================
        # ENREGISTRER LA TELEMETRIE
        # ====================================================

        connection.execute(
            """
            INSERT INTO bracelet_telemetry
            (
                baby_id,
                latitude,
                longitude,
                tamper_alert,
                received_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                baby_id,
                latitude,
                longitude,
                1 if tamper_alert else 0,
                now
            )
        )

        # ====================================================
        # METTRE A JOUR LE BEBE
        # ====================================================

        if baby:

            connection.execute(
                """
                UPDATE babies
                SET latitude = ?,
                    longitude = ?,
                    tamper_alert = ?,
                    last_seen = ?
                WHERE id = ?
                """,
                (
                    latitude,
                    longitude,
                    1 if tamper_alert else 0,
                    now,
                    baby["id"]
                )
            )

        # ====================================================
        # 🚨 TAMPER = TRUE
        # ====================================================

        if tamper_alert:

            # Vérifier si une alerte active existe déjà
            existing_alert = connection.execute(
                """
                SELECT id
                FROM alerts
                WHERE bracelet = ?
                AND type = 'tamper'
                AND status = 'active'
                LIMIT 1
                """,
                (bracelet_label,)
            ).fetchone()

            # Si aucune alerte active n'existe,
            # on en crée une.
            if not existing_alert:

                # Le message utilise le numéro
                # du bracelet et non le nom du bébé.
                message = (
                    f"ALERTE : tentative de retrait "
                    f"du bracelet {bracelet_label}."
                )

                connection.execute(
                    """
                    INSERT INTO alerts
                    (
                        type,
                        message,
                        bracelet,
                        status,
                        created_at
                    )
                    VALUES
                    (
                        'tamper',
                        ?,
                        ?,
                        'active',
                        ?
                    )
                    """,
                    (
                        message,
                        bracelet_label,
                        now
                    )
                )

        # ====================================================
        # 🟢 TAMPER = FALSE
        # ====================================================

        else:

            # Le bracelet est revenu à son état normal.
            # On résout l'alerte active correspondante.
            connection.execute(
                """
                UPDATE alerts
                SET status = 'resolved'
                WHERE bracelet = ?
                AND type = 'tamper'
                AND status = 'active'
                """,
                (bracelet_label,)
            )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Données du bracelet reçues.",
            "baby_found": bool(baby),
            "baby_id": baby["id"] if baby else None,
            "bracelet": bracelet_label,
            "latitude": latitude,
            "longitude": longitude,
            "tamperAlert": tamper_alert,
            "last_seen": now
        })

    except Exception as e:

        connection.rollback()

        print(
            "Erreur réception données bracelet :",
            e
        )

        return jsonify({
            "success": False,
            "message": (
                "Erreur lors de la réception "
                "des données du bracelet."
            )
        }), 500

    finally:
        connection.close()


# ============================================================
# RECUPERER LES DONNEES D'UN BRACELET
# ============================================================
@app.route(
    "/api/bracelet/<string:bracelet>/telemetry",
    methods=["GET"]
)
def get_bracelet_telemetry(bracelet):

    connection = get_db_connection()

    try:

        data = connection.execute(
            """
            SELECT *
            FROM bracelet_telemetry
            WHERE baby_id = ?
            ORDER BY id DESC
            LIMIT 50
            """,
            (bracelet,)
        ).fetchall()

        return jsonify([
            dict(item)
            for item in data
        ])

    finally:
        connection.close()


# ============================================================
# ETAT ACTUEL D'UN BRACELET
# ============================================================
@app.route(
    "/api/bracelet/<string:bracelet>",
    methods=["GET"]
)
def get_bracelet_status(bracelet):

    connection = get_db_connection()

    try:

        baby = connection.execute(
            """
            SELECT
                id,
                nom,
                prenom,
                bracelet,
                latitude,
                longitude,
                tamper_alert,
                last_seen,
                parent_id
            FROM babies
            WHERE bracelet = ?
            AND bracelet != ''
            LIMIT 1
            """,
            (bracelet,)
        ).fetchone()

        if not baby:

            return jsonify({
                "success": False,
                "message": (
                    "Bracelet ou bébé introuvable."
                )
            }), 404

        return jsonify({
            "success": True,
            "baby": dict(baby)
        })

    finally:
        connection.close()


# ============================================================
# LANCER LE SERVEUR
# ============================================================
if __name__ == "__main__":
    app.run(debug=True)