const Routes = {
	Transaction: {
		Main: "Transactions",
		Add: "Add Transaction",
		Detail: "Transaction Detail",
	},
	Category: {
		Main: "Categories",
		Add: "Add Category",
		Detail: "Category Detail",
	},
	Trip: {
		Main: "Trips",
		Add: "Add Trip",
		Detail: "Trip Detail",
	},
	Source: {
		Main: "Sources",
		Add: "Add Source",
		Detail: "Source Detail",
	},
	Investment: {
		Main: "Investments",
		Add: "Add Investment",
		Detail: "Investment Detail",
	},
	Analysis: {
		Main: "Analysis",
	},
	User: {
		Main: "User",
	},
	Sync: "Sync Data",
};

export const menuRoutes = [
	Routes.Sync,
	Routes.Transaction.Main,
	Routes.Analysis.Main,
	Routes.Category.Main,
	Routes.Trip.Main,
	Routes.Source.Main,
	Routes.Investment.Main,
];

export default Routes;
