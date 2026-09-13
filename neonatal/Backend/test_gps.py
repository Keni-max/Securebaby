import requests
import time

URL = "https://kenimax.pythonanywhere.com/api/bracelet/data"
positions = [
    (3.848000, 11.502000),
    (3.848500, 11.502500),
    (3.849000, 11.503000),
    (3.849500, 11.503500),
    (3.850000, 11.504000),
]

for latitude, longitude in positions:

    data = {
        "baby_id": "BR-073",
        "latitude": latitude,
        "longitude": longitude,
        "tamper_alert": False
    }

    try:
        response = requests.post(URL, json=data)

        print("Position envoyée :", latitude, longitude)
        print("Statut :", response.status_code)
        print("Réponse :", response.text)
        print("-" * 50)

    except Exception as e:
        print("Erreur :", e)

    time.sleep(5)