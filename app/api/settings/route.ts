import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

// Helper to get settings
const getSettings = () => {
    if (!fs.existsSync(path.dirname(settingsPath))) fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    if (!fs.existsSync(settingsPath)) {
        const defaultSettings = { dropTitle: "Next Drop Inbound", dropDate: new Date(Date.now() + 86400000 * 7).toISOString() }; // Default 7 days
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
};

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function POST(req: Request) {
  try {
      const body = await req.json();
      const current = getSettings();
      const newSettings = { ...current, ...body };
      
      fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
      return NextResponse.json({ success: true, settings: newSettings });
  } catch (err) {
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}