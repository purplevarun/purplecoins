const ALIGN = {
	CENTER: "center",
	END: "flex-end",
	RIGHT: "right",
	SPACE_BETWEEN: "space-between",
	START: "flex-start",
	TOP: "top",
} as const;

const BORDER = {
	THICK: 2,
	THIN: 1,
} as const;

const FLEX = {
	FILL: 1,
	NONE: 0,
	ROW: "row",
	SHRINK: 1,
	STRETCH: "stretch",
	WRAP: "wrap",
} as const;

const FONT_SIZE = {
	S10: 10,
	S11: 11,
	S12: 12,
	S13: 13,
	S14: 14,
	S15: 15,
	S16: 16,
	S17: 17,
	S18: 18,
	S20: 20,
	S22: 22,
	S24: 24,
	S25: 25,
	S30: 30,
	S36: 36,
	S9: 9,
} as const;

const FONT_VARIANT = {
	TABULAR_NUMS: "tabular-nums",
} as const;

const FONT_WEIGHT = {
	BLACK: "900",
	BOLD: "700",
	HEAVY: "800",
} as const;

const LETTER_SPACING = {
	NONE: 0,
	RELAXED: 0.2,
	SNUG: -0.2,
	TIGHT: -0.5,
	WIDE: 0.6,
	WIDER: 0.7,
	WIDEST: 0.8,
} as const;

const LINE_HEIGHT = {
	S15: 15,
	S16: 16,
	S17: 17,
	S18: 18,
	S19: 19,
	S20: 20,
	S36: 36,
} as const;

const OPACITY = {
	FAINT: 0.3,
	FULL: 1,
	MEDIUM: 0.45,
	MUTED: 0.55,
} as const;

const OVERFLOW = {
	HIDDEN: "hidden",
} as const;

const POSITION = {
	ABSOLUTE: "absolute",
	RELATIVE: "relative",
} as const;

const RADIUS = {
	PILL: 999,
	S12: 12,
	S14: 14,
	S15: 15,
	S16: 16,
	S17: 17,
	S20: 20,
	S22: 22,
	S24: 24,
	S30: 30,
	S4: 4,
	S5: 5,
} as const;

const SCALE = {
	FIRM: 0.94,
	GENTLE: 0.98,
	LIGHT: 0.96,
	STRONG: 0.92,
} as const;

const SHADOW = {
	ELEVATION_HIGH: 10,
	ELEVATION_LOW: 4,
	ELEVATION_MID: 6,
	OFFSET_X: 0,
	OFFSET_Y_LG: 12,
	OFFSET_Y_MD: 10,
	OFFSET_Y_SM: 8,
	OPACITY: 0.35,
	OPACITY_SOFT: 0.24,
	OPACITY_STRONG: 0.5,
	RADIUS_LG: 20,
	RADIUS_MD: 18,
	RADIUS_XL: 24,
} as const;

const SIZES = {
	FULL: "100%",
	S0: 0,
	S120: 120,
	S122: 122,
	S14: 14,
	S150: 150,
	S16: 16,
	S34: 34,
	S38: 38,
	S40: 40,
	S42: 42,
	S43: 43,
	S44: 44,
	S48: 48,
	S50: 50,
	S54: 54,
	S64: 64,
	S8: 8,
	S420: 420,
	S9: 9,
	SHEET: "85%",
	TILE: "48.5%",
} as const;

const SPACING = {
	N2: -2,
	N6: -6,
	S0: 0,
	S1: 1,
	S10: 10,
	S11: 11,
	S12: 12,
	S120: 120,
	S13: 13,
	S14: 14,
	S15: 15,
	S16: 16,
	S18: 18,
	S2: 2,
	S20: 20,
	S22: 22,
	S24: 24,
	S3: 3,
	S4: 4,
	S40: 40,
	S48: 48,
	S5: 5,
	S56: 56,
	S6: 6,
	S7: 7,
	S8: 8,
	S9: 9,
} as const;

const TEXT_DECORATION = {
	LINE_THROUGH: "line-through",
} as const;

const TEXT_TRANSFORM = {
	CAPITALIZE: "capitalize",
	UPPERCASE: "uppercase",
} as const;

const styleConstants = {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_VARIANT,
	FONT_WEIGHT,
	LETTER_SPACING,
	LINE_HEIGHT,
	OPACITY,
	OVERFLOW,
	POSITION,
	RADIUS,
	SCALE,
	SHADOW,
	SIZES,
	SPACING,
	TEXT_DECORATION,
	TEXT_TRANSFORM,
};

export default styleConstants;
