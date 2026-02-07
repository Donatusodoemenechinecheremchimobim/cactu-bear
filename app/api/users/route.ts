import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'users.json');

// Helper to get users
const getUsers = () => {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]');
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
};

export async function GET() { 
    return NextResponse.json(getUsers().map((u:any) => ({...u, password:''}))); 
}

export async function POST(req: Request) {
  const body = await req.json();
  const users = getUsers();

  // REGISTER NEW USER
  if (body.type === 'register') {
      if (users.find((u:any) => u.email === body.email)) {
          return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }
      const newUser = {
          id: 'user-' + Date.now(),
          name: body.name || 'New User',
          email: body.email,
          password: body.password,
          role: 'user',
          joined: new Date().toISOString()
      };
      users.push(newUser);
      fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
      return NextResponse.json({ success: true, user: newUser });
  }

  // CHANGE PASSWORD
  if (body.type === 'change-password') {
    const idx = users.findIndex((u:any) => u.email === body.email);
    if (idx > -1) { 
        users[idx].password = body.newPassword; 
        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2)); 
        return NextResponse.json({success:true}); 
    }
  }

  return NextResponse.json({error:'Invalid request'});
}