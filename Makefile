.ONESHELL:
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

.PHONY: help reset-db seed

help:
	@echo "make reset-db  - fuerza reset de migraciones y bbdd"
	@echo "make seed      - repobla datos de prueba via /api/seed (requiere backend arrancado con 'pipenv run start') y .env configurado con url del backend"

## Resetea la bbdd
reset-db:
	[ -f migrations/env.py ] || { rm -rf migrations && pipenv run init; }
	pipenv run flask db stamp base --purge
	pipenv run flask shell <<'EOF'
	from api.models import db
	db.drop_all()
	EOF
	rm -rf migrations
	pipenv run init
	pipenv run migrate
	pipenv run upgrade
	@echo "Base de datos reseteada correctamente"

## Lee VITE_BACKEND_URL de .env y llama a /api/seed contra esa URL. Lo mismo que entrar a mano en la url puerto 3001 y darle al link de Seed
seed:
	url=$$(grep -E '^VITE_BACKEND_URL=' .env 2>/dev/null | tail -n1 | cut -d '=' -f2- | tr -d "\"'\r")
	if [ -z "$$url" ]; then
		echo "VITE_BACKEND_URL no esta definida en .env" >&2
		exit 1
	fi
	curl -sf "$$url/api/seed" && echo "Datos de prueba insertados en $$url"

# Instala ambas dependencias
install: install-back install-front

# Instala dependencias del frontend de forma interactiva
install-front:
	@echo "==> Instalando dependencias del Frontend (npm)..."
	npm install

# Instala dependencias del backend de forma interactiva
install-back:
	@echo "==> Instalando dependencias del Backend (pipenv)..."
	pipenv install


# --- EJECUCIÓN ---
run:
	@echo "==> Iniciando Backend y Frontend..."
	$(MAKE) -j2 run-back run-front

run-front:
	@echo "==> Iniciando servidor Frontend..."
	npm run start

run-back:
	@echo "==> Iniciando servidor Backend..."
	pipenv run start	