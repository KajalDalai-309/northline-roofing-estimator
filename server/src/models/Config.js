import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    rate_per_sqft: { type: Number, default: null },
    multiplier: { type: Number, default: null },
    tear_off_per_sqft: { type: Number, default: null }
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['number', 'select'], required: true },
    unit: { type: String, default: '' },
    required: { type: Boolean, default: true },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    options: [OptionSchema]
  },
  { _id: false }
);

const ConfigSchema = new mongoose.Schema(
  {
    config_version: { type: Number, required: true, default: 3 },
    business: {
      name: { type: String, default: 'Northline Roofing & Exteriors' },
      region: { type: String, default: 'Columbus, OH' },
      currency: { type: String, default: 'USD' }
    },
    questions: [QuestionSchema],
    modifiers: {
      waste_factor: { type: Number, default: 0.10 },
      permit_flat_fee: { type: Number, default: 350 },
      range_spread_pct: { type: Number, default: 12 }
    }
  },
  { timestamps: true }
);

export const Config = mongoose.model('Config', ConfigSchema);
