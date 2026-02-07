import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'products.json');
    if (!fs.existsSync(dataPath)) return NextResponse.json([]);
    const fileData = fs.readFileSync(dataPath, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
      const body = await req.json();
      console.log("📝 Received Product Data:", body.name);

      // 1. DEFINING PATHS
      const dataDir = path.join(process.cwd(), 'data');
      const dataPath = path.join(dataDir, 'products.json');

      // 2. ENSURING DIRECTORY EXISTS
      if (!fs.existsSync(dataDir)) {
          console.log("📂 Creating 'data' folder...");
          fs.mkdirSync(dataDir, { recursive: true });
      }

      // 3. READING EXISTING DATA
      let products = [];
      if (fs.existsSync(dataPath)) {
          try {
              const fileContent = fs.readFileSync(dataPath, 'utf8');
              if (fileContent.trim()) {
                  products = JSON.parse(fileContent);
              }
          } catch (err) {
              console.warn("⚠️ Database file corrupted. Starting fresh.");
          }
      }

      // 4. CREATING NEW PRODUCT
      const newProduct = {
          id: 'prod-' + Date.now(),
          name: body.name,
          price: Number(body.price),
          images: body.images || [],
          colors: body.colors || ['Black'],
          sizes: body.sizes || ['S', 'M', 'L'],
          category: body.category || 'clothes',
          collection: body.collection || 'General',
          description: body.description || ''
      };

      products.push(newProduct);

      // 5. SAVING TO FILE
      fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
      console.log("✅ Product Saved Successfully!");

      return NextResponse.json({ success: true, product: newProduct });

  } catch (err: any) {
      console.error("❌ SERVER SAVE ERROR:", err);
      // Return the EXACT error message to the frontend
      return NextResponse.json({ error: err.message || "Unknown Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const dataPath = path.join(process.cwd(), 'data', 'products.json');
  
  if (fs.existsSync(dataPath)) {
      let products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      products = products.filter((p: any) => p.id !== id);
      fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
  }
  return NextResponse.json({ success: true });
}