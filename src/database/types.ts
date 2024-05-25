import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { PostStatus, MealPlanStatus, MealPlanFrequency } from "./enums";

export type Category = {
    id: Generated<number>;
    name: string;
};
export type Comment = {
    id: Generated<number>;
    post_id: number;
    parent_id: number | null;
    author_id: string;
    title: string;
    content: string;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
};
export type FoodCategory = {
    id: Generated<number>;
    name: string;
    icon: string;
    key: string;
    number_of_recipes: Generated<number>;
};
export type Ingredient = {
    id: Generated<number>;
    recipe_id: number;
    name: string;
    description: string | null;
    amount: number;
    unit: string;
    preparation: string | null;
};
export type MealPlan = {
    id: Generated<number>;
    author_id: string;
    title: string;
    content: string;
    status: Generated<MealPlanStatus>;
    frequency: Generated<MealPlanFrequency>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
};
export type MealPlanRecipe = {
    meal_plan_id: number;
    recipe_id: number;
    day: Generated<number>;
    meal: Generated<number>;
};
export type Nutrition = {
    id: Generated<number>;
    recipe_id: number;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    saturated_fat: number | null;
    polyunsaturated_fat: number | null;
    monounsaturated_fat: number | null;
    trans_fat: number | null;
    fiber: number | null;
    sugar: number | null;
    sodium: number | null;
    potassium: number | null;
    cholesterol: number | null;
    vitamin_a: number | null;
    vitamin_c: number | null;
    calcium: number | null;
    iron: number | null;
};
export type Post = {
    id: Generated<number>;
    author_id: string;
    parent_id: number | null;
    recipe_id: number | null;
    thumbnail: string | null;
    title: string;
    content: string | null;
    rating: number | null;
    status: Generated<PostStatus>;
    published: Generated<boolean>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    published_at: Timestamp | null;
};
export type PostCategory = {
    post_id: number;
    category_id: number;
};
export type Recipe = {
    id: Generated<number>;
    prep_time: number;
    cook_time: number;
    servings: number;
    calculation_unit: string;
    keeping: string;
    freezer: string;
};
export type RecipeFoodCategory = {
    recipe_id: number;
    food_category_id: number;
};
export type User = {
    id: string;
    full_name: string;
    email: string;
    picture: string | null;
    created_at: Generated<Timestamp>;
};
export type DB = {
    categories: Category;
    comments: Comment;
    food_categories: FoodCategory;
    ingredients: Ingredient;
    meal_plan_recipes: MealPlanRecipe;
    meal_plans: MealPlan;
    nutritions: Nutrition;
    post_categories: PostCategory;
    posts: Post;
    recipe_food_categories: RecipeFoodCategory;
    recipes: Recipe;
    users: User;
};