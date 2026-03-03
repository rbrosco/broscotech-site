import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_PATH = path.join(process.cwd(), 'tmp', 'iaagent-sessions.json');

type SessionMessage = { id: string; text: string; from: 'agent' | 'client'; timestamp: string };
type Session = { id: string; title: string; updatedAt: string; messages: SessionMessage[] };
type StoredData = { sessions: Session[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function coerceStoredData(value: unknown): StoredData {
  if (!isRecord(value) || !Array.isArray(value.sessions)) return { sessions: [] };
  return { sessions: value.sessions as Session[] };
}

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return coerceStoredData(JSON.parse(raw) as unknown);
  } catch {
    return { sessions: [] } satisfies StoredData;
  }
}

async function writeData(data: unknown) {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore write errors
  }
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await readData();
  const s = (data.sessions || []).find((x) => String(x.id) === String(id));
  if (!s) return NextResponse.json({ messages: [] });
  return NextResponse.json({ messages: s.messages || [] });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const text = String(body?.text ?? '');
    const from: SessionMessage['from'] = body?.from === 'agent' ? 'agent' : 'client';
    const data = await readData();
    data.sessions = data.sessions || [];
    let s = data.sessions.find((x) => String(x.id) === String(id));
    if (!s) {
      // create session if missing
      s = { id, title: body?.title ?? `Sessão ${id}`, updatedAt: new Date().toISOString(), messages: [] };
      data.sessions.unshift(s);
    }
    const msg: SessionMessage = { id: randomUUID(), text, from, timestamp: new Date().toISOString() };
    s.messages = s.messages || [];
    s.messages.push(msg);
    s.updatedAt = new Date().toISOString();
    await writeData(data);
    return NextResponse.json({ message: 'OK', msg }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Erro ao inserir mensagem' }, { status: 500 });
  }
}
