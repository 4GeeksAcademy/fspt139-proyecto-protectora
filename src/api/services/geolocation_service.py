import ipaddress
import requests
from api.utils import APIException
import math

RADIO_TIERRA_KM = 6371  # para convertir el map_positioning en cercania


# convierte un map_positioning "lat,lng" en floats (tupla)
def parse_map_positioning(valor):
    if not isinstance(valor, str):
        return None

    partes = [parte.strip() for parte in valor.split(",")]
    if len(partes) != 2 or "" in partes:
        return None

    try:
        lat, lng = float(partes[0]), float(partes[1])
    except ValueError:
        return None

    if not (math.isfinite(lat) and math.isfinite(lng)) or abs(lat) > 90 or abs(lng) > 180:
        return None

    return lat, lng


# distancia en km entre dos tuplas (lat, lng) usando la formula de haversine
def distance_km(origen, destino):
    lat1, lng1 = map(math.radians, origen)
    lat2, lng2 = map(math.radians, destino)

    a = (math.sin((lat2 - lat1) / 2) ** 2
         + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2)

    return 2 * RADIO_TIERRA_KM * math.asin(math.sqrt(a))

IP_API_URL = "http://ip-api.com/json/{ip}"
IP_API_TIMEOUT_SECONDS = 3

# LLAMADA EXTERNA A API #1
# BUSCAMOS EL POSICIONAMIENTO DE LA IP DEL CLIENTE Y LA UTILIZAMOS PARA EN CASO DE NO ACEPTAR EL POSICIONAMIENTO DEL NAVEGADOR/APP LOCALIZAR DE ENTRADA



# resuelve la ubicacion aproximada de una IP publica via ip-api.com (gratuito, sin api key)
# devuelve None si la IP es privada/loopback o si el servicio externo falla por cualquier motivo
def locate_ip(ip):
#     ip = '8.8.8.8'
    if not ip:
        return None

    try:
        parsed_ip = ipaddress.ip_address(ip)
    except ValueError:
        return None

    if parsed_ip.is_private or parsed_ip.is_loopback:
        return None

    try:
        response = requests.get(IP_API_URL.format(ip=ip), timeout=IP_API_TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        return None

    if data.get("status") != "success":
        return None

    return f"{data.get('lat')},{data.get('lon')}"
#     return {
#         "map_positioning": f"{data.get('lat')},{data.get('lon')}",
#         "latitude": data.get("lat"),
#         "longitude": data.get("lon"),
#         "city": data.get("city"),
#         "country": data.get("country"),
#     }

# LLAMADA EXTERNA A API #2
# CASE para retornar el map_positioning a traves del API externo en base a un string de direccion

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_TIMEOUT_SECONDS = 5
NOMINATIM_USER_AGENT = "protectora_testgeo"


# retorna un objeto con map_positioning (y otros campos que valoramos incluirlos en futuras versiones como info regional)
def locate_address(direccion):
    direccion = (direccion or "").strip()
    if not direccion:
        raise APIException("No has introducido una dirección", status_code=400)

    try:
        response = requests.get(
            NOMINATIM_URL,
            params={"q": direccion, "format": "json", "limit": 1, "addressdetails": 1},
            headers={"User-Agent": NOMINATIM_USER_AGENT},
            timeout=NOMINATIM_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        resultados = response.json()
    except requests.RequestException:
        raise APIException("No se ha podido contactar con el api de Nominatim", status_code=502)

    if not resultados:
        raise APIException("No se ha encontrado esa dirección", status_code=404)

    resultado = resultados[0]  # nominatim devuelve un array de resultados, nos quedamos con el primero
    address = resultado.get("address") or {}
    lat = resultado.get("lat")
    lon = resultado.get("lon")

    return {
        "lat": lat,
        "lon": lon,
        "village": address.get("village"),
        "postcode": address.get("postcode"),
        "state_district": address.get("state_district"),
        "country": address.get("country"),
        "country_code": address.get("country_code"),
        "display_name": resultado.get("display_name"),
        "map_positioning": f"{lat},{lon}" if lat and lon else None,
    }