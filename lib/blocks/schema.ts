import { z } from "zod";

import { blockTypes } from "./types";

export const blockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(blockTypes),
  data: z.record(z.string(), z.unknown()).default({}),
});

export const bodyBlocksSchema = z.array(blockSchema);

export type ContentBlock = z.infer<typeof blockSchema>;
