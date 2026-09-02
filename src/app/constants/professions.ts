// ===================================================================
// Visalink Air - Applicant Professions
// আবেদনকারীর পেশা — ভিসার ডকুমেন্ট তালিকা পেশাভেদে বদলায়
//
// A visa's required document list depends on country + visa type +
// the applicant's profession (a job holder needs an NOC and salary
// certificate; a businessperson needs a trade licence instead). Each
// Country.documentRequirements entry carries a `professions` tag —
// an empty tag means "applies to everyone".
// ===================================================================

export const PROFESSIONS = [
    'job-holder',
    'govt-job-holder',
    'businessperson',
    'doctor',
    'advocate',
    'student',
    'child',
    'housewife',
    'retired',
    'unemployed',
    'other',
] as const;

export type TProfession = (typeof PROFESSIONS)[number];

/** Display labels, kept beside the slugs so admin UI and API agree. */
export const PROFESSION_LABELS: Record<TProfession, { en: string; bn: string }> = {
    'job-holder': { en: 'Job Holder', bn: 'চাকরিজীবী' },
    'govt-job-holder': { en: 'Govt. Job Holder', bn: 'সরকারি চাকরিজীবী' },
    businessperson: { en: 'Businessperson', bn: 'ব্যবসায়ী' },
    doctor: { en: 'Doctor', bn: 'ডাক্তার' },
    advocate: { en: 'Advocate / Lawyer', bn: 'আইনজীবী' },
    student: { en: 'Student', bn: 'শিক্ষার্থী' },
    child: { en: 'Child / Non-Student', bn: 'শিশু / অছাত্র' },
    housewife: { en: 'House Wife', bn: 'গৃহিণী' },
    retired: { en: 'Retired Person', bn: 'অবসরপ্রাপ্ত' },
    unemployed: { en: 'Unemployed', bn: 'বেকার' },
    other: { en: 'Other', bn: 'অন্যান্য' },
};
