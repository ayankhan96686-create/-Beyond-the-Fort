/**
 * Database abstraction & connection layer
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Supports MongoDB Atlas geospatial storage with seamless fallback
 * to the authoritative local JSON dataset for zero-friction hackathon evaluation.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const config = require('./env');

const DATASET_PATH = path.join(__dirname, '..', 'data', 'gwalior_curated_pois.json');

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.client = null;
    this.db = null;
    this.collection = null;
    this.memoryStore = [];
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATASET_PATH)) {
        const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
        this.memoryStore = JSON.parse(raw);
        console.log(`[DB Layer] Loaded ${this.memoryStore.length} curated Gwalior POIs from local authoritative dataset.`);
      } else {
        console.warn(`[DB Layer] Dataset not found at ${DATASET_PATH}`);
      }
    } catch (err) {
      console.error('[DB Layer] Error initializing local dataset:', err.message);
    }
  }

  async connect() {
    if (!config.mongoUri) {
      console.log('[DB Layer] No MONGODB_URI configured. Running in high-performance local curated mode.');
      this.isConnected = true;
      return true;
    }

    try {
      this.client = new MongoClient(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10
      });
      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });
      this.db = this.client.db('tourism_gwalior');
      this.collection = this.db.collection('pois');

      const count = await this.collection.countDocuments();
      if (count === 0 && this.memoryStore.length > 0) {
        const recordsToSeed = this.memoryStore.map(item => ({ ...item }));
        await this.collection.insertMany(recordsToSeed);
        console.log(`[DB Layer] Successfully seeded MongoDB Atlas collection 'pois' with ${recordsToSeed.length} curated records.`);
      } else {
        const remoteRecords = await this.collection.find({}, { projection: { _id: 0 } }).toArray();
        if (remoteRecords.length > 0) {
          this.memoryStore = remoteRecords;
          console.log(`[DB Layer] Connected to MongoDB Atlas. Synced ${remoteRecords.length} POIs from cloud cluster.`);
        }
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      console.warn('[DB Layer] MongoDB connection failed or timed out; maintaining local authoritative store:', error.message);
      this.isConnected = true;
      return false;
    }
  }

  getAllPOIs() {
    return this.memoryStore;
  }

  async close() {
    if (this.client) {
      try {
        await this.client.close();
      } catch {}
    }
  }
}

module.exports = new DatabaseService();
