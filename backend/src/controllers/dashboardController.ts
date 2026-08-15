import { Request, Response } from 'express';
import { query } from '../config/db.js';

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const totalEmergencies = await query('SELECT COUNT(*) FROM emergency_requests');
    const criticalEmergencies = await query("SELECT COUNT(*) FROM emergency_requests WHERE priority = 'CRITICAL' AND status != 'Resolved'");
    const activeVolunteers = await query("SELECT COUNT(*) FROM volunteer_profiles WHERE availability = true");
    const activeMissions = await query("SELECT COUNT(*) FROM emergency_requests WHERE status IN ('Assigned', 'En Route', 'Arrived')");
    const availableResources = await query("SELECT COALESCE(SUM(quantity), 0) FROM resources WHERE status = 'Available'");
    const resolvedToday = await query("SELECT COUNT(*) FROM emergency_requests WHERE status = 'Resolved'");

    // Emergency Priority Distribution
    const priorityDist = await query(`
      SELECT priority, COUNT(*) as count 
      FROM emergency_requests 
      GROUP BY priority
    `);

    // Emergency Disaster Type Distribution
    const disasterDist = await query(`
      SELECT disaster_type, COUNT(*) as count 
      FROM emergency_requests 
      GROUP BY disaster_type
    `);

    // Status Distribution
    const statusDist = await query(`
      SELECT status, COUNT(*) as count 
      FROM emergency_requests 
      GROUP BY status
    `);

    return res.json({
      statistics: {
        totalEmergencies: parseInt(totalEmergencies.rows[0].count),
        criticalEmergencies: parseInt(criticalEmergencies.rows[0].count),
        activeVolunteers: parseInt(activeVolunteers.rows[0].count),
        activeMissions: parseInt(activeMissions.rows[0].count),
        availableResources: parseInt(availableResources.rows[0].coalesce),
        resolvedToday: parseInt(resolvedToday.rows[0].count),
      },
      charts: {
        priorityDistribution: priorityDist.rows,
        disasterTypes: disasterDist.rows,
        statusBreakdown: statusDist.rows
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
