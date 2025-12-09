# ⚽ GlobalScore

<div align="center">
  
  ![GlobalScore Banner](https://img.shields.io/badge/GlobalScore-Prediction%20Platform-8B5CF6?style=for-the-badge&logo=trophy&logoColor=white)
  
  **La plataforma definitiva para predicciones deportivas y competencias entre amigos**
  
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  [Demo](https://your-demo-url.com) • [Documentación](https://your-docs-url.com) • [Reportar Bug](https://github.com/your-repo/issues)

</div>

---

## 📖 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características Principales](#-características-principales)
- [Tech Stack](#️-tech-stack)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Contacto](#-contacto)

---

## 🎯 Sobre el Proyecto

**GlobalScore** es una plataforma web moderna y gamificada que permite a los usuarios hacer predicciones sobre resultados deportivos, competir en rankings globales, y ganar puntos, logros y títulos. Diseñada para crear una experiencia social y competitiva entre amigos y comunidades de aficionados al fútbol.

### 🎮 ¿Por qué GlobalScore?

- **Competencia Amistosa**: Compite con amigos y otros usuarios por el primer puesto
- **Sistema de Gamificación**: Logros, títulos, niveles y rachas de predicciones
- **Múltiples Modos**: Predice partidos, ligas completas, premios individuales y hasta el Mundial
- **Estadísticas Detalladas**: Sigue tu evolución con métricas avanzadas
- **Ranking Dinámico**: Podios visuales y tablas de posiciones en tiempo real

---

## ✨ Características Principales

### 🏆 Sistema de Predicciones

<table>
<tr>
<td width="50%">

**⚽ Predicciones de Partidos**
- Predice marcadores exactos
- Sistema de puntos inteligente
  - 5 pts: Resultado exacto
  - 3 pts: Resultado acertado
  - 0 pts: Fallido
- Deadlines automáticos antes del partido

</td>
<td width="50%">

**🏅 Predicciones de Ligas**
- Predice campeón de liga
- Goleador y asistidor
- Jugador MVP
- Hasta 20 puntos por liga

</td>
</tr>
<tr>
<td width="50%">

**🥇 Premios Individuales**
- Balón de Oro
- Bota de Oro
- The Best FIFA
- 10 puntos por acierto

</td>
<td width="50%">

**🌍 Mundial 2026**
- Fase de grupos completa (12 grupos)
- Bracket de eliminatorias (48 equipos)
- Predicción de premios del torneo
- Tabla de mejores terceros automática

</td>
</tr>
</table>

### 🎮 Gamificación y Progresión

```
📊 Sistema de Niveles
├── Basado en puntos acumulados
├── 20 puntos por nivel
└── Barra de progreso visual

🏅 Logros Desbloqueables
├── 4 Categorías: Inicio, Progreso, Precisión, Racha
├── Requisitos personalizables por admin
└── Iconos y descripciones únicas

👑 Títulos Especiales
├── Desbloqueables mediante logros
├── Novato → Pronosticador → Oráculo → Leyenda
└── Colores y efectos visuales exclusivos

🔥 Sistema de Rachas
├── Racha actual de aciertos
├── Mejor racha personal
└── Recompensas por consistencia
```

### 📊 Estadísticas y Analytics

- **Dashboard Personal**: Métricas clave y progreso
- **Historial Completo**: Todas tus predicciones con resultados
- **Análisis por Liga**: Rendimiento en cada competición
- **Estadísticas Semanales**: Reset semanal con mini-ranking
- **Gráficas Interactivas**: Precisión por día de la semana

### 🎨 Experiencia de Usuario

- **Diseño Purple Theme**: Paleta coherente y moderna
- **Responsive Design**: Móvil, tablet y desktop optimizados
- **Bottom Navigation**: Navegación móvil intuitiva
- **Dark Mode Ready**: Variables CSS preparadas
- **Animaciones Sutiles**: Transiciones fluidas
- **Toast Notifications**: Feedback visual elegante

### 🛡️ Panel de Administración

```
Admin Dashboard
├── 📋 Gestión de Partidos
│   ├── Crear/Editar/Eliminar
│   ├── Logos automáticos
│   └── Finalizar con cálculo de puntos
├── 🏆 Gestión de Ligas
│   ├── Crear competiciones
│   ├── Definir deadlines
│   └── Registrar resultados finales
├── 🥇 Gestión de Premios
│   └── Premios individuales
├── ⭐ Sistema de Logros
│   ├── Crear logros personalizados
│   └── Definir requisitos
└── 👑 Sistema de Títulos
    ├── Crear títulos exclusivos
    └── Vincular con logros
```

---

## 🛠️ Tech Stack

### Frontend

```javascript
{
  "framework": "React 18.3.1",
  "buildTool": "Vite 5.4.11",
  "routing": "React Router DOM 7.0.1",
  "icons": "Lucide React 0.469.0",
  "styling": "CSS Modules + Custom CSS",
  "stateManagement": "React Context API"
}
```

### Backend & Database

```javascript
{
  "backend": "Supabase",
  "database": "PostgreSQL",
  "authentication": "Supabase Auth",
  "storage": "Supabase Storage (Logos)",
  "realtime": "Supabase Realtime (opcional)"
}
```

### Características Técnicas

- ⚡ **Vite**: Build ultrarrápido con HMR
- 🎣 **Custom Hooks**: Lógica reutilizable (`useMatches`, `useLeagues`, `useAwards`, `useWorldCup`)
- 🎨 **CSS Variables**: Theming dinámico
- 🖼️ **Lazy Loading**: Optimización de imágenes
- 📱 **PWA Ready**: Estructura preparada para Progressive Web App
- 🔒 **Row Level Security**: Políticas de seguridad en Supabase

---

## 🚀 Instalación

### Prerrequisitos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/globalscore.git
cd globalscore
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_project_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Paso 4: Ejecutar el proyecto

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Configuración de Supabase

#### 1. Crear las tablas

Ejecuta el script SQL en tu proyecto de Supabase (ver archivo `schema.sql` en el repositorio).

#### 2. Configurar Storage Buckets

Crea los siguientes buckets en Supabase Storage:

```
team-logos/
├── leagues/
│   ├── premier-league/
│   ├── la-liga/
│   ├── serie-a/
│   ├── bundesliga/
│   └── ligue-1/

league-logos/
├── inglaterra.png
├── espana.png
├── italia.png
└── ...

award-logos/
├── balondeor.png
├── botadeoro.png
└── ...

profiles/
└── avatars/

world-cup-logos/
├── argentina.png
├── brasil.png
└── ...
```

#### 3. Configurar Row Level Security (RLS)

```sql
-- Ejemplo: Política para la tabla 'matches'
CREATE POLICY "Users can view all matches"
ON matches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify matches"
ON matches FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.is_admin = true
  )
);
```

#### 4. Habilitar Authentication

Configura los métodos de autenticación en Supabase:
- ✅ Email/Password
- ✅ Password Recovery
- ⚙️ (Opcional) OAuth Providers (Google, GitHub)

---

## 📁 Estructura del Proyecto

```
globalscore/
├── public/                     # Assets estáticos
├── src/
│   ├── assets/                 # Imágenes y recursos
│   ├── components/             # Componentes reutilizables
│   │   ├── adminComponents/    # Componentes del panel admin
│   │   │   ├── AdminAchievementsModal.jsx
│   │   │   ├── AdminLeagueModal.jsx
│   │   │   ├── FinishMatchModal.jsx
│   │   │   └── ...
│   │   ├── cardComponents/     # Cards de predicciones
│   │   │   ├── MatchCard.jsx
│   │   │   ├── LeagueCard.jsx
│   │   │   ├── AwardCard.jsx
│   │   │   └── ...
│   │   ├── AchievementsSection.jsx
│   │   ├── AvatarUpload.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── KnockoutSection.jsx # Sistema de eliminatorias
│   │   ├── LoadingStates.jsx
│   │   ├── NavigationTabs.jsx
│   │   ├── RankingSidebar.jsx
│   │   ├── Toast.jsx
│   │   └── ...
│   ├── context/               # React Context
│   │   └── ThemeContext.jsx
│   ├── hooks/                 # Custom Hooks
│   │   ├── useDataLoader.js
│   │   ├── useMatches.js
│   │   ├── useLeagues.js
│   │   ├── useAwards.js
│   │   └── useWorldCup.js
│   ├── pages/                 # Páginas principales
│   │   ├── AdminPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RankingPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── StatsPage.jsx
│   │   └── WorldCupPage.jsx
│   ├── styles/                # Estilos CSS
│   │   ├── adminStyles/
│   │   ├── cardStyles/
│   │   ├── pagesStyles/
│   │   ├── Footer.css
│   │   ├── Header.css
│   │   ├── Toast.css
│   │   └── ...
│   ├── utils/                # Utilidades
│   │   ├── logoHelper.js     # Helpers para logos
│   │   ├── storage.js
│   │   └── supabaseClient.js
│   ├── App.jsx               # Componente raíz
│   ├── main.jsx              # Entry point
│   └── index.css             # Estilos globales
├── .env                      # Variables de entorno
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🗺️ Roadmap

### ✅ Completado (v1.0)

- [x] Sistema de autenticación completo
- [x] Predicciones de partidos con puntos
- [x] Predicciones de ligas y premios
- [x] Sistema de logros y títulos
- [x] Ranking global con podio
- [x] Panel de administración
- [x] Mundial 2026 (Fase de grupos + Eliminatorias)
- [x] Responsive design
- [x] Sistema de notificaciones

### 🚧 En Desarrollo (v1.1)

- [ ] **PWA**: Instalación como app nativa
- [ ] **Push Notifications**: Alertas de nuevos partidos
- [ ] **Chat Global**: Comunidad integrada
- [ ] **Ligas Privadas**: Competencias entre grupos
- [ ] **Multidioma**: Español, Inglés, Portugués

### 📋 Planeado (v2.0)

- [ ] **Integración con APIs**: Resultados automáticos
- [ ] **Sistema de Monedas**: Economía virtual
- [ ] **Tienda**: Compra de avatares y temas
- [ ] **Torneos Personalizados**: Crea tus propias ligas
- [ ] **Predicciones en Vivo**: Durante el partido
- [ ] **Analytics Avanzados**: ML para recomendaciones
- [ ] **Social Sharing**: Compartir predicciones
- [ ] **Modo Offline**: Funcionalidad sin conexión

### 🔮 Futuro (v3.0)

- [ ] **Mobile App**: React Native
- [ ] **AI Predictions**: Asistente con IA

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar GlobalScore:

### Flujo de Contribución

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Convenciones de Código

- ✅ Usa **ESLint** y **Prettier**
- ✅ Nombra componentes en **PascalCase**
- ✅ Nombra funciones en **camelCase**
- ✅ CSS classes en **kebab-case**
- ✅ Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

### Reportar Bugs

Usa el [issue tracker](https://github.com/tu-usuario/globalscore/issues) con:
- Descripción clara del bug
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible
- Información del entorno (browser, OS)

---

## 📞 Contacto

**Hermanos Vega** - Desarrolladores

- 📧 Email: [globalscore.oficial@gmail.com](mailto:globalscore.oficial@gmail.com)
- 🌐 Website: [https://global-score.vercel.app/](https://global-score.vercel.app/)

**Link del Proyecto**: [https://https://github.com/jsebasvgg7/GlobalScore](https://github.com/jsebasvgg7/GlobalScore)

---

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Framework frontend
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide Icons](https://lucide.dev/) - Iconografía
- [Vercel](https://vercel.com/) - Hosting
- [FRIEND](f_dixxz7&brainy_bh) - Cisco & Brainy

---

<div align="center">

### ⭐ Si te gusta el proyecto, dale una estrella en GitHub

**Hecho por Hermanos Vega 🔝**

[⬆ Volver arriba](#-globalscore)

</div>