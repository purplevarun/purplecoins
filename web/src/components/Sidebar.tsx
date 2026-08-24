import { IconSearch, IconSettings } from "@/components/ui";
import type { Route } from "@/hooks/router";
import { useRouter } from "@/hooks/useRouter";

type NavItem = {
	label: string;
	icon: string;
	route: Route;
};

const FINANCE_NAV: NavItem[] = [
	{ label: "Transactions", icon: "⇄", route: { page: "transactions" } },
	{
		label: "Sources",
		icon: "◎",
		route: { page: "relations", kind: "SOURCE" },
	},
	{
		label: "Categories",
		icon: "◈",
		route: { page: "relations", kind: "CATEGORY" },
	},
	{ label: "Trips", icon: "✈", route: { page: "relations", kind: "TRIP" } },
	{
		label: "Investments",
		icon: "↗",
		route: { page: "relations", kind: "INVESTMENT" },
	},
	{ label: "Budgets", icon: "◉", route: { page: "budgets" } },
	{ label: "Analysis", icon: "◔", route: { page: "analysis" } },
	{ label: "Exchange Rates", icon: "⊕", route: { page: "exchange-rates" } },
];

const TOOLS_NAV: NavItem[] = [
	{ label: "Notes", icon: "≡", route: { page: "notes" } },
	{ label: "Todos", icon: "☑", route: { page: "todos" } },
];

const VAULT_NAV: NavItem[] = [
	{
		label: "Passwords",
		icon: "⚿",
		route: { page: "vault", kind: "PASSWORD" },
	},
	{ label: "Cards", icon: "▬", route: { page: "vault", kind: "CARD" } },
	{
		label: "Identities",
		icon: "◻",
		route: { page: "vault", kind: "IDENTITY" },
	},
];

const routeKey = (r: Route): string => {
	if ("kind" in r) return `${r.page}:${r.kind}`;
	return r.page;
};

const activeKey = (route: Route): string => {
	if ("kind" in route) return `${route.page}:${route.kind}`;
	return route.page;
};

export const Sidebar = () => {
	const { route, navigate } = useRouter();
	const current = activeKey(route);

	const renderItem = (item: NavItem) => {
		const key = routeKey(item.route);
		const isActive = current === key;
		return (
			<button
				key={key}
				className={`sidebar-item ${isActive ? "active" : ""}`}
				onClick={() => navigate(item.route)}
			>
				<span style={{ fontSize: 14 }}>{item.icon}</span>
				{item.label}
			</button>
		);
	};

	return (
		<nav className="sidebar">
			<div className="sidebar-brand">
				<button
					className="sidebar-brand-name"
					onClick={() => navigate({ page: "dashboard" })}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						padding: 0,
					}}
				>
					Purplecoins
				</button>
				<div className="sidebar-brand-tagline">
					Every coin accounted for.
				</div>
			</div>

			<div className="sidebar-section-label">Finance</div>
			{FINANCE_NAV.map(renderItem)}

			<div className="sidebar-section-label">Tools</div>
			{TOOLS_NAV.map(renderItem)}

			<div className="sidebar-section-label">Vault</div>
			{VAULT_NAV.map(renderItem)}

			<div className="sidebar-bottom">
				<button
					className={`sidebar-item ${current === "global-search" ? "active" : ""}`}
					onClick={() => navigate({ page: "global-search" })}
				>
					<IconSearch size={14} />
					Search
				</button>
				<button
					className={`sidebar-item ${current === "settings" ? "active" : ""}`}
					onClick={() => navigate({ page: "settings" })}
				>
					<IconSettings size={14} />
					Settings
				</button>
			</div>
		</nav>
	);
};
