# External sales channels

Orders arrive inbound from each channel — now via the dedicated webhook router.

| Channel | Platform | Market | Inbound via |
|---|---|---|---|
| woo-1 | WooCommerce | EE (B2C) | webhook → `services/webhooks` |
| woo-2 | WooCommerce | LV (B2C) | webhook → `services/webhooks` |
| magento | Magento | Wholesale | webhook → `services/webhooks` |
