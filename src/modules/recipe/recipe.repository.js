const prisma = require('../../config/prisma');

class RecipeRepository {
  async create(recipeData, ingredientsData = []) {
    return prisma.recipe.create({
      data: {
        ...recipeData,
        recipeIngredients: {
          create: ingredientsData
        }
      },
      include: {
        menuItem: true,
        recipeIngredients: {
          include: { ingredient: true }
        }
      }
    });
  }

  async findById(id) {
    return prisma.recipe.findUnique({
      where: { id },
      include: {
        menuItem: true,
        recipeIngredients: {
          include: { ingredient: true }
        }
      }
    });
  }

  async findByMenuItemId(menuItemId) {
    return prisma.recipe.findUnique({
      where: { menuItemId },
      include: {
        menuItem: true,
        recipeIngredients: {
          include: { ingredient: true }
        }
      }
    });
  }

  async findAll(options = {}) {
    const { skip, take } = options;

    const [items, total] = await Promise.all([
      prisma.recipe.findMany({
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: {
          menuItem: true,
          recipeIngredients: {
            include: { ingredient: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.recipe.count()
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.recipe.update({
      where: { id },
      data,
      include: {
        menuItem: true,
        recipeIngredients: {
          include: { ingredient: true }
        }
      }
    });
  }

  async addIngredient(recipeId, ingredientId, quantity, unit) {
    return prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId,
        quantity,
        unit
      },
      include: { ingredient: true, recipe: true }
    });
  }

  async removeIngredient(id) {
    return prisma.recipeIngredient.delete({ where: { id } });
  }

  async delete(id) {
    return prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      return tx.recipe.delete({ where: { id } });
    });
  }
}

module.exports = new RecipeRepository();
