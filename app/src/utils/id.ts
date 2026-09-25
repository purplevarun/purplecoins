import { randomUUID } from "expo-crypto";

const createId = (): string => randomUUID();

export default createId;
