import mongoose from 'mongoose';

const ConfigHistorySchema = new mongoose.Schema(
  {
    config_version: { type: Number, required: true },
    changed_by: { type: String, default: 'Admin' },
    change_summary: { type: String, default: 'Configuration updated' },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    applied_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const ConfigHistory = mongoose.model('ConfigHistory', ConfigHistorySchema);
