# External sales channels

All channels deliver orders inbound — either by webhook (`services/webhooks`)
or by direct API call to the gateway (`services/api-gateway`).

| Channel | Platform | Market | Inbound via |
|---|---|---|---|
| woo-1 | WooCommerce | EE (B2C) | webhook → `services/webhooks` |
| woo-2 | WooCommerce | LV (B2C) | webhook → `services/webhooks` |
| magento | Magento | Wholesale | webhook → `services/webhooks` |
| pos-fleet | In-store POS | Retail | API call → `services/api-gateway` |

The POS terminals hold a service JWT and call the gateway's `/orders` endpoint
directly (they need synchronous stock + payment authorization), whereas the
e-commerce platforms fire asynchronous order-created webhooks.
