---
name: gran-bodega-invoice-from-receipt
description: "Create a La Gran Bodega Mexico invoice from a receipt image using the merchant's online billing portal."
---

# Gran Bodega Invoice From Receipt

Use this skill only when the user wants to invoice a La Gran Bodega receipt. Do not route Walmart, Bodega Aurrera, Sam's Club, or unrelated merchant receipts here.

## Inputs and privacy

- Receipt image or scan, with the merchant and purchase context visible.
- The RFC/account profile used by the portal.
- Access to the user's authorized password manager if the portal requires a password.

Treat the receipt image, RFC, folio, names, fiscal identifiers, and credentials as sensitive. Do not repeat them in the final summary. Never hard-code or invent a credential or folio.

## Workflow

1. Open the receipt in Preview or another available image viewer. Confirm that it is a La Gran Bodega receipt and locate the printed label `Folio para facturar en línea`. Copy only the value associated with that label. Do not substitute a product code, card fragment, authorization, timestamp, total, or another nearby number. Preserve every digit exactly.
2. Open `https://facturacion.grupolagranbodega.com.mx/` in Chrome. If the domain or page purpose differs materially, stop rather than entering credentials into an unfamiliar site.
3. If needed, sign in using the user's authorized saved credentials through the password manager. Do not expose the password in chat or write it into this skill.
4. Verify that the authenticated page is the La Gran Bodega billing portal, then select `Facturar Ticket`.
5. Enter the receipt folio into the control labeled `Folio`, verify it against the receipt, and select `Enviar`.
6. Wait for the ticket table to finish loading. Confirm that the returned ticket/purchase details correspond to the intended receipt, especially the ticket identifier and amount when visible. If they do not match, stop and ask the user to recheck the receipt instead of guessing.
7. Select `Facturar`. Review any confirmation dialog and proceed only when it refers to the intended purchase; select `Aceptar` when appropriate.
8. Verify completion by checking for the invoice report or another explicit success state. A successful report should expose invoice-related fields such as `Factura`, `Fecha Factura`, and `Folio Fiscal`. Do not claim that a PDF or XML was downloaded unless a download was explicitly requested and visibly confirmed.

## Interaction and stopping rules

- Prefer semantic controls by accessible label or title (`RFC`, `Ingresar`, `Facturar Ticket`, `Folio`, `Enviar`, `Facturar`, `Aceptar`) over coordinates or fixed timing.
- Wait for loading states to finish after login, `Enviar`, and `Facturar`; inspect validation or server errors before continuing.
- If the folio is unclear, the merchant cannot be verified, the portal has changed, or the returned ticket does not match, stop and ask for clarification.
- Do not submit an invoice with an unverified folio or unverified billing identity.
