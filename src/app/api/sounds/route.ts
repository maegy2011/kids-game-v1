import { db } from "@/lib/db";
import { animalSound } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const sounds = await db.select().from(animalSound);
    return NextResponse.json(sounds);
  } catch (error) {
    console.error("Error fetching sounds:", error);
    return NextResponse.json({ error: "Failed to fetch sounds" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, soundUrl } = body;

    if (!name || !category || !soundUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    const existing = await db.select().from(animalSound).where(eq(animalSound.name, name));
    
    if (existing.length > 0) {
      await db.update(animalSound)
        .set({ soundUrl, updatedAt: now })
        .where(eq(animalSound.name, name));
      
      return NextResponse.json({ message: "Sound updated", id: existing[0].id });
    }

    await db.insert(animalSound).values({
      id,
      name,
      category,
      soundUrl,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ message: "Sound created", id });
  } catch (error) {
    console.error("Error creating sound:", error);
    return NextResponse.json({ error: "Failed to create sound" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await db.delete(animalSound).where(eq(animalSound.id, id));
    return NextResponse.json({ message: "Sound deleted" });
  } catch (error) {
    console.error("Error deleting sound:", error);
    return NextResponse.json({ error: "Failed to delete sound" }, { status: 500 });
  }
}
