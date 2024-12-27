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
	Analysis: "Analysis",
	Sync: "Sync Data",
};

export const menuRoutes = [
	Routes.Transaction.Main,
	Routes.Analysis,
	Routes.Category.Main,
	Routes.Trip.Main,
	Routes.Source.Main,
	Routes.Investment.Main,
	Routes.Sync,
];

export const headerCloseButtonMap = {
	[Routes.Transaction.Add]: Routes.Transaction.Main,
	[Routes.Category.Add]: Routes.Category.Main,
	[Routes.Trip.Add]: Routes.Trip.Main,
	[Routes.Source.Add]: Routes.Source.Main,
	[Routes.Investment.Add]: Routes.Investment.Main,
	[Routes.Transaction.Detail]: Routes.Transaction.Main,
	[Routes.Category.Detail]: Routes.Category.Main,
	[Routes.Trip.Detail]: Routes.Trip.Main,
	[Routes.Source.Detail]: Routes.Source.Main,
	[Routes.Investment.Detail]: Routes.Investment.Main,
};

export const headerDetailButtonsList = [
	Routes.Transaction.Detail,
	Routes.Category.Detail,
	Routes.Trip.Detail,
	Routes.Source.Detail,
	Routes.Investment.Detail,
];

export default Routes;
