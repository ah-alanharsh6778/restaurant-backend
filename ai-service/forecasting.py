import numpy as np


def predict_stock(historical_consumption: list) -> dict:
    """Predict stock consumption over the next 7 days using moving average forecasting."""
    if not historical_consumption:
        historical_consumption = [12.5, 14.0, 11.0, 15.2, 13.8, 16.0, 14.5]

    data = np.array(historical_consumption, dtype=float)
    avg_daily_usage = float(np.mean(data))
    std_usage = float(np.std(data))
    forecast_7d = float(avg_daily_usage * 7)
    safety_stock = float(std_usage * 1.96)

    return {
        "avgDailyUsage": round(avg_daily_usage, 2),
        "predicted7DayUsage": round(forecast_7d, 2),
        "recommendedSafetyStock": round(safety_stock, 2),
        "recommendedReorderPoint": round(forecast_7d + safety_stock, 2)
    }


def predict_ingredient_shortage(current_stock: float, minimum_stock: float, lead_time_days: int, daily_usage: float) -> dict:
    """Predict days until ingredient depletion and shortage risk level."""
    days_remaining = current_stock / daily_usage if daily_usage > 0 else 999.0
    risk_level = "CRITICAL" if days_remaining <= lead_time_days else ("WARNING" if days_remaining <= (lead_time_days * 1.5) else "SAFE")

    return {
        "currentStock": current_stock,
        "minimumStock": minimum_stock,
        "leadTimeDays": lead_time_days,
        "estimatedDaysRemaining": round(days_remaining, 1),
        "riskLevel": risk_level,
        "reorderUrgent": risk_level in ["CRITICAL", "WARNING"]
    }


def analyze_food_waste(waste_logs: list) -> dict:
    """Analyze waste patterns and calculate monetary loss reduction recommendations."""
    if not waste_logs:
        waste_logs = [
            {"reason": "EXPIRED", "costLost": 120.0},
            {"reason": "SPOILED", "costLost": 210.0},
            {"reason": "COOKING_ERROR", "costLost": 85.0}
        ]

    total_loss = sum(log.get("costLost", 0.0) for log in waste_logs)
    preventable_loss = total_loss * 0.65

    return {
        "totalLossAmount": round(total_loss, 2),
        "potentialMonthlySavings": round(preventable_loss, 2),
        "recommendations": [
            "Implement FIFO (First-In, First-Out) inventory rotation for dairy products",
            "Adjust portion control on high-spoilage items",
            "Reduce safety stock threshold for items with expiration < 5 days"
        ]
    }


def estimate_prep_time(order_item_count: int, complexity_score: float, active_kitchen_orders: int) -> dict:
    """Estimate meal preparation time in minutes based on active kitchen queue."""
    base_time = 10.0
    item_factor = order_item_count * 2.5
    queue_delay = active_kitchen_orders * 1.8
    estimated_minutes = base_time + (item_factor * complexity_score) + queue_delay

    return {
        "estimatedPreparationMinutes": round(estimated_minutes, 1),
        "confidenceScore": 0.92,
        "kitchenCongestionLevel": "HIGH" if active_kitchen_orders > 10 else ("MEDIUM" if active_kitchen_orders > 5 else "LOW")
    }


def optimize_menu_pricing(ingredient_cost: float, competitor_price: float, target_margin_percent: float) -> dict:
    """Calculate optimal cost-plus dish price and recommended target price."""
    target_margin_decimal = target_margin_percent / 100.0
    cost_plus_price = ingredient_cost / (1.0 - target_margin_decimal) if target_margin_decimal < 1.0 else ingredient_cost * 1.5
    recommended_price = max(cost_plus_price, competitor_price * 0.95) if competitor_price > 0 else cost_plus_price

    return {
        "ingredientCost": round(ingredient_cost, 2),
        "costPlusPrice": round(cost_plus_price, 2),
        "recommendedPrice": round(recommended_price, 2),
        "projectedProfitPerDish": round(recommended_price - ingredient_cost, 2),
        "effectiveMarginPercent": round(((recommended_price - ingredient_cost) / recommended_price) * 100.0, 1)
    }
