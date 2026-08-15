import { Request, Response } from 'express';
import { query } from '../config/db.js';

export const getShelters = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM shelters ORDER BY name ASC');
    return res.json({ shelters: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createShelter = async (req: Request, res: Response) => {
  const { name, latitude, longitude, capacity, occupied, resources } = req.body;

  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
  }

  try {
    const result = await query(
      `INSERT INTO shelters (name, latitude, longitude, capacity, occupied, resources)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, parseFloat(latitude), parseFloat(longitude), parseInt(capacity) || 0, parseInt(occupied) || 0, resources || '']
    );

    return res.status(201).json({ shelter: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
