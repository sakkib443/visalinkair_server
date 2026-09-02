import { Schema, model } from 'mongoose';
import { IHajjUmrah, HajjUmrahModel } from './hajjUmrah.interface';

const hajjUmrahSchema = new Schema<IHajjUmrah, HajjUmrahModel>(
    {
        name: { type: String, required: true, trim: true },
        nameBn: { type: String, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        type: { type: String, required: true, enum: ['hajj', 'umrah'], default: 'umrah' },
        subtitle: { type: String, trim: true },
        subtitleBn: { type: String, trim: true },
        image: { type: String },
        duration: { type: String, required: true },
        durationBn: { type: String },
        price: { type: Number, required: true },
        oldPrice: { type: Number },
        currency: { type: String, default: 'BDT' },
        groupSize: { type: Number, default: 30 },
        bookings: { type: Number, default: 0 },
        departureDate: { type: String },
        departureDates: [{ type: String }],
        hotel: { type: String },
        hotelBn: { type: String },
        distance: { type: String },
        distanceBn: { type: String },
        meals: { type: String },
        mealsBn: { type: String },
        description: { type: String },
        descriptionBn: { type: String },
        longDescription: { type: String },
        longDescriptionBn: { type: String },
        features: [{ type: String }],
        featuresBn: [{ type: String }],
        excludes: [{ type: String }],
        excludesBn: [{ type: String }],
        tags: [{ type: String }],
        isPopular: { type: Boolean, default: false },
        status: { type: String, enum: ['active', 'upcoming', 'completed', 'cancelled'], default: 'upcoming' },
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        metaTitle: { type: String },
        metaDescription: { type: String },
    },
    { timestamps: true }
);

hajjUmrahSchema.index({ slug: 1 });
hajjUmrahSchema.index({ type: 1, status: 1 });
hajjUmrahSchema.index({ isActive: 1, isFeatured: 1 });

hajjUmrahSchema.statics.isPackageExists = async function (id: string): Promise<boolean> {
    return !!(await this.findById(id));
};

hajjUmrahSchema.statics.findBySlug = async function (slug: string): Promise<IHajjUmrah | null> {
    return this.findOne({ slug });
};

export const HajjUmrah = model<IHajjUmrah, HajjUmrahModel>('HajjUmrah', hajjUmrahSchema);
