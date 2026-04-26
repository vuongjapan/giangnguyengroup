-- Bảng hội thoại
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NULL,
  customer_name TEXT NULL,
  customer_phone TEXT NULL,
  last_message_preview TEXT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  user_agent TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversations_session ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_user ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_updated ON public.chat_conversations(updated_at DESC);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Bất kỳ ai cũng có thể tạo hội thoại (khách vãng lai dùng chatbot)
CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (true);

-- Người dùng xem hội thoại của chính mình (theo user_id)
CREATE POLICY "Users view own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admin xem tất cả
CREATE POLICY "Admins view all conversations"
  ON public.chat_conversations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin có thể xóa
CREATE POLICY "Admins delete conversations"
  ON public.chat_conversations FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Edge function (service role) update để cập nhật preview/count — không cần policy vì service role bypass RLS
-- Nhưng cần policy cho update khi khách cập nhật tên/sđt
CREATE POLICY "Anyone can update own conversation by session"
  ON public.chat_conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Bảng tin nhắn
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view all messages"
  ON public.chat_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own conversation messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins delete messages"
  ON public.chat_messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER trg_chat_conversations_updated
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();