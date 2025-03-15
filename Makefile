default: run
.PHONY: run

run:
	npm run start

run-docker-compose:
	docker compose --env-file configLocal.env up --build -d

