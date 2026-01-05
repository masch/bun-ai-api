dev:
	bun --watch run index.ts

test:
	curl -N -X POST http://localhost:3000/chat \
		 -H "Content-Type: application/json" \
		 -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

install:
	bun install
