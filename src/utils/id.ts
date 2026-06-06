import { randomUUID } from "expo-crypto";

const createId = (): string => randomUUID();

export { createId };
