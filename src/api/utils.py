from flask import jsonify, request, url_for

class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"


# valida y monta la paginacion (page, per_page) a partir del query string; comun a las rutas de listado
def paginate_args():
    DEFAULT_PAGE = 1
    DEFAULT_PER_PAGE = 10
    MAX_PER_PAGE = 100

    try:
        page = int(request.args.get('page', DEFAULT_PAGE))
    except ValueError:
        page = DEFAULT_PAGE

    try:
        per_page = int(request.args.get('per_page', DEFAULT_PER_PAGE))
    except ValueError:
        per_page = DEFAULT_PER_PAGE

    page = max(page, 1)
    per_page = min(max(per_page, 1), MAX_PER_PAGE)

    return page, per_page


# obtiene la IP real del cliente; si hay proxy delante, X-Forwarded-For trae la IP original en el primer valor
def get_client_ip():
    return '62.57.176.122'

    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:


        return forwarded_for.split(',')[0].strip()
    return request.remote_addr