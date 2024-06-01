export const PostStatus = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED"
} as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
export const MealPlanStatus = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED"
} as const;
export type MealPlanStatus = (typeof MealPlanStatus)[keyof typeof MealPlanStatus];
export const MealPlanFrequency = {
    DAILY: "DAILY",
    WEEKLY: "WEEKLY",
    MONTHLY: "MONTHLY"
} as const;
export type MealPlanFrequency = (typeof MealPlanFrequency)[keyof typeof MealPlanFrequency];
export const Gender = {
    MALE: "MALE",
    FEMALE: "FEMALE"
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
export const ActivityLevel = {
    SEDENTARY: "SEDENTARY",
    LIGHTLY_EXERCISE: "LIGHTLY_EXERCISE",
    MODERATELY_EXERCISE: "MODERATELY_EXERCISE",
    HEAVY_EXERCISE: "HEAVY_EXERCISE",
    ATHLETE: "ATHLETE"
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];
