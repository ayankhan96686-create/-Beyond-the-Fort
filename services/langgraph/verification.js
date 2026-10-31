/**
 * Agent 4: Verification & Provenance Guard
 * Recreated natively in JavaScript from Python agents/verification.py
 */

function verificationNode(state) {
  const evidence = [];
  const candidates = state.candidates || [];

  for (const poi of candidates) {
    const src = poi.source_url || poi.source_reference;
    const recorded = poi.verification_status;
    const statusText = String(recorded || '').toUpperCase();
    const cls = statusText.includes('UNVERIFIED')
      ? 'UNVERIFIED'
      : (recorded || src ? 'STAKEHOLDER_PROVIDED' : 'AI_INFERENCE');

    const claims = [
      ['attraction_record', poi.name],
      ['visit_duration_minutes', poi.min_dwell_time_mins],
      ['opening_hours', poi.operating_hours]
    ];

    for (const [claim, value] of claims) {
      if (value === null || value === undefined) continue;
      const claimClass = (claim === 'visit_duration_minutes' && poi.duration_estimate_type === 'heuristic_default')
        ? 'AI_INFERENCE'
        : cls;
      evidence.push({
        claim: `${claim}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
        claim_type: claim,
        classification: claimClass,
        source: src,
        record_id: poi.id,
        verified: claimClass === 'VERIFIED'
      });
    }
  }

  for (const [leg, route] of Object.entries(state.routes || {})) {
    evidence.push({
      claim: `Route ${leg}: ${route.distance_km} km, ${route.duration_minutes} min`,
      claim_type: 'travel_estimate',
      classification: route.source_class || 'AI_INFERENCE',
      source: route.provider,
      retrieved_at: route.retrieved_at,
      verified: route.source_class === 'VERIFIED'
    });
  }

  const trace = [...(state.agent_trace || [])];
  trace.push(`[Verification] Classified ${evidence.length} claims; missing source metadata remains unverified`);

  return {
    evidence,
    agent_trace: trace
  };
}

module.exports = {
  verificationNode
};

