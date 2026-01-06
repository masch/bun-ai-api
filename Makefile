API_URL ?= http://localhost:3000

dev:
	bun --watch run index.ts

test:
	curl -N -X POST $(API_URL)/chat \
		 -H "Content-Type: application/json" \
		 -d '{"messages": [{"role": "user", "content": "Hello! Can you tell me your AI model name and version?"}]}'

install:
	bun install
