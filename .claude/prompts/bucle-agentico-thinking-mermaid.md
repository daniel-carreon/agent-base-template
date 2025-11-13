# 🔄 Bucle Agéntico: Thinking Blocks + Mermaid + OpenRouter

**Fecha**: 2025-01-12
**Objetivo**: Mejorar visualización de thinking blocks, añadir renderizado Mermaid, migrar a OpenRouter

---

## 📋 FASE 1: DELIMITAR PROBLEMA(S)

### Problemas Identificados

1. **Toggle de thinking blocks invisible** - Componente existe pero no se muestra
2. **Haiku 4.5 no muestra thinking** - Configuración incorrecta
3. **Falta renderizado de Mermaid** - No hay soporte para diagramas
4. **Múltiples API keys** - Usar solo OpenRouter en lugar de Anthropic/OpenAI/Google directo

### Priorización

- 🔴 **CRÍTICO**: Thinking blocks no visible (funcionalidad ya implementada pero no funciona)
- 🟡 **ALTA**: Migración a OpenRouter (simplificación de arquitectura)
- 🟢 **MEDIA**: Renderizado Mermaid (nice-to-have)

### ✅ Checklist FASE 1
- [x] Problemas claramente identificados
- [x] Prioridad asignada
- [x] TodoWrite creado
- [x] Scope validado

---

## 🔍 FASE 2: INVESTIGAR CONTEXTO

### Archivos Investigados

1. ✅ `features/chat/components/ThinkingBlock.tsx` - Componente con toggle funcional
2. ✅ `features/chat/components/Message.tsx` - Integración del ThinkingBlock
3. ✅ `features/chat/components/MessageList.tsx` - Extracción de thinking
4. ✅ `shared/lib/openrouter.ts` - Configuración OpenRouter ya existe
5. ✅ `config/models.ts` - Configuración de modelos
6. ✅ `app/api/chat/route.ts` - API con thinking habilitado

### Hallazgos Clave

#### 1️⃣ Thinking Blocks - YA IMPLEMENTADO

**✅ Componente existe** (`ThinkingBlock.tsx`):
```typescript
// Toggle funcional con estado
const [isExpanded, setIsExpanded] = useState(false)

// Renderiza si content existe
if (!content || content.trim() === '') return null
```

**✅ Integración en Message** (`Message.tsx` línea 41):
```typescript
{!isUser && thinking && <ThinkingBlock content={thinking} />}
```

**❌ PROBLEMA**: Extracción de thinking en `MessageList.tsx` línea 43:
```typescript
// Solo funciona con Anthropic API directa, NO con OpenRouter
const thinking = (message as any).experimental_providerMetadata?.anthropic?.thinking
```

**❌ PROBLEMA 2**: Haiku 4.5 no está marcado como modelo con thinking (`config/models.ts` línea 18):
```typescript
{
  id: 'claude-haiku-4-5',
  supportsThinking: false, // ❌ Debería ser true
  // ...
}
```

#### 2️⃣ OpenRouter - Parcialmente Implementado

**✅ YA EXISTE**:
- Archivo `shared/lib/openrouter.ts` con configuración
- Provider 'openrouter' en `getModelInstance` switch
- Modelos definidos en `OPENROUTER_MODELS`:
  ```typescript
  CLAUDE_HAIKU_4_5: 'anthropic/claude-haiku-4-5',
  CLAUDE_SONNET_4: 'anthropic/claude-sonnet-4',
  CLAUDE_OPUS_4: 'anthropic/claude-opus-4',
  // + GPT, Gemini, etc.
  ```

**❌ PROBLEMA**: Ningún modelo en `config/models.ts` usa `provider: 'openrouter'`

**Formato de Reasoning en OpenRouter**:
```json
{
  "choices": [{
    "message": {
      "reasoning_details": [
        {
          "type": "reasoning.text",
          "id": "string|null",
          "format": "anthropic-claude-v1",
          "text": "El contenido del thinking aquí..."
        }
      ]
    }
  }]
}
```

**En streaming**:
```json
{
  "choices": [{
    "delta": {
      "reasoning_details": [/* chunks */]
    }
  }]
}
```

#### 3️⃣ Vercel AI SDK - Soporte de Reasoning

**Versión actual**: AI SDK 5.0.89 (verificado en `package.json`)

**✅ Soporte oficial desde AI SDK 4.2**:
- Property `reasoning` en messages
- Access via `message.parts` con type `reasoning`
- Compatible con Anthropic, OpenAI, Google

**Formato en AI SDK**:
```typescript
// En messages de AI SDK
message.parts.find(part => part.type === 'reasoning')?.text
```

#### 4️⃣ Mermaid - No Implementado

