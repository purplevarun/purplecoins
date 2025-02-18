import {
	categoryRoutes,
	investmentRoutes,
	sourceRoutes,
	tripRoutes,
} from "./Routes";
import RelationType from "./RelationType";

const RelationMap = {
	[RelationType.CATEGORY]: {
		name: "Category",
		routes: categoryRoutes,
	},
	[RelationType.SOURCE]: {
		name: "Source",
		routes: sourceRoutes,
	},
	[RelationType.TRIP]: {
		name: "Trip",
		routes: tripRoutes,
	},
	[RelationType.INVESTMENT]: {
		name: "Investment",
		routes: investmentRoutes,
	},
};

export default RelationMap;
