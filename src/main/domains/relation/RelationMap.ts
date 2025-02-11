import {
	categoryRoutes,
	investmentRoutes,
	sourceRoutes,
	tripRoutes,
} from "../../app/router/Routes";
import RelationType from "../../constants/enums/RelationType";

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
