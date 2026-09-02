// ===================================================================
// Visalink Air - Home Content Interface
// হোম পেজের প্রতিটি সেকশনের content admin dashboard থেকে manage হবে
// ===================================================================

import { Document, Model } from 'mongoose';

// Bilingual text helper
export interface IBilingualText {
    en: string;
    bn: string;
}

// One background picture behind the hero
export interface IHeroSlide {
    image: string;
    order: number;
}

// Hero Section — a background picture slider and nothing else. There is no
// hero text or button any more; the Hero component never rendered them.
export interface IHeroData {
    slides: IHeroSlide[];
    // How long each picture stays before the next fades in.
    slideSeconds: number;
}

// Service Item
export interface IServiceItem {
    title: IBilingualText;
    subtitle: IBilingualText;
    description: IBilingualText;
    icon: string;
    image: string;
    color: string;
    stats: IBilingualText;
    href: string;
    order: number;
    isActive: boolean;
}

// Services Section
export interface IServicesData {
    tagText: IBilingualText;
    heading: IBilingualText;
    headingHighlight: IBilingualText;
    description: IBilingualText;
    items: IServiceItem[];
    bottomCTAText: IBilingualText;
    bottomCTALink: string;
    isActive: boolean;
}

// Partner Item
export interface IPartnerItem {
    name: string;
    icon: string;
    image?: string;
    color: string;
    order: number;
}

// Partners Section
export interface IPartnersData {
    items: IPartnerItem[];
    isActive: boolean;
}

// Consultation Section
export interface IConsultationData {
    tagText: IBilingualText;
    heading: IBilingualText;
    headingHighlight: IBilingualText;
    headingEnd: IBilingualText;
    description: IBilingualText;
    experienceTitle: IBilingualText;
    experienceDesc: IBilingualText;
    experienceImage: string;
    mainImage1: string;
    mainImage2: string;
    ctaText: IBilingualText;
    ctaLink: string;
    agentCount: string;
    agentLabel: IBilingualText;
    isActive: boolean;
}

// Why Choose Us Card
export interface IWhyChooseCard {
    title: IBilingualText;
    description: IBilingualText;
    icon: string;
    color: string;
    order: number;
}

// Stat Item
export interface IStatItem {
    value: string;
    label: IBilingualText;
    color: string;
    order: number;
}

// Why Choose Us Section
export interface IWhyChooseData {
    tagText: IBilingualText;
    heading: IBilingualText;
    headingHighlight: IBilingualText;
    description: IBilingualText;
    cards: IWhyChooseCard[];
    stats: IStatItem[];
    isActive: boolean;
}

// Section types
export type SectionName = 'hero' | 'services' | 'partners' | 'consultation' | 'whyChooseUs';

// Main document
export interface IHomeContent extends Document {
    section: SectionName;
    data: IHeroData | IServicesData | IPartnersData | IConsultationData | IWhyChooseData;
    createdAt: Date;
    updatedAt: Date;
}

export type HomeContentModel = Model<IHomeContent>;
