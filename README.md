# Plataforma de Descubrimiento y Reseñas de Libros

## 1️. URL de Producción
[Vercel](https://progra-entrega10-6mwt.vercel.app)

## 2️. Cómo correr localmente
### Requisitos
- Node.js 20+
- NPM
- Docker Desktop (opcional, para usar la imagen)

### Comandos
```bash
# Desarrollo
npm run dev

# Build producción
npm run build
npm run start

# Tests
npm run test      # watch
npm run test:ci   # modo CI

# Typecheck
npm run typecheck

## 3. Docker (opcional)
# Loguearse en GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YamiCaviglione --password-stdin

# Descargar imagen
docker pull ghcr.io/yamicaviglione/progra-entrega10:latest

# Ejecutar app local
docker run -p 3000:3000 ghcr.io/yamicaviglione/progra-entrega10:latest

- Abrir http://localhost:3000 para verificar la app

## 4. Variables de entorno
Actualmente no hay obligatorias, pero si se agregan se deben usar NEXT_PUBLIC_*

## 5. GitHub Actions (CI/CD)

a. Build en Pull Requests

- Archivo: .github/workflows/ci-build.yml
- Se ejecuta en cada PR a main.
- Instala dependencias, chequea tipos y build de Next.js.
- PR falla si el build falla.

b. Tests en Pull Requests
- Archivo: .github/workflows/ci-test.yml
- Se ejecuta en cada PR a main.
- Ejecuta todos los tests con Vitest en modo CI.
- PR falla si algún test no pasa.

c. Docker a GHCR
- Archivo: .github/workflows/docker-publish.yml
- Se ejecuta al mergear a main.
- Construye la imagen Docker y la publica en GitHub Container Registry.
- Tags: latest y hash del commit.

## 6. Links Importantes
- Run de CI Build: https://github.com/YamiCaviglione/Progra-Entrega10/actions/runs/17360213881/job/49279236721
- Run de CI Test: https://github.com/YamiCaviglione/Progra-Entrega10/actions/runs/17360213876/job/49279236699
- Paquete GHCR: https://github.com/YamiCaviglione/Progra-Entrega10/pkgs/container/progra-entrega10 

# Badges 
## Estado del proyecto

![CI Build](https://github.com/YamiCaviglione/Progra-Entrega10/actions/workflows/ci-build.yml/badge.svg)

![CI Test](https://github.com/YamiCaviglione/Progra-Entrega10/actions/workflows/ci-test.yml/badge.svg)

![Docker](https://github.com/YamiCaviglione/Progra-Entrega10/pkgs/container/progra-entrega10/badge)
