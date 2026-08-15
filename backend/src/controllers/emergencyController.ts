import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { getAIPriorityPrediction } from '../services/aiService.js';
import { broadcastEvent } from '../socket/socketHandler.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createEmergency = async (req: AuthRequest, res: Response) => {
  const { disaster_type, description, latitude, longitude, people_count, injured_count, trapped, requested_help } = req.body;

  if (!disaster_type || latitude === undefined || longitude === undefined || !requested_help) {
    return res.status(400).json({ error: 'Disaster type, location coordinates, and requested help are required' });
  }

  const userId = req.user ? req.user.userId : null;

  try {
    // 1. Predict Priority using AI Service
    const aiPrediction = await getAIPriorityPrediction({
      disaster_type,
      people_count: Number(people_count) || 1,
      injured_count: Number(injured_count) || 0,
      trapped: Boolean(trapped),
      requested_help,
      description: description || ''
    });

    // 2. Insert into PostgreSQL
    const result = await query(
      `INSERT INTO emergency_requests 
       (user_id, disaster_type, description, latitude, longitude, people_count, injured_count, trapped, requested_help, priority, priority_score, priority_reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Submitted')
       RETURNING *`,
      [
        userId,
        disaster_type,
        description || '',
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(people_count) || 1,
        parseInt(injured_count) || 0,
        Boolean(trapped),
        requested_help,
        aiPrediction.priority,
        aiPrediction.score,
        aiPrediction.reason
      ]
    );

    const newEmergency = result.rows[0];

    // Log history
    await query(
      `INSERT INTO emergency_status_history (emergency_id, status, updated_by, notes)
       VALUES ($1, 'Submitted', $2, 'Emergency request submitted and AI priority evaluated.')`,
      [newEmergency.id, userId]
    );

    // 3. Socket.IO Real-time Broadcast
    broadcastEvent('emergency:created', newEmergency);
    broadcastEvent('notification:new', {
      title: '🚨 NEW EMERGENCY SOS',
      message: `${aiPrediction.priority} priority ${disaster_type} emergency reported at (${latitude}, ${longitude}).`,
      emergencyId: newEmergency.id
    });

    return res.status(201).json({
      message: 'Emergency request submitted successfully',
      emergency: newEmergency,
      ai_prediction: aiPrediction
    });
  } catch (err: any) {
    console.error('Error creating emergency:', err);
    return res.status(500).json({ error: err.message || 'Failed to create emergency request' });
  }
};

export const getEmergencies = async (req: Request, res: Response) => {
  const { priority, status, disaster_type, userId } = req.query;

  try {
    let sql = `
      SELECT e.*, 
             u.name as victim_name, u.phone as victim_phone,
             va.id as assignment_id, va.status as assignment_status, va.volunteer_id,
             vol.name as volunteer_name, vol.phone as volunteer_phone
      FROM emergency_requests e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN volunteer_assignments va ON va.emergency_id = e.id AND va.status != 'cancelled'
      LEFT JOIN users vol ON va.volunteer_id = vol.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (priority) {
      params.push(priority);
      sql += ` AND e.priority = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND e.status = $${params.length}`;
    }

    if (disaster_type) {
      params.push(disaster_type);
      sql += ` AND e.disaster_type = $${params.length}`;
    }

    if (userId) {
      params.push(userId);
      sql += ` AND e.user_id = $${params.length}`;
    }

    sql += ` ORDER BY CASE e.priority 
                WHEN 'CRITICAL' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'MEDIUM' THEN 3 
                ELSE 4 END, e.created_at DESC`;

    const result = await query(sql, params);
    return res.json({ emergencies: result.rows });
  } catch (err: any) {
    console.error('Error fetching emergencies:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const getEmergencyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT e.*, 
              u.name as victim_name, u.phone as victim_phone, u.email as victim_email,
              va.id as assignment_id, va.status as assignment_status, va.volunteer_id,
              vol.name as volunteer_name, vol.phone as volunteer_phone,
              vp.latitude as volunteer_lat, vp.longitude as volunteer_lng
       FROM emergency_requests e
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN volunteer_assignments va ON va.emergency_id = e.id AND va.status != 'cancelled'
       LEFT JOIN users vol ON va.volunteer_id = vol.id
       LEFT JOIN volunteer_profiles vp ON vol.id = vp.user_id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    const historyResult = await query(
      `SELECT h.*, u.name as updated_by_name 
       FROM emergency_status_history h
       LEFT JOIN users u ON h.updated_by = u.id
       WHERE h.emergency_id = $1
       ORDER BY h.created_at ASC`,
      [id]
    );

    return res.json({
      emergency: result.rows[0],
      history: historyResult.rows
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateEmergencyStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['Submitted', 'Assigned', 'En Route', 'Arrived', 'Resolved', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  try {
    const updatedBy = req.user ? req.user.userId : null;

    const result = await query(
      `UPDATE emergency_requests 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    const updatedEmergency = result.rows[0];

    // Log History
    await query(
      `INSERT INTO emergency_status_history (emergency_id, status, updated_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, status, updatedBy, notes || `Status updated to ${status}`]
    );

    // Socket.IO updates
    broadcastEvent('emergency:updated', updatedEmergency);

    if (status === 'Resolved') {
      broadcastEvent('emergency:resolved', { emergencyId: id, status });
    }

    return res.json({
      message: `Emergency status updated to ${status}`,
      emergency: updatedEmergency
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
