import type { Route } from "@/hooks/router";
import { useRouter } from "@/hooks/useRouter";

type Tile = {
	label: string;
	subtitle: string;
	icon: string;
	color: string;
	route: Route;
};

const FINANCE: Tile[] = [
	{
		label: "Transactions",
		subtitle: "Money movements",
		icon: "⇄",
		color: "#A87CFF",
		route: { page: "transactions" },
	},
	{
		label: "Sources",
		subtitle: "Accounts & cards",
		icon: "◎",
		color: "#60A5FA",
		route: { page: "relations", kind: "SOURCE" },
	},
	{
		label: "Categories",
		subtitle: "Income & expense",
		icon: "◈",
		color: "#F5B95B",
		route: { page: "relations", kind: "CATEGORY" },
	},
	{
		label: "Trips",
		subtitle: "Travel spending",
		icon: "✈",
		color: "#68D5FF",
		route: { page: "relations", kind: "TRIP" },
	},
	{
		label: "Investments",
		subtitle: "Invested & redeemed",
		icon: "↗",
		color: "#52D6A3",
		route: { page: "relations", kind: "INVESTMENT" },
	},
	{
		label: "Budgets",
		subtitle: "Calendar targets",
		icon: "◉",
		color: "#FF8FA3",
		route: { page: "budgets" },
	},
	{
		label: "Analysis",
		subtitle: "Category-driven",
		icon: "◔",
		color: "#C9A7FF",
		route: { page: "analysis" },
	},
	{
		label: "Exchange Rates",
		subtitle: "Master INR rates",
		icon: "⊕",
		color: "#66E0C2",
		route: { page: "exchange-rates" },
	},
];

const TOOLS: Tile[] = [
	{
		label: "Notes",
		subtitle: "Capture details",
		icon: "≡",
		color: "#73B7FF",
		route: { page: "notes" },
	},
	{
		label: "Todos",
		subtitle: "Things to finish",
		icon: "☑",
		color: "#52D6A3",
		route: { page: "todos" },
	},
];

const VAULT: Tile[] = [
	{
		label: "Passwords",
		subtitle: "Local credentials",
		icon: "⚿",
		color: "#F5B95B",
		route: { page: "vault", kind: "PASSWORD" },
	},
	{
		label: "Cards",
		subtitle: "Payment details",
		icon: "▬",
		color: "#FF8FA3",
		route: { page: "vault", kind: "CARD" },
	},
	{
		label: "Identities",
		subtitle: "Personal records",
		icon: "◻",
		color: "#60A5FA",
		route: { page: "vault", kind: "IDENTITY" },
	},
];

const TileGrid = ({ tiles }: { tiles: Tile[] }) => {
	const { navigate } = useRouter();
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: 10,
			}}
		>
			{tiles.map((tile) => (
				<button
					key={tile.label}
					className="dashboard-tile"
					onClick={() => navigate(tile.route)}
				>
					<div
						className="dashboard-tile-icon"
						style={{ background: `${tile.color}22` }}
					>
						<span style={{ color: tile.color, fontSize: 20 }}>
							{tile.icon}
						</span>
					</div>
					<div className="dashboard-tile-title">{tile.label}</div>
					<div className="dashboard-tile-subtitle">
						{tile.subtitle}
					</div>
				</button>
			))}
		</div>
	);
};

export const DashboardPage = () => (
	<div style={{ maxWidth: 900 }}>
		<div style={{ marginBottom: 28 }}>
			<div
				style={{
					fontSize: 11,
					fontWeight: 900,
					color: "var(--primary-bright)",
					letterSpacing: 1.8,
					textTransform: "uppercase",
				}}
			>
				YOUR PRIVATE LEDGER
			</div>
			<div
				style={{
					fontSize: 36,
					fontWeight: 900,
					color: "var(--text)",
					letterSpacing: -1,
					marginTop: 4,
				}}
			>
				Purplecoins
			</div>
			<div
				style={{
					fontSize: 14,
					color: "var(--text-muted)",
					marginTop: 4,
				}}
			>
				Every coin accounted for.
			</div>
		</div>

		<div
			style={{
				fontSize: 13,
				fontWeight: 800,
				color: "var(--text-dim)",
				textTransform: "uppercase",
				letterSpacing: 1,
				marginBottom: 10,
			}}
		>
			Finance
		</div>
		<TileGrid tiles={FINANCE} />

		<div
			style={{
				fontSize: 13,
				fontWeight: 800,
				color: "var(--text-dim)",
				textTransform: "uppercase",
				letterSpacing: 1,
				margin: "24px 0 10px",
			}}
		>
			Tools
		</div>
		<TileGrid tiles={TOOLS} />

		<div
			style={{
				fontSize: 13,
				fontWeight: 800,
				color: "var(--text-dim)",
				textTransform: "uppercase",
				letterSpacing: 1,
				margin: "24px 0 10px",
			}}
		>
			Vault
		</div>
		<TileGrid tiles={VAULT} />
	</div>
);
