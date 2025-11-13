# 📱 Migración a Sidebar Responsive (arbrain architecture)

## Objetivo
Implementar la arquitectura responsive de `arbrain` en `agent-base-template` para resolver problemas de:
1. Botones cortados en header (ThemeToggle + UserMenu)
2. Falta de overlay móvil en sidebar
3. Falta de handlers (click-outside, escape key)
4. Falta de scroll prevention en móvil

---

## 📋 FASE 1: DELIMITAR PROBLEMA(S)

### Problemas Identificados
| # | Problema | Severidad | Ubicación | Causa Raíz |
|---|----------|-----------|-----------|-----------|
| 1 | Botones cortados en header | 🔴 CRÍTICO | ConversationList:508 | Padding insuficiente, no hay flex-grow en hijos |
| 2 | Sin overlay móvil | 🔴 CRÍTICO | SidebarToggle.tsx | No hay `fixed inset-0 z-40 lg:hidden` |
| 3 | No cierra con click-outside | 🔴 CRÍTICO | SidebarToggle.tsx | No hay useEffect con event listener |
| 4 | No cierra con Escape | 🟠 ALTO | SidebarToggle.tsx | No hay keydown handler |
| 5 | Sin scroll prevention | 🟠 ALTO | SidebarToggle.tsx | No hay `document.body.style.overflow` |
| 6 | Footer controls descuadrados | 🟡 MEDIO | ConversationList:508-513 | Spacing incongruente entre botones |

### Scope Validado
✅ Todos los problemas están **interrelacionados**: convergen en la arquitectura del sidebar y footer
✅ **Un ticket = Múltiples cambios coherentes**
✅ **No requiere cambios en base de datos**
✅ **Cambios puramente en componentes React/CSS**

### ✅ FASE 1 COMPLETA
- [x] Problemas claramente identificados
- [x] Prioridad asignada
- [x] TodoWrite creado
- [x] Scope validado

---

## 🔍 FASE 2: INVESTIGAR CONTEXTO

### Archivos Analizados

#### Configuración Actual (agent-base-template)
```
✅ features/sidebar/components/SidebarToggle.tsx       [19 líneas]
✅ features/conversations/components/ConversationList.tsx [518 líneas]
✅ features/theme/components/ThemeToggle.tsx           [24 líneas]
✅ features/auth/components/UserMenu.tsx               [?]
✅ app/chat/[id]/page.tsx                              [67 líneas]
✅ features/chat/components/ChatInterface.tsx          [93 líneas]
```

#### Arquitectura Referencia (arbrain)
```
✅ features/sidebar/components/LeftSidebarMenu.tsx     [430 líneas - REFERENCE]
✅ features/sidebar/components/VerticalRightSidebar.tsx [118 líneas]
✅ components/ClientLayoutWrapper.tsx                  [101 líneas]
✅ app/layout.tsx                                      [99 líneas]
```

### Hallazgos Clave

#### ❌ agent-base-template
```jsx
// SidebarToggle.tsx - SOLO toggle, sin context
<button onClick={toggle} ...>
  <Menu ... />
</button>

// ConversationList.tsx - Footer cortado
<div className="border-t border-white/10 px-5 py-5 flex justify-between flex-shrink-0">
  <UserMenu userEmail={userEmail} />
  <ThemeToggle />
</div>
// Los hijos (button) tienen tamaño inline, se solapan
```

#### ✅ arbrain (REFERENCE)
```jsx
// LeftSidebarMenu.tsx - Componente COMPLETO
<div className={`
  h-full w-80 glass-panel-strong z-50 flex flex-col
  lg:relative lg:translate-x-0           // Desktop: part of flow
  fixed top-0 left-0 transform transition // Mobile: overlay
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
  {/* Overlay solo en mobile */}
  {isOpen && <div className='fixed inset-0 bg-black/70 z-40 lg:hidden' />}

  {/* Event handlers: click-outside, Escape, scroll prevention */}
  useEffect(() => {
    const handleClickOutside = (event) => { ... }
    const handleEscape = (event) => { ... }
    document.body.style.overflow = 'hidden'
  }, [isOpen])
</div>

// Footer spacing correcto
<div className='flex items-center justify-between pt-2'>
  <ThemeToggle />
  <UserProfileButton />
