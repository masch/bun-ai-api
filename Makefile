API_URL ?= http://localhost:3000

.PHONY: dev test test-integration install health lint format check

dev:
	bun --watch run index.ts

test:
	bun test

test-integration:
	curl -N -X POST $(API_URL)/chat \
		 -H "Content-Type: application/json" \
		 -d '{"messages": [{"role": "user", "content": "Hello! Can you tell me your AI model name and version?"}]}'

install:
	bun install

health:
	curl -i $(API_URL)/healthcheck

lint:
	bun biome lint .

format:
	bun biome format . --write

check:
	bun biome check --write .
