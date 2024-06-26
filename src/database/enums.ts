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
    REJECTED: "REJECTED",
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
export const Goal = {
    CUTTING: "CUTTING",
    MAINTENANCE: "MAINTENANCE",
    BULKING: "BULKING"
} as const;
export type Goal = (typeof Goal)[keyof typeof Goal];
export const NotificationExternalTable = {
    MEAL_PLAN: "MEAL_PLAN",
    POST: "POST"
} as const;
export type NotificationExternalTable = (typeof NotificationExternalTable)[keyof typeof NotificationExternalTable];
