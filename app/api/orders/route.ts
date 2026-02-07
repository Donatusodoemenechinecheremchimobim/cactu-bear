import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
const dataPath = path.join(process.cwd(), 'data', 'orders.json');
export async function GET() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]');
  return NextResponse.json(JSON.parse(fs.readFileSync(dataPath, 'utf8')));
}
export async function POST(req: Request) {
  const newOrder = await req.json();
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]');
  const orders = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  orders.unshift({ id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(), date: new Date().toISOString(), status: 'Pending', ...newOrder });
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
  return NextResponse.json({ success: true });
}