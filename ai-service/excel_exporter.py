import io
import pandas as pd


def generate_invoice_excel(invoice_data: dict) -> bytes:
    """Generate Excel binary buffer containing Summary and Line Items sheets."""
    output = io.BytesIO()

    # Sheet 1: Invoice Summary
    summary_df = pd.DataFrame([{
        "Invoice Number": invoice_data.get("invoiceNumber", "N/A"),
        "Supplier Name": invoice_data.get("supplierName", "N/A"),
        "GSTIN": invoice_data.get("gstNumber", "N/A"),
        "Invoice Date": invoice_data.get("invoiceDate", "N/A"),
        "Expense Category": invoice_data.get("expenseCategory", "N/A"),
        "Subtotal": invoice_data.get("subtotal", 0.0),
        "Tax Amount": invoice_data.get("tax", 0.0),
        "Total Amount": invoice_data.get("total", 0.0)
    }])

    # Sheet 2: Line Items
    items = invoice_data.get("lineItems", [])
    if not items:
        items = [{"description": "Standard Purchase Item", "quantity": 1.0, "price": invoice_data.get("subtotal", 0.0)}]
    items_df = pd.DataFrame(items)

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        summary_df.to_excel(writer, sheet_name="Invoice Summary", index=False)
        items_df.to_excel(writer, sheet_name="Parsed Line Items", index=False)

    return output.getvalue()
