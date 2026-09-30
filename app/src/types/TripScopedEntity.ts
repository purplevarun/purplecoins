import type SimpleEntity from "@/types/SimpleEntity";

type TripScopedEntity = SimpleEntity & Readonly<{ tripTypeId?: string | null }>;

export type { TripScopedEntity as default };
