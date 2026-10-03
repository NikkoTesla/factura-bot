---
name: walmart-invoice-from-receipt
description: "Create a Walmart Mexico, Bodega Aurrera, Sam's Club, or related store invoice from a receipt scan using the online invoicing portal."
---

# Walmart Invoice From Receipt

Use this skill when the user wants to recover or create an invoice from a physical-store receipt and provides (or can provide) a receipt image plus the billing data required by the portal.

## Inputs

Collect only what is missing. Treat receipt images, RFCs, addresses, email addresses, ticket identifiers, and payment details as sensitive; do not repeat them in the final summary.

- Receipt image or scan. If several scans are present, identify the intended receipt by merchant, date, or total rather than guessing.
- RFC or membership identifier and billing postal code.
- Legal/business name and email when the portal asks for them. Street address (calle, número exterior/interior, colonia) is optional — the portal accepts RFC + postal code alone, so only fill address fields the user actually provides.
- Fiscal regime and invoice use. The recorded workflow used “Personas Fisicas con Actividades Empresariales y Profesionales” and “Gastos en general” as examples, but these are runtime choices and must not be silently generalized.
- Payment method and delivery method. The recorded workflow used “Tarjeta de crédito”; the delivery page offers PDF or email delivery.
- Fiscal profile alias (for example, `YOUR_ALIAS`). When the user names a fiscal profile instead of dictating each fiscal field, resolve it through the fiscal-data lookup below rather than asking for the fields one by one.

If a required fiscal value is missing or ambiguous, ask before submitting. Do not infer regulatory or financial values from the receipt.

## Fiscal data lookup

FacturaBot resolves profiles through the Fiscal API configured by each user. The endpoint is supplied as `FISCAL_API_ENDPOINT` in private runtime configuration; this skill must not contain a user's deployment URL.

- Request: HTTP POST with JSON body `{"action": "getFiscalProfile", "alias": "YOUR_ALIAS", "apiKey": "YOUR_API_KEY"}`. At runtime, use the exact alias selected by the user and inject the key from the platform's secure credential store.
- Response: `{"ok": true, "data": {...}}` with `alias`, `tipo_persona`, `rfc`, `nombre_razon_social`, `regimen_fiscal`, `codigo_postal`, `uso_cfdi_default`, and `email`. Use `data` as the official source for fiscal fields. When `ok` is false, do not invent data; stop and report the error.
- Redirect handling: Apps Script may answer the POST with a temporary `Location` redirect. Collect the JSON with a plain GET to that location because the script already ran during the POST. Do not resend the POST body to the redirect.
- Authentication: configure the API key in the platform's secure credential store. The helper reads `FISCAL_API_ENDPOINT` and obtains the key from the configured credential; never ask the user to paste a key into chat, print it, or save it in a file.
- Session reuse: before invoking `bin/fiscal_lookup --alias YOUR_ALIAS`, look for a complete profile for the same user and exact alias in the current session memory. Call the helper only when that profile is absent, incomplete, or the user asks to refresh it. Keep successful `data` in session memory and reuse it for later invoices in that session. Do not cache fiscal data in a file or persistent memory, and never substitute another alias's profile.
- Street address: the API response does not include it. Fill address fields only if this supplier's portal requires them and the user provides the values; never invent them.

## Workflow

Use Computer Use/UI interaction for the browser and receipt viewer because the workflow depends on the visible portal and OCR text in the scan. Prefer semantic controls (field placeholders, button titles, menu-item titles, and page URLs) over coordinates.

1. Open the receipt scan in Preview or another available image viewer. Read the OCR text and verify the merchant/store, date, and total against the user's intended purchase. Extract the portal identifiers carefully:
   - `TC#` or the portal's “Número de Ticket” value is the ticket identifier.
   - `TR#` or the portal's “# Transacción” value is the transaction number; preserve leading zeroes.
   - Do not confuse the card/account fragment, authorization, affiliation, or timestamp with either identifier.
2. Open `https://facturacion-clientes.walmart.com/ticket` in the browser. If the portal has changed or is unavailable, stop and report that instead of entering data into an unfamiliar site.
3. On the ticket form, fill “MEMBRESÍA O RFC”, “Código Postal”, “Número de Ticket”, and “# Transacción”. Clear stale values first, paste exact values, and verify each field before selecting “Continuar”. If the portal requires choosing a store format, select the store shown on the receipt (for example, Walmart or Bodega Aurrera).
4. On the taxpayer/address form, preserve valid prefilled values only after comparing them with the user's inputs. Fill or correct the legal name and email. Street, exterior/interior number, and neighborhood are optional: fill them only when the user provided them, and leave them blank otherwise. Let the portal derive state/municipality from the postal code when it supports that, then verify the result.
5. Select the user's fiscal regime and “Uso Factura”. Before pressing “Aceptar” or any final confirmation control, review the visible summary for the RFC, name, postal code, email, and fiscal selections. If a confirmation dialog appears, proceed only after the user-provided values are visibly correct; follow the dialog's affirmative action (usually “Continuar”).
6. On the payment page, choose the requested payment method, then select “Continuar”. Do not invent a payment method. Wait for the next page to finish loading and verify that it is the invoice-delivery selection page. Note: the portal sometimes skips the payment page entirely and goes straight from the taxpayer form to delivery selection — if there is no payment page, continue without selecting anything.
7. On the delivery page, choose the user's requested output:
   - PDF: select “PDF” and verify that the invoice is displayed or downloaded.
   - Email: select “Enviar a correo electrónico”, verify the destination address, and submit only when it matches the requested address.
   If the user has not specified a delivery method, stop at this page and ask which option they want.

## Verification and stopping rules

- Confirm page transitions by URL or accessible page text (`/ticket`, `/address`, `/payment`, and `/invoiceSelection`) rather than timing alone.
- After every portal submission, wait for a visible loading state to finish and check for a validation/error message. If identifiers are rejected, return to the corresponding form and ask the user to recheck the receipt; do not repeatedly guess.
- Never submit an invoice with unverified personal, fiscal, email, or payment information.
- If the recording's final state is reached (the page offering PDF/email) and no delivery preference is provided, report that the invoice is ready for the user's choice without claiming that a PDF was generated or an email was sent.
