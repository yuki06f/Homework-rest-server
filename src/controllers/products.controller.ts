import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../conf/dbConnection.ts";
import {
  ValidationError,
  parseProductBody,
  parsePriceBody,
} from "../dtos/products/ProductDto.ts";

interface Product extends RowDataPacket {
  id: number;
  name: string;
  price: string; 
  stock: number;
  description: string;
  brand: string | null;
  img: string | null;
  active: number; 
}

const COLUMNS = "id, name, price, stock, description, brand, img, active";

// 
const parseId = (raw: string): number | null => {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

// 400
const handleError = (error: unknown, res: Response, context: string): void => {
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }
  console.error(`${context} failed:`, error);
  res.status(500).json({ message: "internal server error" });
};

export class ProductController {
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { active } = req.query;

      if (active !== undefined && String(active).toLowerCase() !== "true") {
        res.status(400).json({ message: 'query param "active" must be TRUE' });
        return;
      }

      const [rows] = await pool.execute<Product[]>(
        `SELECT ${COLUMNS} FROM products WHERE active = TRUE`,
      );
      res.status(200).json({ data: rows });
    } catch (error) {
      handleError(error, res, "getAll");
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(String(req.params.id));
      if (id === null) {
        res.status(400).json({ message: "invalid id: must be a positive integer" });
        return;
      }

      const [rows] = await pool.execute<Product[]>(
        `SELECT ${COLUMNS} FROM products WHERE id = ? AND active = TRUE`,
        [id],
      );

      const product = rows[0];
      if (!product) {
        res.status(404).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ data: product });
    } catch (error) {
      handleError(error, res, "getById");
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const product = parseProductBody(req.body);

      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)",
        [product.name, product.price, product.stock, product.description, product.brand, product.img],
      );

      res.status(201).json({
        message: "product created",
        data: { id: result.insertId, ...product, active: 1 },
      });
    } catch (error) {
      handleError(error, res, "create");
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(String(req.params.id));
      if (id === null) {
        res.status(400).json({ message: "invalid id: must be a positive integer" });
        return;
      }
      const product = parseProductBody(req.body);

      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE",
        [product.name, product.price, product.stock, product.description, product.brand, product.img, id],
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ message: "product updated", data: { id, ...product, active: 1 } });
    } catch (error) {
      handleError(error, res, "update");
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(String(req.params.id));
      if (id === null) {
        res.status(400).json({ message: "invalid id: must be a positive integer" });
        return;
      }

      // Logical delete: the row stays, it is only marked as inactive
      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE",
        [id],
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ message: "product deleted" });
    } catch (error) {
      handleError(error, res, "delete");
    }
  }

  public async changePrice(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(String(req.params.id));
      if (id === null) {
        res.status(400).json({ message: "invalid id: must be a positive integer" });
        return;
      }
      const price = parsePriceBody(req.body);

      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE products SET price = ? WHERE id = ? AND active = TRUE",
        [price, id],
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ message: "price updated", data: { id, price } });
    } catch (error) {
      handleError(error, res, "changePrice");
    }
  }
}