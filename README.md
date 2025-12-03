# Click & Buy - E-commerce de Cartas Pokémon TCG

## Descripción del Proyecto

Click & Buy es una aplicación e-commerce completa para la compra y venta de cartas individuales de Pokémon TCG. El proyecto implementa **Arquitectura Limpia** y consta de:

- **Frontend**: Aplicación web vanilla JavaScript con arquitectura en capas
- **Backend**: API REST con Express.js y PostgreSQL (Neon Database)

---

## Tecnologías Utilizadas

### Frontend
- HTML5, CSS3, JavaScript (ES6 Modules)
- Arquitectura Limpia (Domain, Use Cases, Infrastructure, Presentation)
- LocalStorage para carrito de compras

### Backend
- Node.js + Express.js
- PostgreSQL (Neon Database - serverless)
- API REST
- CORS habilitado

---

## Estructura del Proyecto

```
proyecto/
├── backend/               # API REST
│   ├── .env              # Variables de entorno
│   ├── server.js         # Servidor principal
│   ├── package.json
│   └── scripts/
│       ├── initDatabase.js    # Inicializar tablas
│       └── seedDatabase.js    # Poblar base de datos
│
└── click&buy/            # Frontend
    ├── index.html        # Página principal
    ├── assets/           # Estilos e imágenes
    ├── pages/            # Páginas HTML
    ├── src/              # Código fuente
    │   ├── core/         # Lógica de negocio
    │   ├── infrastructure/   # Repositorios y APIs
    │   ├── presentation/     # Controladores y componentes
    │   └── shared/          # Utilidades compartidas
    └── package.json
```

---

## Instalación y Configuración

### **Requisitos Previos**

- Node.js v16 o superior
- npm o yarn
- Cuenta en Neon Database (gratuita)

---

### **1️ Clonar el Repositorio**

```bash
git clone <url-del-repositorio>
cd proyecto
```

---

### **2️ Configurar el Backend**

#### **Paso 1: Instalar dependencias**

```bash
cd backend
npm install
```

#### **Paso 2: Configurar variables de entorno**

Crea o edita el archivo `.env` en la carpeta `backend/`:

```env
# Conexión a Neon Database
DATABASE_URL='postgresql://neondb_owner:npg_LJn0QDegVPp3@ep-curly-credit-a4jeqirc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Puerto del servidor
PORT=3000

# Configuración CORS (tu dominio frontend)
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

> **IMPORTANTE**: Si cada compañero usa su propia base de datos en Neon, deben reemplazar el `DATABASE_URL` con su propio connection string.

#### **Paso 3: Crear base de datos**

Para obtener tu propia base de datos:

1. Ve a [https://console.neon.tech](https://console.neon.tech)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia el **Connection String** (PostgreSQL)
5. Reemplázalo en el archivo `.env`

#### **Paso 4: Inicializar tablas**

```bash
npm run init-db
```

Esto creará las siguientes tablas:
- `cards` - Cartas Pokémon
- `card_attacks` - Ataques de las cartas
- `transactions` - Historial de compras
- `transaction_items` - Items de cada transacción

#### **Paso 5: Poblar la base de datos**

```bash
npm run seed
```

Este comando:
- Obtiene 500 cartas de la API de TCGdex
- Genera precios y stock aleatorios
- Inserta todo en la base de datos
- Tarda aproximadamente **2-3 minutos**

#### **Paso 6: Iniciar el servidor**

```bash
npm start
```

O para desarrollo con auto-reload:

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

---

### **3️ Configurar el Frontend**

#### **Paso 1: Instalar dependencias** (opcional)

```bash
cd click&buy
npm install
```

> **Nota**: El frontend no tiene dependencias de npm, pero puedes instalar para usar los scripts disponibles.

#### **Paso 2: Verificar configuración del backend**

Abre `click&buy/src/infrastructure/repositories/neonCardRepository.js` y verifica que la URL del backend sea correcta:

```javascript
constructor() {
  super();
  this.baseUrl = 'http://localhost:3000/api';
}
```

#### **Paso 3: Iniciar el servidor del frontend**

**Opción A: Usando Python (recomendado)**

```bash
npm run serve
# o directamente:
python -m http.server 8000
```

**Opción B: Usando Node.js**

```bash
npm run dev
```

**Opción C: Usando la extensión Live Server de VS Code**

1. Instala la extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"

La aplicación estará disponible en `http://localhost:8000` o el puerto que elijas.

---

## Uso de la Aplicación

### **Como Usuario**

