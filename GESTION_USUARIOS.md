# Sistema de Gestión de Usuarios

Este documento describe el sistema de gestión de usuarios y roles implementado en el Portal de Noticias.

## Roles de Usuario

El sistema cuenta con 4 roles diferentes:

1. **Admin (Administrador)**: Acceso completo al sistema, incluyendo gestión de usuarios
2. **Editor**: Puede crear, editar y eliminar noticias
3. **User (Usuario)**: Puede leer noticias y comentar
4. **Guest (Invitado)**: Solo lectura de noticias

## Funcionalidades del Administrador

Los administradores tienen acceso a un panel de gestión de usuarios donde pueden:

- ✅ Ver lista completa de usuarios
- ✅ Ver estadísticas de usuarios (total, activos, inactivos, por rol)
- ✅ Cambiar el rol de cualquier usuario
- ✅ Activar/Desactivar usuarios
- ✅ Eliminar usuarios
- ✅ Ver información detallada de cada usuario (fecha de registro, último acceso)

### Restricciones de Seguridad

- Un administrador **NO puede** cambiar su propio rol
- Un administrador **NO puede** desactivar su propia cuenta
- Un administrador **NO puede** eliminar su propia cuenta

## Crear Usuario Administrador Inicial

Para crear el primer usuario administrador, ejecuta el siguiente comando en el directorio del servidor:

```bash
npm run create-admin
```

Esto creará un usuario administrador con las siguientes credenciales:

- **Email**: admin@portalnoticias.com
- **Password**: admin123
- **Rol**: admin

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer inicio de sesión por seguridad.

## Acceder al Panel de Administración

1. Inicia sesión con una cuenta de administrador
2. En el header aparecerá el botón "Gestión Usuarios"
3. Haz clic en el botón para acceder al panel de administración

## API Endpoints

### Obtener todos los usuarios

```
GET /api/users
Headers: Authorization: Bearer <token>
Requiere: Rol Admin
```

### Obtener estadísticas de usuarios

```
GET /api/users/stats
Headers: Authorization: Bearer <token>
Requiere: Rol Admin
```

### Obtener usuario por ID

```
GET /api/users/:id
Headers: Authorization: Bearer <token>
Requiere: Rol Admin
```

### Cambiar rol de usuario

```
PUT /api/users/:id/rol
Headers: Authorization: Bearer <token>
Body: { "rol": "admin" | "editor" | "user" | "guest" }
Requiere: Rol Admin
```

### Cambiar estado de usuario (activar/desactivar)

```
PUT /api/users/:id/estado
Headers: Authorization: Bearer <token>
Body: { "activo": true | false }
Requiere: Rol Admin
```

### Eliminar usuario

```
DELETE /api/users/:id
Headers: Authorization: Bearer <token>
Requiere: Rol Admin
```

## Estructura de Archivos

### Backend

- `server/src/controllers/userController.ts` - Controlador de gestión de usuarios
- `server/src/routes/userRoutes.ts` - Rutas de la API
- `server/src/middleware/auth.ts` - Middleware de autenticación y autorización
- `server/scripts/crearAdmin.ts` - Script para crear admin inicial

### Frontend

- `front/src/components/GestionUsuarios.tsx` - Componente del panel de administración
- `front/src/components/GestionUsuarios.css` - Estilos del panel

## Seguridad

- Todas las rutas de gestión de usuarios están protegidas con autenticación JWT
- Solo los usuarios con rol `admin` pueden acceder a las funcionalidades de gestión
- Las contraseñas se hashean con bcrypt antes de guardarse en la base de datos
- Los tokens JWT expiran después de 30 días

## Próximas Mejoras

- [ ] Búsqueda y filtrado de usuarios
- [ ] Paginación en la tabla de usuarios
- [ ] Exportar lista de usuarios a CSV
- [ ] Historial de cambios de roles
- [ ] Notificaciones por email cuando se cambia el rol de un usuario
