import { Request, Response } from 'express';
import { query } from '../config/db.js';

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM hospitals ORDER BY name ASC');
    return res.json({ hospitals: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createHospital = async (req: Request, res: Response) => {
  const { name, latitude, longitude, available_beds, emergency_capacity, phone } = req.body;

  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
  }

  try {
    const result = await query(
      `INSERT INTO hospitals (name, latitude, longitude, available_beds, emergency_capacity, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, parseFloat(latitude), parseFloat(longitude), parseInt(available_beds) || 0, parseInt(emergency_capacity) || 0, phone || '']
    );

    return res.status(201).json({ hospital: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
