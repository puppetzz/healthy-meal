import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import config from './drizzle.config';
import * as schema from '../src/schema';
import { faker } from '@faker-js/faker';
import { PostStatus } from 'src/common/enums/post-status.enum';
import { MealPlanStatus } from 'src/common/enums/meal-plan-status.enum';
import { MealPlanFrequencyUnit } from 'src/common/enums/meal-plan-frequency-unit.enum';
import { eq } from 'drizzle-orm';

const seeding = async () => {
  const pool = new Pool(config.dbCredentials);
  const db = drizzle(pool, { schema });

  await db.insert(schema.categories).values([
    {
      name: 'recipe',
    },
    {
      name: 'food',
    },
    {
      name: 'drink',
    },
  ]);

  for (let i = 0; i < 5; i++) {
    const user = await db
      .insert(schema.users)
      .values({
        id: faker.string.uuid(),
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        picture: faker.image.avatar(),
      })
      .returning();

    const recipe = await db
      .insert(schema.recipes)
      .values({
        prepTime: 10,
        cookTime: 30,
        servings: 4,
        calculationUnit: 'cup',
        freezer: '3-4 days',
        keeping: '3-4 days',
      })
      .returning();

    const post = await db
      .insert(schema.posts)
      .values({
        authorId: user[0].id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        status: PostStatus.ACCEPTED,
        recipeId: recipe[0].id,
        thumbnail: faker.image.food(),
      })
      .returning();

    const postCategory = await db.query.categories.findFirst();

    if (postCategory) {
      await db.insert(schema.postCategory).values({
        postId: post[0].id,
        categoryId: postCategory.id as number,
      });
    }

    const recipeCategory = await db.query.foodCategories.findFirst();

    await db
      .insert(schema.recipeFoodCategory)
      .values({
        recipeId: recipe[0].id,
        foodCategoryId: recipeCategory?.id as number,
      })
      .returning()
      .then(async (res) => {
        if (res) {
          console.log(
            'recipeCategory?.numberOfRecipes as number',
            recipeCategory?.numberOfRecipes as number,
          );
          await db
            .update(schema.foodCategories)
            .set({
              numberOfRecipes: (recipeCategory?.numberOfRecipes as number) + 1,
            })
            .where(eq(schema.foodCategories.id, recipeCategory?.id as number))
            .returning();
        }
      });

    await db.insert(schema.ingredients).values({
      recipeId: recipe[0].id,
      name: 'chicken breasts',
      description: '(3 breasts)',
      amount: '1.5',
      unit: 'pound',
    });

    const mealPlan = await db
      .insert(schema.mealPlans)
      .values({
        authorId: user[0].id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        status: MealPlanStatus.DRAFT,
        frequencyUnit: MealPlanFrequencyUnit.DAY,
      })
      .returning();

    await db.insert(schema.mealPlanRecipe).values({
      mealPlanId: mealPlan[0].id,
      postId: post[0].id,
      day: 1,
      meal: 1,
    });

    await db.insert(schema.nutrition).values([
      {
        recipeId: recipe[0].id,
        name: 'calories',
        amount: '200',
        unit: 'cal',
      },
      {
        recipeId: recipe[0].id,
        name: 'protein',
        amount: '20',
        unit: 'g',
      },
      {
        recipeId: recipe[0].id,
        name: 'carbs',
        amount: '30',
        unit: 'g',
      },
      {
        recipeId: recipe[0].id,
        name: 'fat',
        amount: '10',
        unit: 'g',
      },
    ]);

    await db.insert(schema.comments).values({
      postId: post[0].id,
      userId: user[0].id,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
    });
  }
};

seeding().then(() => {
  console.log('Seeding complete');
  process.exit(0);
});