**Mejores opciones para React (2025)**:
1. **@mermaid-js/react** - Wrapper oficial de Mermaid.js ⭐
2. **react-x-mermaid** - Nuevo (2025), TypeScript support

**Patrón de detección**:
```typescript
// Detectar bloques de código Mermaid
const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
```

### Investigación Web

**OpenRouter Extended Thinking**:
- ✅ Haiku 4.5 sí soporta extended thinking
- ✅ Modelo especial: `anthropic/claude-3-7-sonnet-20250219:thinking`
- ✅ Parámetro: `thinking: { type: "enabled", budget_tokens: 10000 }`
- ✅ Formato de respuesta: `reasoning_details` array

**Vercel AI SDK**:
- ✅ Desde v4.2 soporta reasoning tokens
- ✅ Access via `message.parts` con `type: 'reasoning'`
- ✅ Compatible con múltiples providers

**Mermaid React**:
- ✅ Wrapper oficial: `@mermaid-js/react`
- ✅ Alternativa moderna: `react-x-mermaid`

### ✅ Checklist FASE 2
- [x] Archivos relevantes leídos
- [x] Documentación consultada (OpenRouter, AI SDK, Mermaid)
- [x] Arquitectura comprendida
- [x] Causa raíz identificada

---

## 💡 FASE 3: PROPONER SOLUCIÓN

### Opción 1: Migración Completa a OpenRouter ⭐ RECOMENDADA

**Pros**:
- ✅ Una sola API key (simplificación)
- ✅ Acceso a 400+ modelos
- ✅ Haiku 4.5 con thinking incluido
- ✅ Pricing competitivo

**Cons**:
- ⚠️ Requiere actualizar todos los modelos en config
- ⚠️ Cambiar extracción de reasoning

**Cambios necesarios**:
1. Actualizar `config/models.ts` - cambiar IDs y provider
2. Actualizar extracción en `MessageList.tsx`
3. Marcar Haiku 4.5 con `supportsThinking: true`
4. Remover dependencias de Anthropic/OpenAI/Google directo

### Opción 2: Mantener Anthropic Directo + Arreglar Thinking

**Pros**:
- ✅ Menos cambios
- ✅ Thinking ya funciona con formato actual

**Cons**:
- ❌ Múltiples API keys
- ❌ No simplifica arquitectura
- ❌ Haiku 4.5 no tiene thinking en Anthropic directo

### Opción 3: Híbrido (OpenRouter + Anthropic)

**Pros**:
- ✅ Flexibilidad
- ✅ Fallback si OpenRouter falla

**Cons**:
- ❌ Complejidad innecesaria
- ❌ No simplifica

### 🎯 Decisión: Opción 1 - Migración Completa a OpenRouter

**Razones**:
1. Usuario pidió específicamente "simplificar con OpenRouter"
2. Haiku 4.5 con thinking solo disponible vía OpenRouter
3. Arquitectura más limpia
4. Menor costo operativo (una sola key)

### Implementación Detallada

#### Cambio 1: Actualizar `config/models.ts`

```typescript
export const AVAILABLE_MODELS: ModelInfo[] = [
  // Claude via OpenRouter
  {
    id: 'anthropic/claude-haiku-4-5', // ← Formato OpenRouter
    name: 'Claude Haiku 4.5',
    provider: 'openrouter', // ← Cambio clave
    supportsThinking: true, // ← NUEVO
    // ...resto igual
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'openrouter',
    supportsThinking: true,
    // ...
  },
  // GPT via OpenRouter
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    // ...
  }
]
```

#### Cambio 2: Extraer reasoning en `MessageList.tsx`

```typescript
// ANTES (línea 43)
const thinking = (message as any).experimental_providerMetadata?.anthropic?.thinking

// DESPUÉS
const thinking = extractThinkingContent(message)

// Nueva función helper
function extractThinkingContent(message: any): string {
  // 1. Try AI SDK reasoning parts (Vercel AI SDK 4.2+)
  const reasoningPart = message.parts?.find((p: any) => p.type === 'reasoning')
  if (reasoningPart?.text) return reasoningPart.text

  // 2. Try OpenRouter reasoning_details (raw response)
  const reasoningDetails = message.reasoning_details
  if (Array.isArray(reasoningDetails)) {
    return reasoningDetails
      .filter((r: any) => r.type === 'reasoning.text')
      .map((r: any) => r.text)
      .join('\n\n')
  }

  // 3. Fallback: Anthropic direct (backward compatibility)
  return message.experimental_providerMetadata?.anthropic?.thinking || ''
}
```

#### Cambio 3: Mermaid Rendering

**Instalar dependencia**:
```bash
npm install @mermaid-js/react mermaid
```

