import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewareAuth';
import { fetchQrCode, getEvolutionInstances, isEvolutionConfigured } from '@/lib/evolution';

/**
 * Retorna o QR code (base64) para conectar uma instância Evolution ao
 * WhatsApp. Cria a instância automaticamente na Evolution se ainda não
 * existir. GET /api/whatsapp/qrcode?instance=nome
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
    return NextResponse.json({ message: 'Evolution API não configurada no servidor (EVOLUTION_API_URL/EVOLUTION_API_KEY).' }, { status: 400 });
  }

  const url = new URL(request.url);
  const instance = url.searchParams.get('instance');
  if (!instance) {
    return NextResponse.json({ message: 'Parâmetro instance é obrigatório.' }, { status: 400 });
  }

  const knownInstances = getEvolutionInstances();
  if (knownInstances.length > 0 && !knownInstances.includes(instance)) {
    return NextResponse.json({ message: 'Instância não reconhecida (verifique EVOLUTION_INSTANCES no .env).' }, { status: 400 });
  }

  // Base pública usada para configurar o webhook de recebimento de mensagens
  // ao criar a instância — cai em NEXT_PUBLIC_APP_URL ou no host da própria request.
  const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  const result = await fetchQrCode(instance, publicBaseUrl);
  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 502 });
  }

  return NextResponse.json({ base64: result.base64, state: result.state });
}
