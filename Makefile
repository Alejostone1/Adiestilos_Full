# Makefile para Adi Estilos - Gestión simplificada de comandos

.PHONY: help install dev build start stop clean docker-up docker-down docker-build

# Variables
BACKEND_DIR = Backend
FRONTEND_DIR = Frontend

# Colores para output
GREEN = \033[0;32m
BLUE = \033[0;34m
YELLOW = \033[1;33m
NC = \033[0m # No Color

# Comandos principales
help: ## Mostrar ayuda
	@echo "$(BLUE)🛍️  Adi Estilos - Sistema de Gestión$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Instalar dependencias de backend y frontend
	@echo "$(BLUE)📦 Instalando dependencias...$(NC)"
	@cd $(BACKEND_DIR) && npm install
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ Dependencias instaladas$(NC)"

dev: ## Ejecutar desarrollo completo (backend + frontend)
	@echo "$(BLUE)🚀 Iniciando desarrollo...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@make -j2 dev-backend dev-frontend

dev-backend: ## Ejecutar solo backend en modo desarrollo
	@echo "$(BLUE)🔧 Iniciando backend...$(NC)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend: ## Ejecutar solo frontend en modo desarrollo
	@echo "$(BLUE)🎨 Iniciando frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

build: ## Construir para producción
	@echo "$(BLUE)🔨 Construyendo para producción...$(NC)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✅ Build completado$(NC)"

start: ## Iniciar en modo producción
	@echo "$(BLUE)🏭 Iniciando producción...$(NC)"
	@cd $(BACKEND_DIR) && npm run start

stop: ## Detener servicios en ejecución
	@echo "$(BLUE)🛑 Deteniendo servicios...$(NC)"
	@pkill -f "node.*server.js" || true
	@pkill -f "vite" || true
	@echo "$(GREEN)✅ Servicios detenidos$(NC)"

clean: ## Limpiar archivos generados
	@echo "$(BLUE)🧹 Limpiando archivos...$(NC)"
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/node_modules/.vite
	@rm -rf $(BACKEND_DIR)/uploads/temp
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# Comandos Docker
docker-up: ## Levantar servicios con Docker Compose
	@echo "$(BLUE)🐳 Levantando servicios Docker...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Servicios Docker iniciados$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3000$(NC)"

docker-down: ## Detener servicios Docker
	@echo "$(BLUE)🐳 Deteniendo servicios Docker...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Servicios Docker detenidos$(NC)"

docker-build: ## Construir imágenes Docker
	@echo "$(BLUE)🏗️  Construyendo imágenes Docker...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✅ Imágenes Docker construidas$(NC)"

docker-logs: ## Ver logs de servicios Docker
	@docker-compose logs -f

# Comandos de base de datos
db-migrate: ## Ejecutar migraciones de Prisma
	@echo "$(BLUE)🗄️  Ejecutando migraciones...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma migrate dev
	@echo "$(GREEN)✅ Migraciones completadas$(NC)"

db-seed: ## Ejecutar seed de base de datos
	@echo "$(BLUE)🌱 Ejecutando seed...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma db seed
	@echo "$(GREEN)✅ Seed completado$(NC)"

db-studio: ## Abrir Prisma Studio
	@echo "$(BLUE)📊 Abriendo Prisma Studio...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma studio

# Comandos de testing
test: ## Ejecutar tests
	@echo "$(BLUE)🧪 Ejecutando tests...$(NC)"
	@cd $(BACKEND_DIR) && npm test
	@cd $(FRONTEND_DIR) && npm run test
	@echo "$(GREEN)✅ Tests completados$(NC)"

lint: ## Ejecutar linter
	@echo "$(BLUE)🔍 Ejecutando linter...$(NC)"
	@cd $(FRONTEND_DIR) && npm run lint
	@echo "$(GREEN)✅ Linting completado$(NC)"

# Comandos de deployment
deploy-prep: ## Preparar para deployment
	@echo "$(BLUE)📦 Preparando deployment...$(NC)"
	@make clean
	@make build
	@echo "$(GREEN)✅ Preparación completada$(NC)"

# Información del proyecto
info: ## Mostrar información del proyecto
	@echo "$(BLUE)🛍️  Adi Estilos - Información del Proyecto$(NC)"
	@echo ""
	@echo "$(YELLOW)📁 Estructura:$(NC)"
	@echo "  ├── backend/     API REST (Node.js + Express + Prisma)"
	@echo "  ├── frontend/    Aplicación React (Vite + Tailwind)"
	@echo "  ├── database/    Scripts y backups de BD"
	@echo "  └── nginx/       Configuración del servidor web"
	@echo ""
	@echo "$(YELLOW)🚀 Servicios:$(NC)"
	@echo "  ├── PostgreSQL   Base de datos"
	@echo "  ├── Backend      API REST"
	@echo "  ├── Frontend     Aplicación web"
	@echo "  └── Nginx        Proxy reverso"
	@echo ""
	@echo "$(YELLOW)🔗 URLs:$(NC)"
	@echo "  ├── Frontend:    http://localhost:5173"
	@echo "  ├── Backend:     http://localhost:3000"
	@echo "  └── API Docs:    http://localhost:3000/api/docs"
