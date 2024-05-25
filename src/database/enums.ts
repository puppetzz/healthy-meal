export const PostStatus = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED"
} as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
export const MealPlanStatus = {
    DRAFT: "DRAFT",
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
