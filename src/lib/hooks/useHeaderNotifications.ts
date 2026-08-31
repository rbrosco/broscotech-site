"use client";
import { useEffect, useMemo, useState } from "react";

export type KanbanCardRef = { id?: string | number; title?: string; name?: string };
export type KanbanColumnRef = { id: string | number; title?: string; cards?: KanbanCardRef[] };

export type NotificationItem = {
  id: string;
  message: string;
  projectId?: number;
  cardId?: number;
  toColumnId?: number;
  toColumnTitle?: string;
  fromColumnTitle?: string;
  projectTitle?: string;
  timestamp?: number;
  read?: boolean;
};

/**
 * Encapsula toda a lógica de notificações do Header:
 * - sincronização via `storage` (outras abas) e `BroadcastChannel` (mesma aba)
 * - carregamento inicial (localStorage + backend)
 * - deduplicação para exibição
 * - resolução de títulos de projeto/coluna/card
 *
 * Extraído de Header.tsx sem alterar o comportamento original.
 */
export function useHeaderNotifications() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Push notification sem duplicatas: verifica id, mensagem igual, ou cardId+toColumnId recente
  function pushNotification(notif: NotificationItem) {
    setNotifications((prev) => {
      try {
        // mesma id exata
        if (prev.some((n) => n.id === notif.id)) return prev;
        // mesma mensagem já existente
        if (notif.message && prev.some((n) => n.message === notif.message)) return prev;
        // mesmo card movido para mesma coluna recentemente (5s)
        if (notif.cardId != null && notif.toColumnId != null) {
          const now = Date.now();
          const ts = notif.timestamp ?? now;
          if (prev.some((n) => n.cardId === notif.cardId && n.toColumnId === notif.toColumnId && Math.abs((n.timestamp ?? now) - ts) < 5000)) return prev;
        }
      } catch {}
      const next = [...prev, notif].slice(-50);
      try { localStorage.setItem('notifications', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Resolve column/project/card titles for an array of notifications (mutates shallow copies)
  async function resolveTitlesForNotifications(list: NotificationItem[]) {
    try {
      // Collect notifications that include projectId to fetch specific kanbans
      const byProject = new Map<string, { columns: KanbanColumnRef[]; projectTitle?: string }>();
      const projectIds = Array.from(
        new Set(
          list
            .map((n) => n.projectId)
            .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
        )
      );
      // Fetch each project's kanban separately
      await Promise.all(projectIds.map(async (pid) => {
        try {
          const res = await fetch(`/api/kanban?projectId=${encodeURIComponent(String(pid))}`, { credentials: 'include' });
          if (!res.ok) return;
          const data = (await res.json()) as unknown;
          const rec = (typeof data === 'object' && data !== null) ? (data as Record<string, unknown>) : null;
          const columnsRaw = rec?.columns;
          const cols = Array.isArray(columnsRaw) ? (columnsRaw as KanbanColumnRef[]) : [];
          const project = (typeof rec?.project === 'object' && rec?.project !== null) ? (rec.project as Record<string, unknown>) : null;
          const title = typeof project?.title === 'string' ? project.title : undefined;
          byProject.set(String(pid), { columns: cols, projectTitle: title });
        } catch {}
      }));
      // Also fetch a default kanban to resolve any notifications without projectId
      let defaultCols: KanbanColumnRef[] = [];
      let defaultProjectTitle: string | undefined = undefined;
      try {
        const res = await fetch('/api/kanban', { credentials: 'include' });
        if (res.ok) {
          const d = (await res.json()) as unknown;
          const rec = (typeof d === 'object' && d !== null) ? (d as Record<string, unknown>) : null;
          const columnsRaw = rec?.columns;
          defaultCols = Array.isArray(columnsRaw) ? (columnsRaw as KanbanColumnRef[]) : [];
          const project = (typeof rec?.project === 'object' && rec?.project !== null) ? (rec.project as Record<string, unknown>) : null;
          defaultProjectTitle = typeof project?.title === 'string' ? project.title : undefined;
        }
      } catch {}

      return list.map((n) => {
        const copy = { ...n };
        // If no projectId, try to extract project title from message like: Card movido em "PROJECT": ...
        if (!copy.projectId && typeof copy.message === 'string') {
          try {
            const m = copy.message.match(/Card movido(?: em\s+"([^"]+)")?\s*[:|-]?\s*(.*)$/i);
            if (m && m[1]) {
              copy.projectTitle = copy.projectTitle || m[1];
            }
          } catch {}
        }
        const pid = n.projectId != null ? String(n.projectId) : null;
        const source = pid && byProject.has(pid) ? byProject.get(pid)! : { columns: defaultCols, projectTitle: defaultProjectTitle };
        const cols = source.columns || [];
        if (!copy.projectTitle && source.projectTitle) copy.projectTitle = source.projectTitle;
        if ((!copy.toColumnTitle || copy.toColumnTitle === '') && copy.toColumnId != null) {
          const t = cols.find((c) => String(c.id) === String(copy.toColumnId))?.title;
          copy.toColumnTitle = t ?? `Coluna ${copy.toColumnId}`;
        }
        // try resolve card title if missing
        let cardTitle: string | undefined = undefined;
        if (copy.cardId != null) {
          for (const c of cols) {
            const found = (c.cards || []).find((card) => String(card.id) === String(copy.cardId));
            if (found) { cardTitle = found.title ?? found.name; break; }
          }
        }
        const toLabel = copy.toColumnTitle ? (copy.projectTitle ? `${copy.toColumnTitle} (${copy.projectTitle})` : copy.toColumnTitle) : (copy.toColumnId != null ? `Coluna ${copy.toColumnId}` : '?');
        const targetLabel = copy.projectTitle ? `${copy.projectTitle}: ${toLabel}` : toLabel;
        copy.message = cardTitle ? `Card movido: ${cardTitle} → ${targetLabel}` : `Card #${copy.cardId ?? '?'} movido para ${targetLabel}`;
        return copy;
      });
    } catch {
      return list;
    }
  }

  // Ouvir eventos de storage para notificações do Kanban (ex.: movimento de card, outras abas)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      try {
        if (e.key === 'kanban:cardMoved') {
          const logged = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
          if (!logged) return;
          const payload = e.newValue ? JSON.parse(e.newValue) : null;
          (async () => {
            let toColTitle: string | undefined = payload?.toColumnTitle ?? undefined;
            let projectTitle: string | undefined = payload?.projectTitle ?? undefined;
            try {
              // If payload contains projectId, fetch that project's kanban to resolve titles reliably
              const q = payload?.projectId ? `?projectId=${encodeURIComponent(String(payload.projectId))}` : '';
              const resCols = await fetch(`/api/kanban${q}`, { credentials: 'include' });
              if (resCols.ok) {
                const dataCols = await resCols.json();
                const col = (dataCols?.columns || []).find((x: { id?: string | number; title?: string }) => String(x.id) === String(payload?.toColumnId));
                if (col?.title) toColTitle = col.title;
                if (!projectTitle && dataCols?.project?.title) projectTitle = dataCols.project.title;
              }
            } catch {}

            const toLabel = (() => {
              if (toColTitle) return projectTitle ? `${toColTitle} (${projectTitle})` : toColTitle;
              if (payload?.toColumnId != null) return projectTitle ? `Coluna ${payload.toColumnId} (${projectTitle})` : `Coluna ${payload.toColumnId}`;
              return '?';
            })();
            let cardTitle = payload?.cardTitle ?? undefined;
            if (!cardTitle) {
              try {
                const resAll = await fetch('/api/kanban', { credentials: 'include' });
                if (resAll.ok) {
                  const dataAll = await resAll.json();
                  for (const c of (dataAll?.columns || [])) {
                    const found = (c.cards || []).find((card: { id?: string | number; title?: string; name?: string }) => String(card.id) === String(payload?.cardId));
                    if (found) { cardTitle = (found.title ?? found.name) as string | undefined; break; }
                  }
                }
              } catch {}
            }
            const targetLabel = projectTitle ? `${projectTitle}: ${toLabel}` : toLabel;
            const msg = cardTitle
              ? `Card movido: ${cardTitle} → ${cardTitle ? targetLabel : ''}`
              : `Card #${payload?.cardId ?? '?'} movido para ${cardTitle}`;
            const notif = { id: String(payload?.timestamp ?? Date.now()) + '-' + String(payload?.cardId ?? ''), message: msg, cardId: payload?.cardId, toColumnId: payload?.toColumnId, toColumnTitle: toColTitle, projectTitle, timestamp: payload?.timestamp ?? Date.now(), read: false };
            pushNotification(notif);
            setHasNewNotifications(true);
            try {
              setIsNotificationOpen(true);
              setTimeout(() => setIsNotificationOpen(false), 6000);
            } catch {}
          })();
        }
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  // Também ouvir BroadcastChannel para sinalizar movimentos do Kanban na mesma aba
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('kanban');
    const handler = (ev: MessageEvent) => {
      try {
        if (ev.data && ev.data.type === 'cardMoved') {
          const logged = localStorage.getItem('isLoggedIn') === 'true';
          if (!logged) return;
          const payload = ev.data;
          (async () => {
            let toColTitle: string | undefined = payload?.toColumnTitle ?? undefined;
            let projectTitle: string | undefined = payload?.projectTitle ?? undefined;
            let cardTitle: string | undefined = payload?.cardTitle ?? undefined;
            try {
              // Prefer fetching the specific project's kanban when projectId is present
              const q = payload?.projectId ? `?projectId=${encodeURIComponent(String(payload.projectId))}` : '';
              const resCols = await fetch(`/api/kanban${q}`, { credentials: 'include' });
              if (resCols.ok) {
                const dataCols = await resCols.json();
                const col = (dataCols?.columns || []).find((x: { id?: string | number; title?: string }) => String(x.id) === String(payload?.toColumnId));
                if (col?.title) toColTitle = col.title;
                if (!projectTitle && dataCols?.project?.title) projectTitle = dataCols.project.title;
                if (!cardTitle) {
                  for (const c of (dataCols?.columns || [])) {
                    const found = (c.cards || []).find((card: { id?: string | number; title?: string; name?: string }) => String(card.id) === String(payload?.cardId));
                    if (found) { cardTitle = (found.title ?? found.name) as string | undefined; break; }
                  }
                }
              }
            } catch {}

            const toLabel = (() => {
              if (toColTitle) return projectTitle ? `${toColTitle} (${projectTitle})` : toColTitle;
              if (payload?.toColumnId != null) return projectTitle ? `Coluna ${payload.toColumnId} (${projectTitle})` : `Coluna ${payload.toColumnId}`;
              return '?';
            })();
            const targetLabel = projectTitle ? `${projectTitle}: ${toLabel}` : toLabel;
            const msg = cardTitle
              ? `Card movido: ${cardTitle} → ${targetLabel}`
              : `Card #${payload?.cardId ?? '?'} movido para ${cardTitle}`;
            const notif = { id: String(payload?.timestamp ?? Date.now()) + '-' + String(payload?.cardId ?? ''), message: msg, cardId: payload?.cardId, toColumnId: payload?.toColumnId, toColumnTitle: toColTitle, projectTitle, timestamp: payload?.timestamp ?? Date.now(), read: false };
            pushNotification(notif);
            setHasNewNotifications(true);
            try {
              setIsNotificationOpen(true);
              setTimeout(() => setIsNotificationOpen(false), 6000);
            } catch {}
          })();
        }
      } catch {
        // ignore
      }
    };
    bc.addEventListener('message', handler);
    return () => {
      bc.removeEventListener('message', handler);
      bc.close();
    };
  }, []);

  // Carregar notificações do localStorage no mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          void (async () => {
            const resolved = await resolveTitlesForNotifications(parsed.slice(-50));
            setNotifications(resolved);
          })();
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Carregar notificações do backend
  useEffect(() => {
    if (typeof window === 'undefined') return;
    void (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const payload = await res.json();
        if (Array.isArray(payload?.notifications)) {
          const list = payload.notifications.slice(-50);
          const resolved = await resolveTitlesForNotifications(list);
          setNotifications(resolved);
          const anyUnread = list.some((n: { read?: boolean }) => !n.read);
          if (anyUnread && localStorage.getItem('isLoggedIn') === 'true') setHasNewNotifications(true);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Prepare notifications for render: dedupe by id and by (cardId,toColumnId,message) keeping latest
  const displayedNotifications = useMemo(() => {
    try {
      const out: typeof notifications = [];
      const seenIds = new Set<string>();
      const seenKeys = new Set<string>();
      const reversed = notifications.slice().reverse();
      for (const n of reversed) {
        if (!n) continue;
        if (seenIds.has(n.id)) continue;
        // Include projectId in the deduplication key to ensure per-project uniqueness
        const key = `${n.projectId ?? ''}_${n.cardId ?? ''}_${n.toColumnId ?? ''}_${String(n.message ?? '')}`;
        if (seenKeys.has(key)) continue;
        seenIds.add(n.id);
        seenKeys.add(key);
        out.push(n);
      }
      return out;
    } catch {
      return notifications.slice().reverse();
    }
  }, [notifications]);

  function toggleNotificationDropdown() {
    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);
    if (nextOpen) {
      // marcar todas como lidas
      setNotifications((prev) => {
        const next = prev.map((n) => ({ ...n, read: true }));
        try { localStorage.setItem('notifications', JSON.stringify(next)); } catch {}
        return next;
      });
      setHasNewNotifications(false);
    }
  }

  function timeAgo(timestamp?: number) {
    if (timestamp == null || Number.isNaN(Number(timestamp))) return '?';
    const diff = Math.floor((Date.now() - Number(timestamp)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  function clearForSignOut() {
    setNotifications([]);
    setHasNewNotifications(false);
    setIsNotificationOpen(false);
    try { localStorage.removeItem('notifications'); } catch {}
  }

  return {
    isNotificationOpen,
    setIsNotificationOpen,
    hasNewNotifications,
    setHasNewNotifications,
    notifications,
    setNotifications,
    displayedNotifications,
    toggleNotificationDropdown,
    timeAgo,
    clearForSignOut,
  };
}
