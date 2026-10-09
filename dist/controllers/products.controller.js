import { pool } from "../conf/dbConnection.js";
const COLUMNS = "id, name, price, stock, description, brand, img, active";
// Returns a positive integer, or null if the value is not valid
const parseId = (raw) => {
    if (!/^\d+$/.test(raw))
        return null;
    const id = Number(raw);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};
export class ProductController {
    async getAll(req, res) {
        try {
            const { active } = req.query;
            if (active !== undefined && String(active).toLowerCase() !== "true") {
                res.status(400).json({ message: 'query param "active" must be TRUE' });
                return;
            }
            const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM products WHERE active = TRUE`);
            res.status(200).json({ data: rows });
        }
        catch (error) {
            console.error("getAll failed:", error);
            res.status(500).json({ message: "internal server error" });
        }
    }
    async getById(req, res) {
        try {
            const id = parseId(String(req.params.id));
            if (id === null) {
                res.status(400).json({ message: "invalid id: must be a positive integer" });
                return;
            }
            const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM products WHERE id = ? AND active = TRUE`, [id]);
            if (rows.length === 0) {
                res.status(404).json({ message: "product not found" });
                return;
            }
            res.status(200).json({ data: rows[0] });
        }
        catch (error) {
            console.error("getById failed:", error);
            res.status(500).json({ message: "internal server error" });
        }
    }
}
