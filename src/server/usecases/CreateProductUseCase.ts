import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { Product } from "@/domain/entities/Product";


type CreateProductInput = {
    nome: string;
    preco: number;
    quantidade: number;
    supplierId: string;
}

export class CreateProductUseCase {
    constructor(private productReposytory: ProductRepository) { }

    async execute(input: CreateProductInput) {
        const { nome, preco, quantidade, supplierId } = input;

        if (!nome || preco == null || quantidade == null || !supplierId) {
            throw new Error("Nome, preço, quantidade e fornecedor são obrigatórios.");
        }
        if (preco <= 0) {
            throw new Error("O preço deve ser um valor positivo.");
        }
        if (quantidade <= 0) {
            throw new Error("A quantidade deve ser um valor positivo.");
        }

        //Validar se o nome do produto é único
        const existingProduct = await this.productReposytory.findAll();
        if (existingProduct.some(p => p.nome === nome)) {
            throw new Error("O nome do produto já está em uso.");
        }
        // Criar a entidade do produto
        const product = new Product(
            crypto.randomUUID(),
            nome,
            preco,
            quantidade,
            supplierId,
            new Date(),
            new Date(),
            null
        );
        await this.productReposytory.create(product);
        return product;

    }
    }