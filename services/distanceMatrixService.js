/**
 * Transit Calculation & Distance Matrix Service with Circuit-Breaker Failsafe
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * CORE OUTAGE RULE:
 * If live transit API is unreachable or times out, calculate fallback geometric
 * estimate but MANDATORILY attach '[Travel-Time Unverified]' tag. Never lie.
 */

const config = require('../config/env');

class DistanceMatrixService {
  constructor() {
    this.apiKey = config.distanceMatrixApiKey;
    this.timeoutMs = config.transitTimeoutMs; // 3000ms
    this.gwaliorAverageSpeedKmh = 22; // Empirical urban transit speed in central Gwalior
    this.gwaliorRoadCircuityFactor = 1.35; // Ratio of actual road driving distance vs crow-flies Haversine
  }

  /**
   * Calculates crow-flies distance between two geographic coordinates using Haversine formula.
   * @returns {number} distance in kilometers
   */
  haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Computes estimated transit duration based on calibrated local Gwalior city traffic modeling.
   * @returns {number} estimated duration in minutes
   */
  estimateDrivingMinutes(distanceKm) {
    const roadDistanceKm = distanceKm * this.gwaliorRoadCircuityFactor;
    const hours = roadDistanceKm / this.gwaliorAverageSpeedKmh;
    return Math.max(8, Math.ceil(hours * 60)); // minimum 8 mins for local parking & maneuvering
  }

  /**
   * Retrieves transit duration between origin and destination.
   * 
   * @param {Object} origin - { lat, lng }
   * @param {Object} destination - { lat, lng }
   * @param {boolean} forceOutageSimulation - Optional flag to simulate API failure for testing
   * @returns {Promise<Object>} transit calculation with verification status
   */
  async getTransitTime(origin, destination, forceOutageSimulation = false) {
    // 1. Calculate base geometric distance
    const rawDistanceKm = this.haversineDistanceKm(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );
    const estimatedMinutes = this.estimateDrivingMinutes(rawDistanceKm);

    // 2. Check for simulated outage or missing API credentials
    if (forceOutageSimulation || !this.apiKey) {
      const isSimulated = forceOutageSimulation;
      return {
        distance_km: parseFloat(rawDistanceKm.toFixed(2)),
        outbound_minutes: estimatedMinutes,
        return_minutes: estimatedMinutes,
        is_verified: false,
        verification_tag: '[Travel-Time Unverified]',
        warning: isSimulated
          ? 'Transit API unavailable. Estimated time used and is unverified. Verify local road conditions before departure.'
          : 'Transit time calculated via geometric modeling because no live provider is configured.'
      };
    }

    // 3. Attempt live Distance Matrix API with circuit-breaker timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const params = new URLSearchParams({
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        key: this.apiKey
      });
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`provider_http_${response.status}`);
      const payload = await response.json();
      const element = payload?.rows?.[0]?.elements?.[0];
      if (payload?.status !== 'OK' || element?.status !== 'OK' ||
          !Number.isFinite(element?.distance?.value) || !Number.isFinite(element?.duration?.value)) {
        throw new Error('provider_response_unavailable');
      }
      clearTimeout(timeoutId);
      const returnParams = new URLSearchParams({
        origins: `${destination.lat},${destination.lng}`,
        destinations: `${origin.lat},${origin.lng}`,
        mode: 'driving',
        key: this.apiKey
      });
      const returnResponse = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${returnParams}`, {
        signal: AbortSignal.timeout(this.timeoutMs)
      });
      if (!returnResponse.ok) throw new Error(`provider_http_${returnResponse.status}`);
      const returnPayload = await returnResponse.json();
      const returnElement = returnPayload?.rows?.[0]?.elements?.[0];
      if (returnPayload?.status !== 'OK' || returnElement?.status !== 'OK' || !Number.isFinite(returnElement?.duration?.value)) {
        throw new Error('provider_return_response_unavailable');
      }
      return {
        distance_km: parseFloat((element.distance.value / 1000).toFixed(2)),
        outbound_minutes: Math.ceil(element.duration.value / 60),
        return_minutes: Math.ceil(returnElement.duration.value / 60),
        is_verified: true,
        verification_tag: '[Live Transit Matrix]',
        warning: null
      };
    } catch (err) {
      console.warn('[Transit Service] Live provider failed or timed out; using an unverified estimate.');
      return {
        distance_km: parseFloat(rawDistanceKm.toFixed(2)),
        outbound_minutes: estimatedMinutes,
        return_minutes: estimatedMinutes,
        is_verified: false,
        verification_tag: '[Travel-Time Unverified]',
        warning: 'Transit API unavailable. Estimated time used and is unverified. Verify local road conditions before departure.'
      };
    }
  }
}

module.exports = new DistanceMatrixService();
