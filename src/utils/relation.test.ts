import getRelationLabels from "@/utils/relation";

import { describe, expect, it } from "vitest";

describe("getRelationLabels", () => {
	it("returns source labels", () => {
		expect(getRelationLabels("SOURCE")).toEqual({
			singular: "source",
			plural: "sources",
			title: "Sources",
		});
	});

	it("returns category labels", () => {
		expect(getRelationLabels("CATEGORY")).toEqual({
			singular: "category",
			plural: "categories",
			title: "Categories",
		});
	});

	it("returns trip labels", () => {
		expect(getRelationLabels("TRIP")).toEqual({
			singular: "trip",
			plural: "trips",
			title: "Trips",
		});
	});

	it("returns investment labels as the fallback branch", () => {
		expect(getRelationLabels("INVESTMENT")).toEqual({
			singular: "investment",
			plural: "investments",
			title: "Investments",
		});
	});
});
