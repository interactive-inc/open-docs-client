# Deploy client (with checks and tests)
deploy:
	bun biome check . --fix --unsafe
	bun test
	bun check
	bun build
	bun deploy

# Run all checks
check:
	bun biome check . --fix --unsafe
	bun run check
	bun test

build:
	bun run build

install:
	rm -f bun.lock
	rm -rf node_modules
	bun i
	bun run build
