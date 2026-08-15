import fetch from 'node-fetch';

export interface AIInputData {
  disaster_type: string;
  people_count: number;
  injured_count: number;
  trapped: boolean;
  requested_help: string;
  description?: string;
}

export interface AIPriorityResult {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  reason: string;
}

export const getAIPriorityPrediction = async (data: AIInputData): Promise<AIPriorityResult> => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

  try {
    const response = await fetch(`${aiServiceUrl}/predict-priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = (await response.json()) as AIPriorityResult;
      return result;
    }
    console.warn(`AI service returned status ${response.status}. Using backend fallback prediction.`);
  } catch (err) {
    console.warn('AI microservice unavailable. Executing deterministic fallback priority triage engine.');
  }

  // Fallback Deterministic Priority Calculation
  return calculateFallbackPriority(data);
};

export const calculateFallbackPriority = (data: AIInputData): AIPriorityResult => {
  let score = 20;
  const reasons: string[] = [];

  if (data.trapped) {
    score += 35;
    reasons.push('Victim is trapped');
  }

  if (data.injured_count > 0) {
    score += Math.min(30, data.injured_count * 15);
    reasons.push(`${data.injured_count} person(s) injured requiring urgent medical care`);
  }

  if (data.people_count > 1) {
    score += Math.min(15, (data.people_count - 1) * 3);
  }

  const helpLower = (data.requested_help || '').toLowerCase();
  if (helpLower.includes('rescue')) {
    score += 15;
    reasons.push('Emergency rescue team requested');
  }

  const finalScore = Math.min(99, Math.max(10, score));

  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (finalScore >= 80) priority = 'CRITICAL';
  else if (finalScore >= 60) priority = 'HIGH';
  else if (finalScore >= 35) priority = 'MEDIUM';
  else priority = 'LOW';

  const reason = reasons.length > 0 
    ? `${reasons.join(' and ')} during ${data.disaster_type} emergency.`
    : `Emergency request for ${data.disaster_type} affecting ${data.people_count} person(s).`;

  return { priority, score: finalScore, reason };
};
