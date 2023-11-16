import { createDeliveryClient } from "@kontent-ai/delivery-sdk";

const environmentId: string = "2542ce4a-3be3-01e8-fdf0-ce1b87b58f11";
const previewApiKey: string | undefined = undefined;
const secureApiKey: string | undefined = undefined;

export const deliveryClient = createDeliveryClient({
  environmentId: environmentId,
  previewApiKey: previewApiKey,
  secureApiKey: secureApiKey,
  defaultQueryConfig: {
    usePreviewMode: previewApiKey ? true : false,
    useSecuredMode: secureApiKey ? true : false,
  },
});

export const csvFilename = `missing-rte-items.csv`;
