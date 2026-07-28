const prisma = require('../../config/prisma');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const predictStockConsumption = async () => {
  const ingredients = await prisma.ingredient.findMany({
    include: {
      recipeIngredients: {
        include: {
          recipe: {
            include: {
              menuItem: {
                include: {
                  orderItems: {
                    include: { order: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const predictions = await Promise.all(
    ingredients.map(async (ing) => {
      let totalQuantityUsedLast30Days = 0;

      ing.recipeIngredients.forEach((ri) => {
        if (ri.recipe && ri.recipe.menuItem) {
          ri.recipe.menuItem.orderItems.forEach((oi) => {
            if (oi.order && oi.order.status === 'COMPLETED') {
              totalQuantityUsedLast30Days += ri.quantity * oi.quantity;
            }
          });
        }
      });

      const averageDailyUsage = totalQuantityUsedLast30Days / 30 || 0.5;
      const daysRemaining = averageDailyUsage > 0 ? Math.floor(ing.quantity / averageDailyUsage) : 999;
      const isReorderRecommended = ing.quantity <= ing.minimumStock || daysRemaining <= 3;

      let aiPrediction = null;
      try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/ingredient-shortage`, {
          currentStock: ing.quantity,
          minimumStock: ing.minimumStock,
          leadTimeDays: 3,
          dailyUsage: averageDailyUsage
        }, { timeout: 3000 });
        if (aiRes.data && aiRes.data.data) {
          aiPrediction = aiRes.data.data;
        }
      } catch (e) {
        // AI service fallback
      }

      return {
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        currentStock: ing.quantity,
        minimumStock: ing.minimumStock,
        averageDailyUsage: parseFloat(averageDailyUsage.toFixed(2)),
        estimatedDaysRemaining: daysRemaining,
        reorderRecommended: isReorderRecommended,
        aiInsight: aiPrediction
      };
    })
  );

  return predictions;
};

const optimizeMenuPricing = async () => {
  const menuItems = await prisma.menuItem.findMany({
    include: {
      recipe: {
        include: {
          recipeIngredients: {
            include: { ingredient: true }
          }
        }
      }
    }
  });

  const pricingRecommendations = await Promise.all(
    menuItems.map(async (item) => {
      let estimatedCostPrice = 0;

      if (item.recipe && item.recipe.recipeIngredients) {
        item.recipe.recipeIngredients.forEach((ri) => {
          const unitCost = ri.ingredient.minimumStock > 0 ? (ri.ingredient.minimumStock * 0.5) : 2.0;
          estimatedCostPrice += ri.quantity * unitCost;
        });
      }

      if (estimatedCostPrice === 0) {
        estimatedCostPrice = item.price * 0.35;
      }

      const currentMarginPercent = item.price > 0 ? (((item.price - estimatedCostPrice) / item.price) * 100).toFixed(1) : 0;
      let recommendedPrice = parseFloat((estimatedCostPrice * 2.85).toFixed(2));

      try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/menu-pricing`, {
          ingredientCost: estimatedCostPrice,
          competitorPrice: item.price * 1.1,
          targetMarginPercent: 65.0
        }, { timeout: 3000 });
        if (aiRes.data && aiRes.data.data && aiRes.data.data.suggestedPrice) {
          recommendedPrice = aiRes.data.data.suggestedPrice;
        }
      } catch (e) {
        // AI service fallback
      }

      return {
        menuItemId: item.id,
        name: item.name,
        currentPrice: item.price,
        estimatedCostPrice: parseFloat(estimatedCostPrice.toFixed(2)),
        currentMarginPercent: parseFloat(currentMarginPercent),
        recommendedPrice,
        potentialProfitIncrease: parseFloat(Math.max(0, recommendedPrice - item.price).toFixed(2))
      };
    })
  );

  return pricingRecommendations;
};

const calculateFoodWasteMetrics = async () => {
  const ingredients = await prisma.ingredient.findMany();

  const wasteRiskReports = ingredients.map((ing) => {
    const isOverstocked = ing.quantity > ing.minimumStock * 4;
    const spoilageRisk = isOverstocked ? 'HIGH' : ing.quantity > ing.minimumStock * 2 ? 'MEDIUM' : 'LOW';

    return {
      ingredientId: ing.id,
      name: ing.name,
      currentStock: ing.quantity,
      unit: ing.unit,
      spoilageRisk,
      recommendedAction: isOverstocked
        ? 'Feature in daily specials or reduce purchase order size'
        : 'Stock level optimal'
    };
  });

  try {
    const aiRes = await axios.post(`${AI_SERVICE_URL}/food-waste`, { wasteLogs: [] }, { timeout: 3000 });
    if (aiRes.data && aiRes.data.data) {
      return { reports: wasteRiskReports, aiSummary: aiRes.data.data };
    }
  } catch (e) {
    // Fallback
  }

  return wasteRiskReports;
};

const estimatePreparationTime = async (orderId) => {
  const activeOrdersCount = await prisma.order.count({
    where: { status: { in: ['PENDING', 'PREPARING'] } }
  });

  let targetItemCount = 3;

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });
    if (order && order.orderItems) {
      targetItemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
    }
  }

  let totalEstimatedMinutes = targetItemCount * 5 + activeOrdersCount * 3;

  try {
    const aiRes = await axios.post(`${AI_SERVICE_URL}/preparation-time`, {
      orderItemCount: targetItemCount,
      complexityScore: 1.2,
      activeKitchenOrders: activeOrdersCount
    }, { timeout: 3000 });
    if (aiRes.data && aiRes.data.data && aiRes.data.data.estimatedPrepTimeMinutes) {
      totalEstimatedMinutes = aiRes.data.data.estimatedPrepTimeMinutes;
    }
  } catch (e) {
    // Fallback
  }

  return {
    orderId: orderId || null,
    activeKitchenQueueOrders: activeOrdersCount,
    estimatedPrepTimeMinutes: totalEstimatedMinutes,
    estimatedCompletionTime: new Date(Date.now() + totalEstimatedMinutes * 60000)
  };
};

module.exports = {
  predictStockConsumption,
  optimizeMenuPricing,
  calculateFoodWasteMetrics,
  estimatePreparationTime
};

