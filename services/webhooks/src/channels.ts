// Inbound sales-channel registry.
//
// Each external channel POSTs order webhooks to /hooks/<channel>. Signature
// verification + payload shape differ per platform, so we keep a registry that
// maps the channel id to its verifier and normalizer.
export type ChannelId = "woo-1" | "woo-2" | "magento";

export interface ChannelConfig {
  id: ChannelId;
  platform: "woocommerce" | "magento";
  market: "EE" | "LV" | "wholesale";
  signatureHeader: string;
}

export const CHANNELS: Record<ChannelId, ChannelConfig> = {
  "woo-1": {
    id: "woo-1",
    platform: "woocommerce",
    market: "EE",
    signatureHeader: "x-wc-webhook-signature",
  },
  "woo-2": {
    id: "woo-2",
    platform: "woocommerce",
    market: "LV",
    signatureHeader: "x-wc-webhook-signature",
  },
  magento: {
    id: "magento",
    platform: "magento",
    market: "wholesale",
    signatureHeader: "x-magento-hmac",
  },
};
