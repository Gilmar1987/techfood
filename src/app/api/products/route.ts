import { createProductUseCase } from '@/server/container';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nome, preco, quantidade } = body;

        if (!nome || preco === undefined || quantidade === undefined) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        await createProductUseCase.execute({
            nome: String(nome),
            preco: Number(preco),
            quantidade: Number(quantidade),
        });

        return NextResponse.json({ message: 'Product created successfully' }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Failed to create product' }, { status: 400 });
    }
}