1. **Navegar el catálogo**: Ver todas las cartas disponibles con stock
2. **Filtrar cartas**: Por nombre, tipo o set
3. **Ver detalles**: Click en cualquier carta para ver información completa
4. **Agregar al carrito**: Solo si hay stock disponible
5. **Finalizar compra**: Formulario de pago con validación completa

### **Validaciones de Stock**

- Solo se muestran cartas **con stock > 0**
- El botón "Agregar" está **deshabilitado** si no hay stock
- Al hacer checkout se **verifica stock en tiempo real**
- Al completar pago el **stock se reduce automáticamente**

---

## Testing del Sistema

### **1. Verificar el Backend**

```bash
# Health check
curl http://localhost:3000/health

# Ver todas las cartas con stock
curl http://localhost:3000/api/cards?inStock=true

# Ver estadísticas
curl http://localhost:3000/api/stats
```

### **2. Verificar el Frontend**

1. Abre `http://localhost:8000`
2. Deberías ver cartas en la página principal
3. Navega al catálogo
4. Intenta agregar cartas al carrito
5. Procede al checkout

### **3. Testing de Checkout**

**Tarjetas de prueba válidas:**

```
Visa: 4111 1111 1111 1111
Mastercard: 5500 0000 0000 0004
American Express: 3400 000000 00009

Fecha: Cualquier fecha futura
CVV: Cualquier 3 dígitos (4 para Amex)
```

---

## Solución de Problemas Comunes

### **Error: "Cannot connect to database"**

**Solución:**
1. Verifica que el `DATABASE_URL` en `.env` sea correcto
2. Asegúrate de tener conexión a internet
3. Verifica que tu IP esté permitida en Neon (por defecto permite todas)

### **Error: CORS**

**Solución:**
1. Verifica que `ALLOWED_ORIGINS` en `.env` incluya tu puerto del frontend
2. Reinicia el servidor backend después de cambiar `.env`

### **Frontend no carga cartas**

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica que el backend esté corriendo (`http://localhost:3000/health`)
3. Confirma que la URL en `neonCardRepository.js` sea correcta

### **Stock siempre aparece como 0**

**Solución:**
1. Re-ejecuta el seed: `npm run seed`
2. Verifica en la base de datos: Los registros deben tener `stock > 0`
3. Limpia el localStorage del navegador

---

## Endpoints de la API

### **Cartas**

```http
GET /api/cards                    # Todas las cartas
GET /api/cards?inStock=true       # Solo con stock
GET /api/cards?type=Fire          # Filtrar por tipo
GET /api/cards/:id                # Detalle de una carta
POST /api/cards/check-stock       # Verificar stock de múltiples cartas
```

### **Transacciones**

```http
POST /api/transactions            # Crear transacción
GET /api/transactions             # Historial (últimas 100)
```

### **Administración**

```http
PATCH /api/cards/:id/stock        # Actualizar stock
GET /api/stats                    # Estadísticas generales
```

---

## Seguridad y Buenas Prácticas

- Validación de tarjetas con algoritmo de Luhn
- Verificación de stock en tiempo real antes de comprar
- Transacciones atómicas en la base de datos
- Manejo de errores en todas las capas
- Sanitización de inputs

---

## Colaboración

### **Para trabajar en equipo:**

1. **Cada compañero crea su propia base de datos en Neon**
2. **Cada uno configura su propio `.env`**
3. **Ejecutan `init-db` y `seed` en su base de datos**
4. **Comparten el código por Git**

### **Git Workflow recomendado:**

```bash
# Crear rama para nueva feature
git checkout -b feature/nombre-feature

# Hacer commits
git add .
git commit -m "Descripción del cambio"

# Push a tu rama
git push origin feature/nombre-feature

# Crear Pull Request en GitHub/GitLab
```

---

## Notas Importantes

- **NO commitear el archivo `.env`** (ya está en `.gitignore`)
- El archivo `.env` contiene credenciales sensibles
- Cada desarrollador debe tener su propio `.env`
- El `seed` genera datos aleatorios, por lo que cada base tendrá cartas diferentes
- El sistema funciona completamente offline después del seed

---

## Contacto y Soporte

Si encuentras algún problema durante la instalación o ejecución:

1. Revisa la sección de **Solución de Problemas**
2. Verifica los logs del backend en la terminal
3. Revisa la consola del navegador (F12)
4. Contacta al equipo de desarrollo

---

## Licencia

Este proyecto es con fines educativos. Las cartas Pokémon y sus imágenes son propiedad de The Pokémon Company.

---

**¡Listo! Tu aplicación debería estar funcionando completamente.**