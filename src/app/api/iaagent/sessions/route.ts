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
  // Trust shape for now; this is a lightweight file-store.
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

export async function GET() {
  const data = await readData();
  return NextResponse.json({ sessions: data.sessions || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title ?? `Sessão ${new Date().toLocaleString()}`);
    const data = await readData();
    const id = randomUUID();
    const session = { id, title, updatedAt: new Date().toISOString(), messages: [] };
    data.sessions = data.sessions || [];
    data.sessions.unshift(session);
    await writeData(data);
    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Erro ao criar sessão' }, { status: 500 });
  }
}
