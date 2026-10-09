export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export type ProductInput = {
  name: string;
  price: number;
  stock: number;
  description: string;
  brand: string | null;
  img: string | null;
};

export const parsePrice = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError("price must be a number greater than zero");
  }
  // at most 2 decimals (tolerance avoids floating point noise)
  if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) {
    throw new ValidationError("price must have at most 2 decimals");
  }
  if (value > 99999999.99) {
    throw new ValidationError("price is too large");
  }
  return value;
};

const parseRequiredString = (value: unknown, field: string, maxLength: number): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} must have at most ${maxLength} characters`);
  }
  return trimmed;
};

const parseOptionalString = (value: unknown, field: string, maxLength: number): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} must have at most ${maxLength} characters`);
  }
  return trimmed === "" ? null : trimmed;
};

const asObject = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("request body is required");
  }
  return body as Record<string, unknown>;
};

// Body for POST and PUT
export const parseProductBody = (body: unknown): ProductInput => {
  const { name, price, stock, description, brand, img } = asObject(body);

  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
    throw new ValidationError("stock must be an integer greater than or equal to zero");
  }

  return {
    name: parseRequiredString(name, "name", 150),
    price: parsePrice(price),
    stock,
    description: parseRequiredString(description, "description", 65535),
    brand: parseOptionalString(brand, "brand", 100),
    img: parseOptionalString(img, "img", 255),
  };
};

// Body for PATCH: only "price" is allowed
export const parsePriceBody = (body: unknown): number => {
  const obj = asObject(body);
  const keys = Object.keys(obj);
  if (keys.length !== 1 || keys[0] !== "price") {
    throw new ValidationError("body must contain only price");
  }
  return parsePrice(obj.price);
};