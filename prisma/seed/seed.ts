import { MealPlanStatus, PostStatus, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ERoleID } from '../../src/common/enums/role.enum';

const prisma = new PrismaClient();

async function main() {
  // await prisma.category.createMany({
  //   data: [
  //     { name: 'recipe', key: 'recipe' },
  //     { name: 'food', key: 'food' },
  //     { name: 'drink', key: 'drink' },
  //   ],
  // });

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        picture: faker.image.avatar(),
        roleId: ERoleID.USER,
      },
    });

    const foodCategory = await prisma.foodCategory.findFirst();

    const recipe = await prisma.recipe
      .create({
        data: {
          prepTime: 10,
          cookTime: 20,
          servings: 4,
          servingSize: 374,
          calculationUnit: 'cup',
          freezer: '3-4 days',
          keeping: '3-4 days',
          recipeFoodCategory: {
            create: {
              foodCategoryId: foodCategory.id,
            },
          },
        },
      })
      .then(async (recipe) => {
        if (recipe) {
          await prisma.foodCategory.update({
            where: {
              id: foodCategory.id,
            },
            data: {
              numberOfRecipes: {
                increment: 1,
              },
            },
          });
        }

        return recipe;
      });

    const postCategory = await prisma.category.findFirst();

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        status: PostStatus.ACCEPTED,
        thumbnail: faker.image.food(),
        recipeId: recipe.id,
        postCategory: {
          create: {
            categoryId: postCategory.id,
          },
        },
      },
    });

    await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: user.id,
        content: faker.lorem.paragraph(),
      },
    });

    await prisma.ingredient.create({
      data: {
        recipeId: recipe.id,
        name: 'chicken breasts',
        description: '(3 breasts)',
        amount: 1.5,
        unit: 'pound',
      },
    });

    await prisma.nutrition.create({
      data: {
        recipeId: recipe.id,
        calories: 300,
        protein: 30,
        fat: 10,
        carbohydrates: 20,
        saturatedFat: 5,
        cholesterol: 100,
        polyunsaturatedFat: 2,
        monounsaturatedFat: 3,
        transFat: 0,
        sodium: 200,
        potassium: 400,
        fiber: 5,
        sugar: 10,
        vitaminA: 10,
        calcium: 100,
        iron: 2,
        vitaminC: 1,
      },
    });

    const mealPlan = await prisma.mealPlan.create({
      data: {
        authorId: user.id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        status: MealPlanStatus.PUBLISHED,
        mealPerDay: 3,
      },
    });

    for (let j = 0; j < 3; j++) {
      await prisma.mealPlanRecipe.create({
        data: {
          mealPlanId: mealPlan.id,
          recipeId: recipe.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
