/**
 * Intent Controller - Standalone NLP Intent Extraction Endpoint
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 */

const geminiService = require('../services/geminiService');
const schemaValidator = require('../utils/schemaValidator');

class IntentController {
  async parseIntentApi(req, res) {
    try {
      const query = req.body.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_QUERY',
          message: 'Field "query" is required as a string.'
        });
      }

      if (query.length > 1000) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_QUERY_LENGTH',
          message: 'Field "query" must be 1000 characters or fewer.'
        });
      }

      let defaultMinutes = 180;
      if (req.body.fallback_minutes !== undefined) {
        const parsed = Number(req.body.fallback_minutes);
        if (Number.isNaN(parsed) || parsed < 30 || parsed > 600) {
          return res.status(400).json({
            status: 'error',
            code: 'INVALID_FALLBACK_MINUTES',
            message: 'Field "fallback_minutes" must be a number between 30 and 600.'
          });
        }
        defaultMinutes = parsed;
      }
      const parsedIntent = await geminiService.extractIntent(query, defaultMinutes);

      res.status(200).json({
        status: 'success',
        input: query,
        parsed_intent: parsedIntent
      });
    } catch (err) {
      console.error(JSON.stringify({ event: 'intent.parse_failed', error_type: err?.name || 'Error' }));
      res.status(500).json({
        status: 'error',
        message: 'Intent parsing failed.'
      });
    }
  }
}

module.exports = new IntentController();
