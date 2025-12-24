import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_PATH = path.join(process.cwd(), 'tmp', 'iaagent-sessions.json');

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { sessions: [] };
  }
}

async function writeData(data: any) {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // ignore write errors
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await readData();
  const s = (data.sessions || []).find((x: any) => String(x.id) === String(id));
  if (!s) return NextResponse.json({ messages: [] });
  return NextResponse.json({ messages: s.messages || [] });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const text = String(body?.text ?? '');
    const from = body?.from === 'agent' ? 'agent' : 'client';
    const data = await readData();
    data.sessions = data.sessions || [];
    let s = data.sessions.find((x: any) => String(x.id) === String(id));
    if (!s) {
      // create session if missing
      s = { id, title: body?.title ?? `Sessão ${id}`, updatedAt: new Date().toISOString(), messages: [] };
      data.sessions.unshift(s);
    }
    const msg = { id: randomUUID(), text, from, timestamp: new Date().toISOString() };
    s.messages = s.messages || [];
    s.messages.push(msg);
    s.updatedAt = new Date().toISOString();
    await writeData(data);
    return NextResponse.json({ message: 'OK', msg }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Erro ao inserir mensagem' }, { status: 500 });
  }
}