</div>
```

### Diferencias Arquitectónicas

| Aspecto | agent-base-template | arbrain | Impacto |
|--------|-------------------|---------|--------|
| **Sidebar State** | Usa context + toggle | Local state + callbacks | arbrain es más simple |
| **Mobile Layout** | Flex normal | Fixed overlay | arbrain funciona en móvil |
| **Event Listeners** | Ninguno | 3 listeners | arbrain es accesible |
| **Overlay Background** | No existe | `bg-black/70 lg:hidden` | arbrain tiene UX premium |
| **Scroll Management** | No | `document.body.overflow` | arbrain no tiene jitter |
| **Footer Controls** | `justify-between` solo | Contenedor con pt-2 | arbrain tiene spacing correcto |

### ✅ FASE 2 COMPLETA
- [x] Archivos relevantes leídos
- [x] Documentación consultada
- [x] Arquitectura comprendida (ambos repos)
- [x] Causa raíz identificada (sidebar + footer)

---

## 💡 FASE 3: PROPONER SOLUCIÓN

### Estrategia: HYBRID APPROACH
**No copiar arbrain 1:1**, sino adaptar lo mejor:

#### Opción A (Rechazada)
- ❌ Reescribir SidebarToggle como LeftSidebarMenu completo
- **Razón:** Muy disruptivo, requiere cambiar toda la arquitectura

#### Opción B (Rechazada)
- ❌ Solo agregar CSS media queries a ConversationList
- **Razón:** No resuelve problema de overlay en móvil

#### Opción C ✅ (SELECCIONADA)
- ✅ **Refactor mínimo de SidebarToggle** → agregar handlers + overlay
- ✅ **Fix de ConversationList footer** → flex spacing correcto
- ✅ **Nuevo hook** → useSidebarContext mejorado (si no existe)

### Cambios Requeridos

#### 1. SidebarToggle.tsx → SidebarToggleEnhanced.tsx (o refactor)
```typescript
// ANTES
export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar()
  return <button onClick={toggle} ...>
}

// DESPUÉS
export function SidebarToggle() {
  const { isOpen, toggle, close } = useSidebar()

  // Overlay para móvil
  {isOpen && <div className='fixed inset-0 lg:hidden' onClick={close} />}

  // Listeners: click-outside, escape, scroll prevention
  useEffect(() => {
    const handleClickOutside = () => { ... }
    const handleEscape = (e) => { if(e.key === 'Escape') close() }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'

    return () => { /* cleanup */ }
  }, [isOpen])
}
```

#### 2. ConversationList.tsx → Footer fix (línea 508)
```jsx
// ANTES
<div className="border-t border-white/10 px-5 py-5 flex justify-between flex-shrink-0">
  <UserMenu userEmail={userEmail} />
  <ThemeToggle />
</div>

// DESPUÉS
<div className="border-t border-white/10 px-5 py-4 flex items-center justify-between flex-shrink-0 gap-3">
  <UserMenu userEmail={userEmail} />
  <ThemeToggle />
</div>
```

#### 3. SidebarContext.tsx (si existe) → Mejorar
```typescript
// AGREGAR
export function useSidebar() {
  const context = useContext(SidebarContext)

  return {
    isOpen: context.isOpen,
    toggle: context.toggle,
    open: () => context.setIsOpen(true),    // NUEVO
    close: () => context.setIsOpen(false),  // NUEVO
  }
}
```

### Impacto Análisis

| Componente | Cambio | Riesgo | Benefit |
|-----------|--------|--------|--------|
| SidebarToggle | Refactor | BAJO | +Mobile UX |
| ConversationList | CSS fix | MÍNIMO | +Visual alignment |
| SidebarContext | Add methods | BAJO | +Reutilizable |
| Tests | N/A | BAJO | Puro UI |

### ✅ FASE 3 COMPLETA
- [x] Opciones evaluadas (3 opciones, 1 seleccionada)
- [x] Mejor opción seleccionada (Opción C - Hybrid)
- [x] Cambios identificados (3 archivos, 4 cambios)
- [x] Impacto analizado (bajo riesgo, alto benefit)

---

## ⚙️ FASE 4: IMPLEMENTAR

### Orden de Implementación
1. ✏️ **Step 1:** Mejorar SidebarContext (tipos + métodos)
2. ✏️ **Step 2:** Refactor SidebarToggle (handlers + overlay)
3. ✏️ **Step 3:** Fix ConversationList footer (spacing)
4. ✏️ **Step 4:** Validar en browser (dev server)

### Detalle por Step

#### Step 1: SidebarContext (si es necesario)
**Ubicación:** `features/sidebar/context/SidebarContext.tsx`
```typescript
// AGREGAR close(), open() methods al context
export const SidebarContext = createContext<{
  isOpen: boolean
  toggle: () => void
  open: () => void      // NUEVO
  close: () => void     // NUEVO
}>({...})
```

#### Step 2: SidebarToggle Refactor
**Ubicación:** `features/sidebar/components/SidebarToggle.tsx`

**Cambios:**
- Agregar useEffect con event listeners
- Agregar overlay (fixed inset-0 z-40 lg:hidden)
- Agregar scroll prevention (document.body.style.overflow)
- Agregar cleanup en useEffect

**Ref:** arbrain/LeftSidebarMenu.tsx líneas 86-135, 140-149

#### Step 3: ConversationList Footer
**Ubicación:** `features/conversations/components/ConversationList.tsx` línea 508

**Cambios:**
- `flex justify-between` → `flex items-center justify-between`
- Add `gap-3` (espaciado explícito)
- Change `py-5` → `py-4` (proporción visual)

#### Step 4: Testing
```bash
npm run dev
# ✅ Desktop: sidebar normal, botones alineados
# ✅ Tablet: overlay visible, no scroll jitter
# ✅ Mobile: overlay funciona, escape cierra, click-outside cierra
```

### ✅ FASE 4 (Pendiente Implementation)
- [ ] Step 1: SidebarContext mejorado
- [ ] Step 2: SidebarToggle con handlers
- [ ] Step 3: ConversationList footer fix
- [ ] Step 4: Testing completado

---

## 🧪 FASE 5: VALIDAR

### Validación Sintáctica (TypeScript)
```bash
npm run typecheck
# Esperado: 0 errors
```

### Validación Funcional (Manual)

**Test Plan Desktop (1920x1080):**
```
[ ] Sidebar toggle button visible
[ ] Botones en footer alineados (no cortados)
[ ] ThemeToggle + UserMenu espaciados correctamente
```

**Test Plan Tablet (768x1024):**
```
[ ] Sidebar abre/cierra normalmente
[ ] Overlay visible con backdrop blur
[ ] Click fuera del sidebar lo cierra
[ ] Botones en footer alineados
```

**Test Plan Mobile (375x667):**
```
[ ] Overlay visible al abrir sidebar
[ ] Backdrop blur aplicado
[ ] Click en overlay cierra sidebar
[ ] Presionar Escape cierra sidebar
[ ] Body scroll disabled cuando sidebar open
[ ] Body scroll enabled cuando sidebar closed
[ ] Botones en footer legibles (no cortados)
```

### Validación de Regresión
```
[ ] ConversationList sigue funcionando igual
[ ] Sidebar toggle sigue visible
[ ] No hay console errors
[ ] No hay memory leaks (cleanup ejecutado)
```

### Validación Visual
- ✅ Usar browser DevTools para comprobar:
  - Layout shifts
  - Painting performance
  - Element inspector (spacing correcto)

### ✅ FASE 5 (Pendiente Validation)
- [ ] Tests sintácticos passing
- [ ] Testing funcional completo
- [ ] Sin regresiones detectadas
- [ ] UX validada en 3 breakpoints

---

## 📝 FASE 6: DOCUMENTAR

### Comentarios en Código
```typescript
// En SidebarToggle.tsx
// 🎯 MOBILE-FIRST: Fixed overlay que aparece solo en móvil (lg:hidden)
// permite navegación sin desplazamientos de contenido
// Ref: arbrain/LeftSidebarMenu.tsx:140-149

