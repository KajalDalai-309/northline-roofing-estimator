import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { ConfigHistory } from '../models/ConfigHistory.js';
import { initialConfig, initialLeads } from './seedData.js';

dotenv.config();

export async function seedDatabase(force = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/northline_roofing';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  const existingConfig = await Config.findOne();
  if (existingConfig && !force) {
    console.log('[Seed] Database already has configuration (Version', existingConfig.config_version, '). Skipping seed.');
    return;
  }

  if (force) {
    console.log('[Seed] Force flag enabled: Clearing existing Config, Leads, and History...');
    await Config.deleteMany({});
    await Lead.deleteMany({});
    await ConfigHistory.deleteMany({});
  }

  // Insert Config Version 3
  const configDoc = await Config.create(initialConfig);
  console.log('[Seed] Inserted initial configuration: Version', configDoc.config_version);

  // Insert Version History baseline
  await ConfigHistory.create({
    config_version: configDoc.config_version,
    changed_by: 'System Seed',
    change_summary: 'Initial System Migration to Version 3 Config',
    snapshot: initialConfig
  });

  // Insert Historical Leads
  await Lead.insertMany(initialLeads);
  console.log(`[Seed] Successfully inserted ${initialLeads.length} initial historical leads.`);
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('seedRunner.js')) {
  seedDatabase(true)
    .then(() => {
      console.log('[Seed] Database seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
