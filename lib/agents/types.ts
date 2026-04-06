import type { Dataset } from "@/lib/schemas/bokchoys";

export type BokchoysRunContext = {
  classifiedIntent: string;
  dataset?: Dataset;
  companyName: string;
  productName: string;
};

