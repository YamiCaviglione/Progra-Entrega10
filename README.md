# Proyecto: Plataforma de Reviews de Libros con Autenticación y Base de Datos

## Descripción General

Este proyecto extiende la plataforma de descubrimiento y reseñas de libros del ejercicio 9, agregando integración completa con base de datos NoSQL (MongoDB) y un sistema robusto de autenticación y autorización. La aplicación permite a los usuarios registrarse, autenticarse y gestionar reseñas de libros con persistencia de datos y control de acceso.

## Arquitectura y Tecnologías Implementadas

### Stack Tecnológico
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Node.js
- **Base de Datos**: MongoDB Atlas (NoSQL)
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Zod schemas
- **Testing**: Vitest + Testing Library
- **Estado Global**: React Query (TanStack Query)
- **Seguridad**: bcryptjs para hash de contraseñas

### Integración con MongoDB

#### Configuración de Conexión
```typescript
// lib/mongodb.ts
export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  // Manejo de cache global para evitar múltiples conexiones en desarrollo
  return await mongoose.connect(MONGODB_URI);
}
```

## Sistema de Autenticación y Autorización

### Flujo de Autenticación

1. **Registro de Usuario**
   - Validación de datos con Zod
   - Hash de contraseña con bcryptjs (salt rounds: 12)
   - Generación automática de JWT token
   - Almacenamiento en httpOnly cookies

2. **Login**
   - Verificación de credenciales
   - Comparación de hash con bcrypt.compare()
   - Generación de JWT token con expiración de 7 días
   - Configuración de cookie segura

3. **Middleware de Autorización**
```typescript
// lib/auth.ts
export function requireAuth(handler: Function) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }
      
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}
```

### Protección de Rutas

**Rutas Protegidas:**
- `POST /api/reviews/create` - Crear reseñas
- `PUT /api/reviews/[id]` - Editar reseñas propias
- `DELETE /api/reviews/[id]` - Eliminar reseñas propias
- `POST /api/votes/create` - Votar reseñas
- `POST /api/users/favorites` - Gestionar favoritos

**Autorización Granular:**
```typescript
// Solo el autor puede editar/eliminar sus reseñas
const review = await Review.findById(reviewId);
if (review.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ error: "No autorizado" });
}
```

## Funcionalidades Extendidas Implementadas

### 1. Sistema de Reseñas con Persistencia
- **Creación**: Solo usuarios autenticados pueden escribir reseñas
- **Edición**: Solo el autor puede modificar sus reseñas
- **Eliminación**: Solo el autor puede eliminar sus reseñas
- **Constrains**: Un usuario solo puede reseñar un libro una vez (unique index)

### 2. Sistema de Votaciones
- **Funcionalidad Toggle**: El mismo voto se cancela, diferente voto se actualiza
- **Persistencia**: Almacenamiento en MongoDB con referencias Usuario-Reseña
- **Autorización**: Solo usuarios autenticados pueden votar

### 3. Perfil de Usuario
- **Historial de Reseñas**: Visualización de todas las reseñas del usuario
- **Información Personal**: Nombre, email, fecha de registro
- **Integración con Google Books**: Obtención automática de títulos de libros

### 4. Sistema de Favoritos
- **Agregar/Quitar**: Toggle de libros favoritos por usuario
- **Persistencia**: Array de bookIds en el modelo User
- **Visualización**: Página dedicada con lista de favoritos

## Validación de Datos con Zod

### Schemas Implementados
```typescript
// Registro de usuario
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().optional()
});

// Creación de reseña
const reviewSchema = z.object({
  bookId: z.string().min(1, "Falta el bookId"),
  rating: z.number().min(1).max(5, "Rating entre 1-5"),
  text: z.string().optional()
});

// Votación
const voteSchema = z.object({
  reviewId: z.string().min(1, "Falta reviewId"),
  vote: z.number().refine(val => [-1, 1].includes(val), "Voto debe ser -1 o +1")
});
```

### Middleware de Validación
```typescript
export function validateBody<T>(schema: ZodSchema<T>, handler: Function) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    req.body = parsed.data;
    return handler(req, res);
  };
}
```

## Estado Global con React Query

### Hooks Personalizados Implementados

```typescript
// Autenticación
export const useCurrentUser = () => useQuery({
  queryKey: ['currentUser'],
  queryFn: fetchCurrentUser
});

export const useLogin = () => useMutation({
  mutationFn: loginUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentUser'] })
});

// Reseñas
export const useReviews = (bookId: string) => useQuery({
  queryKey: ['reviews', bookId],
  queryFn: () => fetchReviews(bookId)
});

// Favoritos
export const useFavorites = (user: User) => useQuery({
  queryKey: ['favorites', user?._id],
  queryFn: () => fetchFavorites(),
  enabled: !!user
});
```

## Testing 

### Suite de Tests: 27 Tests Totales

## 🚀 **Comandos de Ejecución**

```bash
# Ejecutar todos los tests
npm test                          # Modo watch
npm run test:ci                   # Modo CI (run once)

# Verificación de tipos
npm run typecheck                 # TypeScript type checking

# Servidor de desarrollo  
npm run dev                       # http://localhost:3000

# Build producción
npm run build                     # Build optimizado
npm start                         # Servidor producción
```
## Conclusión

El proyecto cumple exitosamente todos los requisitos de la consigna:

✅ **Integración MongoDB completa** con modelos User, Review, Vote  
✅ **Sistema de autenticación robusto** con JWT y bcrypt  
✅ **Autorización granular** para operaciones CRUD  
✅ **Funcionalidades extendidas** (perfil, favoritos, votaciones)  
✅ **Validación comprehensiva** con Zod  
✅ **Testing completo** manteniendo y extendiendo ejercicio 9  
✅ **API Google Books** mantenida del ejercicio anterior  
