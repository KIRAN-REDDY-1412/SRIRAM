import { Response } from 'express';
import { query } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { broadcastEvent } from '../socket/socketHandler.js';

export const getVolunteers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.role,
              vp.skills, vp.availability, vp.latitude, vp.longitude, vp.updated_at
       FROM users u
       JOIN volunteer_profiles vp ON u.id = vp.user_id
       WHERE u.role = 'volunteer'`
    );

    return res.json({ volunteers: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
  const { availability } = req.body;
  if (!req.user || req.user.role !== 'volunteer') {
    return res.status(403).json({ error: 'Only volunteers can update availability' });
  }

  try {
    const result = await query(
      `UPDATE volunteer_profiles
       SET availability = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [Boolean(availability), req.user.userId]
    );

    broadcastEvent('volunteer:available', {
      volunteerId: req.user.userId,
      availability: Boolean(availability)
    });

    return res.json({
      message: 'Availability updated',
      profile: result.rows[0]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response) => {
  const { latitude, longitude } = req.body;
  if (!req.user || req.user.role !== 'volunteer') {
    return res.status(403).json({ error: 'Only volunteers can update location' });
  }

  try {
    const result = await query(
      `UPDATE volunteer_profiles
       SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING *`,
      [parseFloat(latitude), parseFloat(longitude), req.user.userId]
    );

    broadcastEvent('volunteer:location', {
      volunteerId: req.user.userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });

    return res.json({
      message: 'Location updated',
      profile: result.rows[0]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
