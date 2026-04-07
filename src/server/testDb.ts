import {prisma} from "@/infrastructure/prismaClient";

export async function testDb() {
    try {
        const products = await prisma.product.findMany();
        return { message: "Success", data: products }; // Retorna o array de produtos
    } catch (error) {
        return { message: "Error", data: [] };
    }   
}