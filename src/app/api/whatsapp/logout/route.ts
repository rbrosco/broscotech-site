import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewareAuth';
import { logoutInstance, getEvolutionInstances, isEvolutionConfigured } from '@/lib/evolution';

/** Desconecta uma instância (o admin precisa escanear o QR de novo depois). */
export async function POST(request: NextRequest) {
  const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
  if (!auth || !auth.id) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }
  const isAdmin = (auth as { role?: string }).role === 'admin';
  if (!isAdmin) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  if (!isEvolutionConfigured()) {
    return NextResponse.json({ message: 'Evolution API não configurada no servidor.' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const instance = String(body?.instance || '');
  if (!instance) {
    return NextResponse.json({ message: 'Parâmetro instance é obrigatório.' }, { status: 400 });
  }

  const knownInstances = getEvolutionInstances();
  if (knownInstances.length > 0 && !knownInstances.includes(instance)) {
    return NextResponse.json({ message: 'Instância não reconhecida.' }, { status: 400 });
  }

  const result = await logoutInstance(instance);
  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: 'Instância desconectada.' });
}