// 🔌 Event Listeners: click-outside, Escape key, scroll prevention
// Se limpian automáticamente en useEffect cleanup
// Ref: arbrain/LeftSidebarMenu.tsx:86-135
```

### Commit Message
```
fix: implement responsive sidebar with mobile overlay and accessibility handlers

- Add fixed overlay (backdrop blur) for mobile sidebar (lg:hidden)
- Add click-outside handler to close sidebar
- Add Escape key handler for accessibility
- Add scroll prevention (document.body.overflow) when sidebar open
- Fix footer controls spacing in ConversationList (flex gap + items-center)
- Cleanup: remove scroll prevention on unmount

Fixes #[issue-number]
Ref: arbrain/frontend/src/features/sidebar/components/LeftSidebarMenu.tsx
```

### Documentación Técnica
**Ubicación:** `.claude/docs/sidebar-responsive-migration.md`

```markdown
# Sidebar Responsive Migration

## Cambios Implementados
1. SidebarToggle → Agregados handlers + overlay
2. ConversationList footer → Fixed spacing
3. SidebarContext → Agregados close/open methods

## Arquitectura
- Mobile: Fixed overlay + backdrop blur (lg:hidden)
- Desktop: Relative layout (normal flow)
- Accessibility: Escape key + click-outside

## Performance
- Event listener cleanup en useEffect
- No memory leaks
- Minimal repaints (solo transform + opacity)

## Referencia
- Basado en: arbrain/LeftSidebarMenu.tsx
- PR: [link si aplica]
```

### Knowledge Transfer
**Para el usuario:**
```
✅ Sidebar ahora funciona perfectamente en móvil
✅ Botones ya no se cortan
✅ UX mejorado con overlay + scroll prevention
✅ Accesibilidad: Escape key + click-outside
```

### ✅ FASE 6 (Pendiente Documentation)
- [ ] Código comentado con referencias
- [ ] Commits descriptivos siguiendo Conventional Commits
- [ ] Docs técnicas en .claude/docs/
- [ ] Reporte completo al usuario

---

## 📊 RESUMEN EJECUTIVO

| Fase | Estado | Checklist |
|------|--------|-----------|
| 1️⃣ Delimitar | ✅ COMPLETA | 6 problemas identificados, 1 ticket |
| 2️⃣ Investigar | ✅ COMPLETA | 8 archivos leídos, arquitectura mapeada |
| 3️⃣ Proponer | ✅ COMPLETA | Opción C hybrid, bajo riesgo |
| 4️⃣ Implementar | ⏳ PENDIENTE | 4 steps, ready to execute |
| 5️⃣ Validar | ⏳ PENDIENTE | Test plan listo |
| 6️⃣ Documentar | ⏳ PENDIENTE | Template ready |

---

**Este documento es tu hoja de ruta. Sigue fase por fase para implementación sistemática.**

*Generado con Bucle Agéntico - Metodología de Desarrollo Asistido por IA*
