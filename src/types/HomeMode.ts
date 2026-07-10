const HOME_MODES = ["TOOLS", "FINANCE", "VAULT"] as const;

type HomeMode = (typeof HOME_MODES)[number];

export { HOME_MODES };
export type { HomeMode };
