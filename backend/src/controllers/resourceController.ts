import { Request, Response } from 'express';
import { query } from '../config/db.js';

export const getResources = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM resources ORDER BY type, name ASC');
    return res.json({ resources: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createResource = async (req: Request, res: Response) => {
  const { name, type, quantity, location, status } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    const result = await query(
      `INSERT INTO resources (name, type, quantity, location, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, parseInt(quantity) || 0, location || '', status || 'Available']
    );

    return res.status(201).json({ resource: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, status } = req.body;

  try {
    const result = await query(
      `UPDATE resources
       SET quantity = COALESCE($1, quantity),
           status = COALESCE($2, status)
       WHERE id = $3
       RETURNING *`,
      [quantity !== undefined ? parseInt(quantity) : null, status || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json({ resource: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
