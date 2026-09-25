import type RelationKind from "@/types/RelationKind";
import type RelationLabels from "@/types/RelationLabels";

const getRelationLabels = (kind: RelationKind): RelationLabels => {
	if (kind === "SOURCE") {
		return { singular: "source", plural: "sources", title: "Sources" };
	}
	if (kind === "CATEGORY") {
		return {
			singular: "category",
			plural: "categories",
			title: "Categories",
		};
	}
	if (kind === "TRIP") {
		return { singular: "trip", plural: "trips", title: "Trips" };
	}
	return {
		singular: "investment",
		plural: "investments",
		title: "Investments",
	};
};

export default getRelationLabels;
