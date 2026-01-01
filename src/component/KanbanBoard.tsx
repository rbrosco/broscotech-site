import React, { useState, useEffect, useCallback } from 'react';

export type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  responsavel?: string | null;
  data?: string | null;
  position: number;
};

export type KanbanColumn = {
  id: number;
  project_id: number;
  title: string;
  position: number;
  cards: KanbanCard[];
};

export type KanbanResponse = {
  project: { id: number; title: string };
  columns: KanbanColumn[];
};

export interface KanbanBoardProps {
  projectId: number;
  apiBase?: string; // default: '/api/kanban'
  onError?: (msg: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, apiBase = '/api/kanban', onError }) => {
    // Função para mover card entre colunas
    const moveCard = async (cardId: number, toColumnId: number) => {
      try {
        await fetch(`${apiBase}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ cardId, toColumnId }),
        });
        reload();
      } catch {
        setError('Erro ao mover card');
      }
    };
  const [data, setData] = useState<KanbanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}?projectId=${projectId}`, { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Falha ao carregar Kanban.');
      if (!payload.project || !payload.columns) throw new Error('Resposta inválida do servidor.');
      setData(payload as KanbanResponse);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
      setError(msg);
      if (onError) onError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, apiBase, onError]);

  useEffect(() => { reload(); }, [reload]);

  // ... (restante: createColumn, createCard, moveCard, renderização, etc)
  // O KanbanBoard não deve depender de lógica UBVA nem de notificações externas

  if (loading) return <div>Carregando Kanban...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!data) return <div>Nenhum dado de Kanban encontrado.</div>;

  return (
    <div style={{ width: '100%', overflowX: 'auto', maxWidth: '100vw', maxHeight: '70vh' }}>
      <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 10, padding: 16, marginBottom: 18, color: '#ad8b00', fontSize: 15 }}>
        <strong>Aviso Importante:</strong>
        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 22 }}>
          <li>Serviços extras não previstos no escopo inicial do projeto serão orçados e cobrados à parte.</li>
          <li>Valores de manutenção, suporte ou integrações adicionais podem ser negociados conforme necessidade.</li>
          <li>Solicitações de alteração após a entrega do projeto podem gerar custos adicionais.</li>
          <li>Para dúvidas ou novos serviços, entre em contato com a equipe.</li>
          <li>Para dúvidas ou novos serviços, entre em contato com a equipe EasyDev.</li>
        </ul>
      </div>
      <h2 style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>{data.project.title}</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', overflowX: 'auto', maxWidth: '100vw', minHeight: '45vh', maxHeight: '65vh' }}>
        {data.columns.map((col) => (
          <div
            key={col.id}
            style={{ minWidth: 340, maxWidth: 400, background: '#f8fafc', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px #0001', border: '1.5px solid #cbd5e1', maxHeight: '75vh', overflowY: 'auto' }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              const cardId = Number(e.dataTransfer.getData('cardId'));
              const fromColumnId = Number(e.dataTransfer.getData('fromColumnId'));
              if (cardId && fromColumnId && fromColumnId !== col.id && !col.cards.some(c => c.id === cardId)) {
                // Atualiza visualmente sem reload
                setData((prev) => {
                  if (!prev) return prev;
                  const columns = prev.columns.map(column => {
                    if (column.id === fromColumnId) {
                      return { ...column, cards: column.cards.filter(c => c.id !== cardId) };
                    }
                    if (column.id === col.id) {
                      const movedCard = prev.columns.find(c => c.id === fromColumnId)?.cards.find(c => c.id === cardId);
                      return movedCard ? { ...column, cards: [...column.cards, movedCard] } : column;
                    }
                    return column;
                  });
                  return { ...prev, columns };
                });
                // Atualiza backend
                moveCard(cardId, col.id);
              }
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {col.cards.length === 0 && <div style={{ color: '#888', fontSize: 13 }}>Nenhum card</div>}
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('cardId', String(card.id));
                    e.dataTransfer.setData('fromColumnId', String(col.id));
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: '0 2px 8px #0002',
                    border: '1.5px solid #cbd5e1',
                    cursor: 'grab',
                    minHeight: 90,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{card.title}</div>
                  {card.description && <div style={{ fontSize: 13, color: '#444', marginTop: 4, whiteSpace: 'pre-line' }}>{card.description}</div>}
                  {card.responsavel && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Responsável: {card.responsavel}</div>}
                  {card.data && <div style={{ fontSize: 12, color: '#666' }}>Data: {card.data}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
