import { productRepository } from "./container";

export async function testDb() {
  console.log("Testing database connection...");
    return await productRepository.findAll().then(products => {
        const sanitized = JSON.stringify(products).replace(/[\r\n]/g, " ");
        console.log("Products retrieved from the database: " + sanitized);
        return { data: products, status: "success" };
    }).catch(error => {
        const sanitizedError = String(error.message).replace(/[\r\n]/g, " ");
        console.error("Error retrieving products from the database: " + sanitizedError);
        return { data: null, status: "error", error: sanitizedError };
    });
}