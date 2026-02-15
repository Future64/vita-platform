# ═══════════════════════════════════════════════════════════════════
#  VITA Platform — Makefile
# ═══════════════════════════════════════════════════════════════════

BACKEND_DIR  = services/vita-core
DATABASE_URL = postgres://vita:vita@localhost:5432/vita_db

.PHONY: db db-stop migrate backend test-api dev clean check test

# ── Database ─────────────────────────────────────────────────────

## Start PostgreSQL only (via Docker)
db:
	docker compose up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@until docker compose exec postgres pg_isready -U vita -d vita_db > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "✅ PostgreSQL is ready on localhost:5432"

## Stop PostgreSQL
db-stop:
	docker compose down

# ── Migrations ───────────────────────────────────────────────────

## Apply SQL migrations
migrate: db
	@echo "🔄 Running migrations..."
	DATABASE_URL=$(DATABASE_URL) psql -h localhost -U vita -d vita_db -f $(BACKEND_DIR)/migrations/001_initial.sql
	@echo "✅ Migrations applied"

# ── Backend ──────────────────────────────────────────────────────

## Compile and run the Rust backend
backend:
	cd $(BACKEND_DIR) && DATABASE_URL=$(DATABASE_URL) cargo run

## Type-check the backend (no run)
check:
	cd $(BACKEND_DIR) && cargo check

## Run unit tests
test:
	cd $(BACKEND_DIR) && cargo test

# ── Integration tests ────────────────────────────────────────────

## Run the API integration tests (backend must be running)
test-api:
	@chmod +x test_api.sh
	./test_api.sh

# ── Development ──────────────────────────────────────────────────

## Full dev setup: db + migrate + backend
dev: db migrate backend

# ── Cleanup ──────────────────────────────────────────────────────

## Stop everything and remove volumes
clean:
	docker compose down -v
	@echo "🧹 Cleaned up"
