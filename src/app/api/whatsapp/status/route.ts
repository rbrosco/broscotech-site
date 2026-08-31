import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewareAuth';
import {
  getEvolutionInstances,
  getConnectionState,
  isEvolutionConfigured,
} from '@/lib/evolution';

/**
 * Status de conexão de todas as instâncias configuradas
 * (EVOLUTION_INSTANCES no .env) — usado pela tela Configurações > WhatsApp
 * para exibir "conectado"/"desconectado" por instância/dev.
 */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
  if (!auth || !auth.id) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }
  const isAdmin = (auth as { role?: string }).role === 'admin';
  if (!isAdmin) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  if (!isEvolutionConfigured()) {
    return NextResponse.json({ configured: false, instances: [] });
  }

  const instances = getEvolutionInstances();
  const results = await Promise.all(
    instances.map(async (name) => {
      const result = await getConnectionState(name);
      return {
        name,
        state: result.ok ? result.state : 'unknown',
        error: result.ok ? null : result.error,
      };
    })
  );

  return NextResponse.json({ configured: true, instances: results });
}
