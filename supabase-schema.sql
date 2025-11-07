-- ============================================
-- AGENT BASE TEMPLATE - DATABASE SCHEMA
-- ============================================
-- Ejecuta este archivo completo en Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva Conversación',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Comentarios
COMMENT ON TABLE public.conversations IS 'Almacena conversaciones de usuarios con agentes';
COMMENT ON COLUMN public.conversations.title IS 'Título auto-generado basado en primer mensaje';

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model_used VARCHAR(100),
  tokens_input INTEGER,
  tokens_output INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp DESC);

-- Comentarios
COMMENT ON TABLE public.messages IS 'Almacena mensajes individuales de conversaciones';
COMMENT ON COLUMN public.messages.role IS 'Quién envió el mensaje: user, assistant, o system';
COMMENT ON COLUMN public.messages.model_used IS 'Modelo de IA usado (ej: claude-haiku-4-5)';
COMMENT ON COLUMN public.messages.tokens_input IS 'Tokens de input (para tracking de costos)';
COMMENT ON COLUMN public.messages.tokens_output IS 'Tokens de output (para tracking de costos)';

-- ============================================
-- AUTO-UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

-- Create new policies
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Habilitar RLS en messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.messages;

-- Create new policies
CREATE POLICY "Users can view messages from own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- VALIDACIONES Y CONSTRAINTS
-- ============================================

-- Validar que título no esté vacío
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'conversations_title_not_empty'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_title_not_empty
      CHECK (LENGTH(TRIM(title)) > 0);
  END IF;
END $$;

-- Validar que contenido de mensaje no esté vacío
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_content_not_empty'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_content_not_empty
      CHECK (LENGTH(TRIM(content)) > 0);
  END IF;
END $$;

-- Validar que tokens sean positivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_tokens_positive'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_tokens_positive
      CHECK (
        (tokens_input IS NULL OR tokens_input >= 0) AND
        (tokens_output IS NULL OR tokens_output >= 0)
      );
  END IF;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que todo se creó correctamente
DO $$
DECLARE
  conversations_count INTEGER;
  messages_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conversations_count FROM information_schema.tables WHERE table_name = 'conversations';
  SELECT COUNT(*) INTO messages_count FROM information_schema.tables WHERE table_name = 'messages';

  IF conversations_count = 1 AND messages_count = 1 THEN
    RAISE NOTICE '✅ Schema creado exitosamente!';
    RAISE NOTICE '✅ Tablas: conversations, messages';
    RAISE NOTICE '✅ RLS habilitado';
    RAISE NOTICE '✅ Indexes creados';
    RAISE NOTICE '✅ Triggers configurados';
  ELSE
    RAISE WARNING '⚠️  Problema al crear schema. Revisar errores arriba.';
  END IF;
END $$;
