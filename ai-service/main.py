from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional

from ocr import extract_invoice_data
from excel_exporter import generate_invoice_excel
from forecasting import (
    predict_stock,
    predict_ingredient_shortage,
    analyze_food_waste,
    estimate_prep_time,
    optimize_menu_pricing
)

app = FastAPI(
    title="RestaurantOS Intelligence & OCR Microservice",
    version="2.0.0",
    description="FastAPI service handling Invoice OCR (Image/PDF/Handwritten), Expense Mapping, Excel Exports, Stock Prediction, Ingredient Shortage, Food Waste, Prep Time, and Menu Pricing."
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "RestaurantOS AI FastAPI Microservice",
        "endpoints": [
            "/process-invoice",
            "/process-invoice/excel",
            "/predict-stock",
            "/ingredient-shortage",
            "/food-waste",
            "/preparation-time",
            "/menu-pricing"
        ]
    }

# 1. Invoice OCR Processing (JSON response)
@app.post("/process-invoice")
async def process_invoice(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extracted_data = extract_invoice_data(content, file.filename)
        return {
            "success": True,
            "filename": file.filename,
            "data": extracted_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Invoice OCR to Excel Export Endpoint (.xlsx)
@app.post("/process-invoice/excel")
async def process_invoice_excel(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extracted_data = extract_invoice_data(content, file.filename)
        excel_bytes = generate_invoice_excel(extracted_data)
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=Invoice_{file.filename}.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Stock Prediction Payload & Endpoint
class StockPredictionRequest(BaseModel):
    historicalConsumption: Optional[List[float]] = [12.5, 14.0, 11.0, 15.2, 13.8, 16.0, 14.5]

@app.post("/predict-stock")
def api_predict_stock(req: StockPredictionRequest):
    return {
        "success": True,
        "data": predict_stock(req.historicalConsumption)
    }

# 4. Ingredient Shortage Payload & Endpoint
class ShortageRequest(BaseModel):
    currentStock: float = 25.0
    minimumStock: float = 15.0
    leadTimeDays: int = 3
    dailyUsage: float = 5.0

@app.post("/ingredient-shortage")
def api_ingredient_shortage(req: ShortageRequest):
    return {
        "success": True,
        "data": predict_ingredient_shortage(req.currentStock, req.minimumStock, req.leadTimeDays, req.dailyUsage)
    }

# 5. Food Waste Payload & Endpoint
class WasteLogItem(BaseModel):
    reason: str
    costLost: float

class FoodWasteRequest(BaseModel):
    wasteLogs: Optional[List[WasteLogItem]] = None

@app.post("/food-waste")
def api_food_waste(req: FoodWasteRequest):
    raw_logs = [item.dict() for item in req.wasteLogs] if req.wasteLogs else []
    return {
        "success": True,
        "data": analyze_food_waste(raw_logs)
    }

# 6. Preparation Time Payload & Endpoint
class PrepTimeRequest(BaseModel):
    orderItemCount: int = 4
    complexityScore: float = 1.2
    activeKitchenOrders: int = 6

@app.post("/preparation-time")
def api_prep_time(req: PrepTimeRequest):
    return {
        "success": True,
        "data": estimate_prep_time(req.orderItemCount, req.complexityScore, req.activeKitchenOrders)
    }

# 7. Menu Pricing Payload & Endpoint
class MenuPricingRequest(BaseModel):
    ingredientCost: float = 120.0
    competitorPrice: float = 350.0
    targetMarginPercent: float = 65.0

@app.post("/menu-pricing")
def api_menu_pricing(req: MenuPricingRequest):
    return {
        "success": True,
        "data": optimize_menu_pricing(req.ingredientCost, req.competitorPrice, req.targetMarginPercent)
    }
