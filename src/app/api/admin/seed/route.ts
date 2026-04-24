import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prismaClient";
import { Role } from "@/domain/entities/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const secret = request.headers.get("x-admin-secret");
    if (secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "email and password are required" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email,
                password: hashed,
                role: Role.ADMIN,
            },
        });

        return NextResponse.json({ message: "Admin created" }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
