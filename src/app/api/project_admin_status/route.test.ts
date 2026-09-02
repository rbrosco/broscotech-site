import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from './route';

describe('DELETE /api/project_admin_status', () => {
  it('retorna 410 Gone e orienta a usar DELETE /api/projects', async () => {
    // Correção de 2026-09-02: este handler antes apagava o projeto direto
    // (repo.delete) sem limpar tabelas relacionadas (AiSession, AiMessage,
    // KanbanColumn, KanbanCard, ProjectUpdate, Notification, Invoice) nem
    // checar se o usuário era dono/admin, ao contrário de DELETE /api/projects.
    // Este teste trava que a rota fica desativada (410) em vez de voltar a
    // fazer exclusão insegura.
    const request = new NextRequest('http://localhost:4000/api/project_admin_status', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 1 }),
    });

    const response = await DELETE(request);
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.message).toMatch(/DELETE \/api\/projects/);
  });
});
