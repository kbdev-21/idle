import {Hono} from "hono";
import type {AppTypes} from "../../core/types.js";

export const caroRouter = new Hono<{Variables: AppTypes}>();
