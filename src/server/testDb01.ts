import { productRepository } from "./container";

export async function testDb() {
  console.log("Testing database connection...");
    return await productRepository.findAll().then(products => {
        console.log("Products retrieved from the database:", products);
        return { data: products, status: "success" };
    }).catch(error => {
        console.error("Error retrieving products from the database:", error);
        return { data: null, status: "error", error: error.message };
    });
}