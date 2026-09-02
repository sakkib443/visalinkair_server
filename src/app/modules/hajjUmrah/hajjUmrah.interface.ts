import { Model, Types } from 'mongoose';

export interface IHajjUmrah {
    _id?: Types.ObjectId;
    name: string;
    nameBn?: string;
    slug: string;
    type: 'hajj' | 'umrah';
    subtitle?: string;
    subtitleBn?: string;
    image?: string;
    duration: string;
    durationBn?: string;
    price: number;
    oldPrice?: number;
    currency?: string;
    groupSize?: number;
    bookings?: number;
    departureDate?: string;
    departureDates?: string[];
    hotel?: string;
    hotelBn?: string;
    distance?: string;
    distanceBn?: string;
    meals?: string;
    mealsBn?: string;
    description?: string;
    descriptionBn?: string;
    longDescription?: string;
    longDescriptionBn?: string;
    features: string[];
    featuresBn?: string[];
    excludes?: string[];
    excludesBn?: string[];
    tags?: string[];
    isPopular: boolean;
    status: 'active' | 'upcoming' | 'completed' | 'cancelled';
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    metaTitle?: string;
    metaDescription?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHajjUmrahFilters {
    searchTerm?: string;
    type?: string;
    status?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
}

export interface HajjUmrahModel extends Model<IHajjUmrah> {
    isPackageExists(id: string): Promise<boolean>;
    findBySlug(slug: string): Promise<IHajjUmrah | null>;
}
