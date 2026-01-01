import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FILE = path.join(process.cwd(), 'tmp', 'notifications.json');

async function readFileSafe() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeFileSafe(data: unknown) {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function GET() {
  const list = await readFileSafe();
  return NextResponse.json({ notifications: list });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const list = await readFileSafe();
    const id = String(body.timestamp ?? Date.now()) + '-' + String(Math.random()).slice(2,8);
    const item = { id, message: body.message ?? '', cardId: body.cardId ?? null, toColumnId: body.toColumnId ?? null, timestamp: body.timestamp ?? Date.now(), read: !!body.read };
    list.push(item);
    await writeFileSafe(list);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const list = await readFileSafe();
    const idx = list.findIndex((n: { id: string }) => n.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    list[idx] = { ...list[idx], ...body.updates };
    await writeFileSafe(list);
    return NextResponse.json({ ok: true, item: list[idx] });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
