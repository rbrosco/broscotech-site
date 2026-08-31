'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Session = { id: string; title: string; updatedAt: string };
export type Message = { id: string; text: string; from: 'client' | 'agent' | 'admin'; timestamp: string; imageUrl?: string };
export type VisitorData = { name: string; email: string };

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

/**
 * Toda a lógica de estado e chamadas de API do Agente de IA (sessões,
 * mensagens, onboarding de visitante anônimo, envio ao provedor de IA)
 * extraída de src/app/iaagent/page.tsx para ser reaproveitada tanto pela
 * página completa (/iaagent) quanto pelo popup flutuante (IAAgentPopup).
 *
 * Comportamento idêntico ao original: usuários autenticados persistem
 * sessões/mensagens via API (Postgres); visitantes anônimos usam
 * localStorage até fornecerem nome+e-mail (onboarding), e a partir daí
 * ficam "presos" àquele navegador (sem login).
 */
export function useIAAgentChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [visitor, setVisitor] = useState<VisitorData | null>(null);

  const [projects, setProjects] = useState<{ id: number; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Auth check & load visitor info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          setAuthed(true);
        } else {
          const cached = localStorage.getItem('easydev_visitor_data');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.name && parsed.email) setVisitor(parsed);
            } catch {}
          }
        }
      } catch {
        const cached = localStorage.getItem('easydev_visitor_data');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.name && parsed.email) setVisitor(parsed);
          } catch {}
        }
      }
      setCheckingAuth(false);
    })();
  }, []);

  // Load projects if authed
  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const res = await fetch('/api/projects?all=1', { credentials: 'include' });
        if (res.ok) {
          const p = (await res.json()) as { projects?: { id: number; title: string }[]; project?: { id: number; title: string } };
          const list = p.projects ?? (p.project ? [p.project] : []);
          setProjects(list);
          if (list.length > 0) setSelectedProjectId(Number(list[0].id));
        }
      } catch {}
    })();
  }, [authed]);

  // Load sessions (Authed vs Visitor)
  const loadSessions = useCallback(async () => {
    if (authed) {
      try {
        const url = selectedProjectId ? `/api/iaagent/sessions?projectId=${selectedProjectId}` : '/api/iaagent/sessions';
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const p = (await res.json()) as { sessions?: Session[] };
          const newSessions = p.sessions ?? [];
          setSessions(newSessions);
          setSelected((prev) => {
            if (!prev) return null;
            if (!newSessions.some((s) => s.id === prev.id)) return null;
            return prev;
          });
        }
      } catch {}
    } else {
      try {
        const raw = localStorage.getItem('easydev_visitor_sessions');
        const localSessions: Session[] = raw ? JSON.parse(raw) : [];
        setSessions(localSessions);
        setSelected((prev) => prev ?? (localSessions.length > 0 ? localSessions[0] : null));
      } catch {}
    }
  }, [authed, selectedProjectId]);

  useEffect(() => {
    if (!checkingAuth) {
      void loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth, authed]);

  // Load messages for selected session
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);

    if (authed) {
      (async () => {
        try {
          const res = await fetch(`/api/iaagent/sessions/${selected.id}/messages`, { credentials: 'include' });
          if (res.ok) {
            const p = (await res.json()) as { messages?: Message[] };
            setMessages(p.messages ?? []);
          }
        } catch {}
        setLoadingMsgs(false);
      })();
    } else {
      try {
        const key = `easydev_visitor_msgs_${selected.id}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          setMessages(JSON.parse(raw));
        } else {
          const vName = visitor?.name?.split(' ')[0] || 'visitante';
          const welcomeMsg: Message = {
            id: 'welcome-1',
            from: 'agent',
            text: `Olá, ${vName}! Sou o Agente de Inteligência Artificial da EasyDev. 👋\n\nComo posso te ajudar hoje? Posso tirar dúvidas sobre nossos serviços (Web Apps, SaaS, APIs, Automações com n8n), estimar escopos ou estruturar o briefing do seu projeto!`,
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMsg]);
          localStorage.setItem(key, JSON.stringify([welcomeMsg]));
        }
      } catch {}
      setLoadingMsgs(false);
    }
  }, [selected, authed, visitor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitVisitor = (name: string, email: string): string | null => {
    const nameTrim = name.trim();
    const emailTrim = email.trim();

    if (!nameTrim || !emailTrim) return 'Por favor, informe seu nome completo e e-mail.';
    if (!emailTrim.includes('@')) return 'Por favor, insira um e-mail válido.';

    const vData: VisitorData = { name: nameTrim, email: emailTrim.toLowerCase() };
    setVisitor(vData);
    localStorage.setItem('easydev_visitor_data', JSON.stringify(vData));

    const newSessionId = crypto.randomUUID();
    const firstSession: Session = {
      id: newSessionId,
      title: `Briefing Inicial (${nameTrim.split(' ')[0]})`,
      updatedAt: new Date().toISOString(),
    };
    const updatedSessions = [firstSession];
    setSessions(updatedSessions);
    setSelected(firstSession);
    localStorage.setItem('easydev_visitor_sessions', JSON.stringify(updatedSessions));
    return null;
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !attachedImage) || !selected || sending) return;
    setInput('');
    const currentImage = attachedImage;
    setAttachedImage(null);
    setSending(true);

    const clientMsg: Message = {
      id: crypto.randomUUID(),
      text,
      from: 'client',
      imageUrl: currentImage || undefined,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, clientMsg];
    setMessages(updatedMessages);

    if (authed) {
      try {
        await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from: 'client', imageUrl: currentImage || undefined }),
        });
      } catch {}
    } else {
      localStorage.setItem(`easydev_visitor_msgs_${selected.id}`, JSON.stringify(updatedMessages));
    }

    try {
      const historyForAI = updatedMessages.map((m) => ({
        role: m.from === 'client' ? 'user' : 'assistant',
        content: m.text,
        imageUrl: m.imageUrl,
      }));

      const baseSystemPrompt =
        localStorage.getItem('IA_SYSTEM_PROMPT') ??
        'Você é o Agente de Inteligência Artificial oficial da EasyDev (easydev.com.br). Você é prestativo, técnico, objetivo e amigável. Seu papel é explicar os serviços da EasyDev (Next.js, React, Node.js, PostgreSQL, Automações n8n, IA), coletar briefings de projetos e ajudar clientes e visitantes a estruturarem suas ideias em soluções digitais de alto impacto.';

      const clientName = authed ? 'Cliente Cadastrado' : visitor?.name || 'Visitante';
      const clientEmail = visitor?.email ? ` | E-mail: ${visitor.email}` : '';
      const projTitle = projects.find((p) => p.id === selectedProjectId)?.title;

      const systemPromptWithContext = `[Informações do Usuário Atual]: Nome: "${clientName}"${clientEmail}. ${
        projTitle ? `O usuário está falando sobre o projeto: "${projTitle}".` : 'Este é um visitante interessado em criar ou tirar dúvidas sobre soluções digitais.'
      }\n\n${baseSystemPrompt}`;

      const savedProvider = localStorage.getItem('IA_PROVIDER') || 'groq';
      const savedCustomUrl = localStorage.getItem('IA_CUSTOM_BASE_URL') || '';
      const savedApiKey =
        localStorage.getItem('IA_API_KEY') ||
        localStorage.getItem(`${savedProvider.toUpperCase()}_API_KEY`) ||
        '';
      const savedModel =
        localStorage.getItem('IA_MODEL') ||
        localStorage.getItem(`${savedProvider.toUpperCase()}_MODEL`) ||
        '';
      const savedTemp = parseFloat(localStorage.getItem('IA_TEMPERATURE') || '0.7');
      const savedMaxTokens = parseInt(localStorage.getItem('IA_MAX_TOKENS') || '2048', 10);
      const savedTopP = parseFloat(localStorage.getItem('IA_TOP_P') || '1.0');

      const aiRes = await fetch('/api/iaagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForAI,
          provider: savedProvider,
          customBaseUrl: savedCustomUrl || undefined,
          apiKey: savedApiKey || undefined,
          model: savedModel || undefined,
          temperature: isNaN(savedTemp) ? 0.7 : savedTemp,
          maxTokens: isNaN(savedMaxTokens) ? 2048 : savedMaxTokens,
          topP: isNaN(savedTopP) ? 1.0 : savedTopP,
          systemPrompt: systemPromptWithContext,
        }),
      });

      const aiPayload = (await aiRes.json()) as { reply?: string };
      const replyText = aiPayload.reply ?? 'Desculpe, não consegui processar sua mensagem no momento.';

      const agentMsg: Message = {
        id: crypto.randomUUID(),
        text: replyText,
        from: 'agent',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, agentMsg];
      setMessages(finalMessages);

      if (authed) {
        await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: replyText, from: 'agent' }),
        });
      } else {
        localStorage.setItem(`easydev_visitor_msgs_${selected.id}`, JSON.stringify(finalMessages));
      }
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        text: 'Erro de conexão com o agente. Tente novamente em alguns instantes.',
        from: 'agent',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
    setSending(false);
  };

  const handleNewSession = async (titleInput: string) => {
    const title = titleInput.trim() || `Sessão ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    if (authed) {
      let projectId = selectedProjectId;
      if (!projectId) {
        try {
          const projectRes = await fetch('/api/projects', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Meu Projeto' }),
          });
          if (projectRes.ok) {
            const projectPayload = (await projectRes.json()) as { project?: { id: number; title: string } };
            if (projectPayload.project) {
              setProjects((prev) => [projectPayload.project!, ...prev]);
              projectId = projectPayload.project.id;
              setSelectedProjectId(projectId);
            }
          }
        } catch {}
      }
      if (!projectId) return;

      try {
        const res = await fetch('/api/iaagent/sessions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, projectId }),
        });
        if (res.ok) {
          const p = (await res.json()) as { session?: Session };
          if (p.session) {
            setSessions((prev) => [p.session!, ...prev]);
            setSelected(p.session!);
          }
        }
      } catch {}
    } else {
      const newSession: Session = {
        id: crypto.randomUUID(),
        title,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      setSelected(newSession);
      localStorage.setItem('easydev_visitor_sessions', JSON.stringify(updated));
    }
  };

  return {
    // state
    sessions, selected, messages, input, attachedImage, sending, loadingMsgs,
    authed, checkingAuth, visitor, projects, selectedProjectId,
    // setters
    setSelected, setInput, setAttachedImage, setSelectedProjectId,
    // actions
    handleImageUpload, submitVisitor, handleSend, handleNewSession,
  };
}
