import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { Product } from "@/domain/entities/Product";
import { BusinessRuleError } from "@/domain/errors";

type CreateProductInput = {
    nome: string;
    preco: number;
    quantidade: number;
    /** Vem sempre da sessão do fornecedor, nunca do corpo da requisição. */
    supplierId: string;
};

export class CreateProductUseCase {
    constructor(private productRepository: ProductRepository) { }

    async execute(input: CreateProductInput) {
        const { nome, preco, quantidade, supplierId } = input;

        if (!nome || preco == null || quantidade == null || !supplierId) {
            throw new BusinessRuleError("Nome, preço, quantidade e fornecedor são obrigatórios.");
        }
        if (preco <= 0) {
            throw new BusinessRuleError("O preço deve ser um valor positivo.");
        }
        if (quantidade <= 0) {
            throw new BusinessRuleError("A quantidade deve ser um valor positivo.");
        }

        // Consulta indexada em vez de carregar a tabela inteira, e escopada ao
        // fornecedor: dois fornecedores podem vender um produto de mesmo nome.
        const existingProduct = await this.productRepository.findByNomeAndSupplier(nome, supplierId);
        if (existingProduct) {
            throw new BusinessRuleError("O nome do produto já está em uso.");
        }

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
        await this.productRepository.create(product);
        return product;
    }
}
