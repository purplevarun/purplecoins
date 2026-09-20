type FinanceTestItem<Entity> =
	Entity | Readonly<{ kind: "INVESTMENT"; entity: Entity }>;

export type { FinanceTestItem as default };
