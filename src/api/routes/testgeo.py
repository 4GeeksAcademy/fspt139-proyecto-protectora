import requests
from flask import request, render_template_string, jsonify


from . import api


API_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_TIMEOUT_SECONDS = 5
NOMINATIM_USER_AGENT = "protectora_testgeo"


# convierte una direccion en obeto addres con coordenadas que guardar en el shelter
@api.route('/testgeo', methods=['GET'])
def testgeo_nominatim_action():

#     direccion = ""
    direccion = "carrer major 33, albalat dels sorells" # request.args.get('direccion', '').strip()



    if not direccion:
        return jsonify({"error": "Falta direccion"}), 400

    try:
        response = requests.get(
            API_URL,
            params={"q": direccion, "format": "json", "limit": 1, "addressdetails": 1},
#             params={"city": "albalat dels sorells", "format": "geojson", "limit": 10},
            headers={"User-Agent": NOMINATIM_USER_AGENT},
            timeout=NOMINATIM_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        resultados = response.json()
#         return jsonify(resultados)

    except requests.RequestException:
        return jsonify({"error": "No se ha podido contactar con el api"}), 502

    if not resultados:
        return jsonify({"error": "No se ha encontrado esa dirección"}), 404

    resultado = resultados[0] # //devuelve un array de resultados

    return jsonify({
        "lat": resultado.get("lat"),
        "lon": resultado.get("lon"),
        "village": resultado.get('address').get("village"),
        "postcode": resultado.get('address').get("postcode"),
        "state_district": resultado.get('address').get("state_district"),
        "country": resultado.get('address').get("country"),
        "country_code": resultado.get('address').get("country_code"),
        "display_name": resultado.get("display_name"),
        "map_positioning": f"{ resultado.get("lat")},{ resultado.get("lon")}",
    }), 200