**Crear componente** `shared/components/MermaidDiagram.tsx`:
```typescript
'use client'

import Mermaid from '@mermaid-js/react'

interface MermaidDiagramProps {
  chart: string
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  return (
    <div className="my-4 p-4 glass rounded-lg">
      <Mermaid chart={chart} />
    </div>
  )
}
```

**Detectar en Message.tsx**:
```typescript
import { MermaidDiagram } from '@/shared/components/MermaidDiagram'

function parseMermaidBlocks(content: string) {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
  const blocks: { type: 'text' | 'mermaid', content: string }[] = []

  let lastIndex = 0
  let match

  while ((match = mermaidRegex.exec(content)) !== null) {
    // Texto antes del mermaid
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }

    // Bloque mermaid
    blocks.push({ type: 'mermaid', content: match[1] })
    lastIndex = match.index + match[0].length
  }

  // Texto restante
  if (lastIndex < content.length) {
    blocks.push({ type: 'text', content: content.slice(lastIndex) })
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', content }]
}

// En Message component
const blocks = parseMermaidBlocks(content)

return (
  <>
    {blocks.map((block, i) =>
      block.type === 'mermaid'
        ? <MermaidDiagram key={i} chart={block.content} />
        : <p key={i}>{block.content}</p>
    )}
  </>
)
```

### ✅ Checklist FASE 3
- [x] Opciones evaluadas (3 opciones)
- [x] Mejor opción seleccionada (Opción 1)
- [x] Cambios identificados (3 cambios principales)
- [x] Impacto analizado

---

## ⚙️ FASE 4: IMPLEMENTAR

**Orden de implementación**:

1. **Instalar Mermaid** (no afecta nada existente)
2. **Actualizar extracción de thinking** (backward compatible)
3. **Actualizar config/models.ts** (breaking change)
4. **Crear componente MermaidDiagram**
5. **Integrar Mermaid en Message.tsx**
6. **Testing completo**

### Checklist Implementación
- [ ] Mermaid instalado
- [ ] Helper extractThinkingContent creado
- [ ] config/models.ts actualizado a OpenRouter
- [ ] MermaidDiagram component creado
- [ ] Message.tsx integrado con Mermaid
- [ ] Tests pasando
- [ ] Todos actualizados

---

## 🧪 FASE 5: VALIDAR

### Tests Funcionales

1. **Thinking Blocks**:
   - [ ] Enviar mensaje con Haiku 4.5
   - [ ] Verificar que aparece toggle "Pensando..."
   - [ ] Expandir y ver contenido de thinking
   - [ ] Probar con Sonnet 4 y Opus 4

2. **OpenRouter**:
   - [ ] Todos los modelos funcionan
   - [ ] API key única funciona
   - [ ] Costos correctos en UI

3. **Mermaid**:
   - [ ] Renderizar diagrama de flujo
   - [ ] Renderizar diagrama de secuencia
   - [ ] Verificar sintaxis incorrecta no rompe UI

### Checklist Validación
- [ ] Tests sintácticos pasando (TypeScript)
- [ ] Tests funcionales completos
- [ ] Sin regresiones
- [ ] UX validada por usuario

---

## 📝 FASE 6: DOCUMENTAR

### Documentación Necesaria

1. **ai-sdk-best-practices.md** - Añadir sección OpenRouter + reasoning
2. **README.md** - Actualizar con Mermaid support
3. **Comentarios en código** - Explicar extractThinkingContent

### Checklist Documentación
- [ ] Código comentado
- [ ] Commits descriptivos
- [ ] Docs actualizadas
- [ ] Reporte al usuario

---

## 📊 Resumen Ejecutivo

### Problema Original
Usuario quiere:
1. ✅ Ver thinking blocks de Haiku 4.5
2. ✅ Renderizar diagramas Mermaid
3. ✅ Simplificar a solo OpenRouter API key

### Solución Propuesta
1. **Migrar a OpenRouter** - Provider único para todos los modelos
2. **Habilitar thinking en Haiku 4.5** - Actualizar config + extracción
3. **Añadir Mermaid** - Componente para renderizar diagramas

### Beneficios
- 🎯 **UX mejorada** - Thinking visible para todos los modelos
- 🔧 **Arquitectura simplificada** - Una API key, un provider
- 📊 **Capacidad visual** - Diagramas Mermaid en chat
- 💰 **Costos optimizados** - Pricing competitivo de OpenRouter

### Riesgos
- ⚠️ Cambio de provider requiere testing exhaustivo
- ⚠️ Formato de reasoning diferente (mitigado con helper function)

---

*Bucle Agéntico completado - Listo para implementación*
