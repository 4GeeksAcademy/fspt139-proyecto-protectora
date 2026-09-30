from api.models import Shelter, db
from api.services.geolocation_service import distance_km, parse_map_positioning


def order_by_shelter_proximity(columna, near):
    origen = parse_map_positioning(near)
    if origen is None:
        return None

    distancias = []
    for shelter_pk, map_positioning in db.session.execute(db.select(Shelter.id, Shelter.map_positioning)):
        posicion = parse_map_positioning(map_positioning)
        if posicion is not None:
            distancias.append((distance_km(origen, posicion), shelter_pk))

    if not distancias:
        return None

    ranking = {shelter_pk: puesto for puesto,
               (_, shelter_pk) in enumerate(sorted(distancias))}
    return db.case(ranking, value=columna, else_=len(ranking))
