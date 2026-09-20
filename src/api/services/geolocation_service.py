import ipaddress

import requests

IP_API_URL = "http://ip-api.com/json/{ip}"
IP_API_TIMEOUT_SECONDS = 3

# LLAMADA EXTERNA A API #1
# BUSCAMOS EL POSICIONAMIENTO DE LA IP DEL CLIENTE Y LA UTILIZAMOS PARA EN CASO DE NO ACEPTAR EL POSICIONAMIENTO DEL NAVEGADOR/APP LOCALIZAR DE ENTRADA



# resuelve la ubicacion aproximada de una IP publica via ip-api.com (gratuito, sin api key)
# devuelve None si la IP es privada/loopback o si el servicio externo falla por cualquier motivo
def locate_ip(ip):
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
