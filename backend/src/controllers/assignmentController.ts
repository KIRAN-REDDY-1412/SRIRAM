import { Response } from 'express';
import { query } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { broadcastEvent } from '../socket/socketHandler.js';

export const createAssignment = async (req: AuthRequest, res: Response) => {
  const { emergency_id, volunteer_id } = req.body;

  const targetVolunteerId = volunteer_id || (req.user ? req.user.userId : null);

  if (!emergency_id || !targetVolunteerId) {
    return res.status(400).json({ error: 'Emergency ID and Volunteer ID are required' });
  }

  try {
    // Check if emergency exists
    const emergencyRes = await query('SELECT * FROM emergency_requests WHERE id = $1', [emergency_id]);
    if (emergencyRes.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Insert or update assignment
    const result = await query(
      `INSERT INTO volunteer_assignments (emergency_id, volunteer_id, status, assigned_at, accepted_at)
       VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [emergency_id, targetVolunteerId]
    );

    const assignment = result.rows[0];

    // Update emergency request status to Assigned
    await query(
      `UPDATE emergency_requests SET status = 'Assigned', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [emergency_id]
    );

    await query(
      `INSERT INTO emergency_status_history (emergency_id, status, updated_by, notes)
       VALUES ($1, 'Assigned', $2, 'Volunteer assigned to emergency request.')`,
      [emergency_id, req.user ? req.user.userId : null]
    );

    const updatedEmergency = (await query('SELECT * FROM emergency_requests WHERE id = $1', [emergency_id])).rows[0];

    broadcastEvent('volunteer:assigned', {
      assignment,
      emergency: updatedEmergency,
      volunteerId: targetVolunteerId
    });

    broadcastEvent('emergency:updated', updatedEmergency);

    return res.status(201).json({
      message: 'Volunteer assigned successfully',
      assignment,
      emergency: updatedEmergency
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAssignmentStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['assigned', 'accepted', 'en_route', 'arrived', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid assignment status: ${status}` });
  }

  try {
    let timeField = '';
    if (status === 'accepted') timeField = ', accepted_at = CURRENT_TIMESTAMP';
    if (status === 'completed') timeField = ', completed_at = CURRENT_TIMESTAMP';

    const result = await query(
      `UPDATE volunteer_assignments 
       SET status = $1 ${timeField}
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = result.rows[0];

    // Map assignment status to emergency status
    let emergencyStatus = 'Assigned';
    if (status === 'en_route') emergencyStatus = 'En Route';
    if (status === 'arrived') emergencyStatus = 'Arrived';
    if (status === 'completed') emergencyStatus = 'Resolved';

    await query(
      `UPDATE emergency_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [emergencyStatus, assignment.emergency_id]
    );

    await query(
      `INSERT INTO emergency_status_history (emergency_id, status, updated_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [assignment.emergency_id, emergencyStatus, req.user ? req.user.userId : null, `Volunteer status updated to ${status}`]
    );

    const updatedEmergency = (await query('SELECT * FROM emergency_requests WHERE id = $1', [assignment.emergency_id])).rows[0];

    broadcastEvent('emergency:updated', updatedEmergency);

    if (emergencyStatus === 'Resolved') {
      broadcastEvent('emergency:resolved', { emergencyId: assignment.emergency_id, status: 'Resolved' });
    }

    return res.json({
      message: `Assignment status updated to ${status}`,
      assignment,
      emergency: updatedEmergency
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
