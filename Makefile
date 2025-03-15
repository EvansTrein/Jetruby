default: run
.PHONY: run

run:
	npm run start

dev:
	npm run start:dev

run-docker-compose:
	docker compose --env-file configLocal.env up --build -d

