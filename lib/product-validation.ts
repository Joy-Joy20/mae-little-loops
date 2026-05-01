export type ProductPayload = {
  name: string;
  price: number;
  category: "bouquet" | "keychain";
  stock: number;
  description: string;
  image_url: string;
};

export function validateAndNormalizeProductInput(input: unknown): {
  data: ProductPayload | null;
  errors: string[];
} {
  if (!input || typeof input !== "object") {
    return { data: null, errors: ["Product payload is invalid."] };
  }

  const payload = input as Record<string, unknown>;
  const name = String(payload.name ?? "").trim();
  const category = String(payload.category ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const imageUrl = String(payload.image_url ?? "").trim();
  const price = Number(payload.price);
  const stock = Number(payload.stock);
  const errors: string[] = [];

  if (!name) errors.push("Product name is required.");
  if (!Number.isFinite(price) || price <= 0) {
    errors.push("Price must be greater than 0.");
  }
  if (category !== "bouquet" && category !== "keychain") {
    errors.push("Category must be bouquet or keychain.");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push("Stock must be a whole number that is 0 or higher.");
  }
  if (!description) errors.push("Description is required.");

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      price,
      category: category as "bouquet" | "keychain",
      stock,
      description,
      image_url: imageUrl,
    },
    errors: [],
  };
}
