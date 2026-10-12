import mongoose from 'mongoose';

const LandingPageSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        template: {
            type: String,
            enum: ['workshop'],
            required: true,
            default: 'workshop',
        },
        slug: { type: String, required: true, unique: true, trim: true },
        previousSlugs: [{ type: String }],
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
        },
        content: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

LandingPageSchema.index({ previousSlugs: 1 });

export const landingPageModel =
    mongoose.models.LandingPage || mongoose.model('LandingPage', LandingPageSchema);
