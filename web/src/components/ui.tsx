import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";

// ── Icons (inline SVG) ──────────────────────────────────────────────────────
type IconProps = { size?: number; color?: string; className?: string };

export const IconPlus = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2.5"
		strokeLinecap="round"
	>
		<line x1="12" y1="5" x2="12" y2="19" />
		<line x1="5" y1="12" x2="19" y2="12" />
	</svg>
);

export const IconArrowLeft = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M19 12H5M12 19l-7-7 7-7" />
	</svg>
);

export const IconSearch = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
);

export const IconSettings = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
);

export const IconTrash = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
	</svg>
);

export const IconEdit = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	</svg>
);

export const IconGlobe = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="10" />
		<line x1="2" y1="12" x2="22" y2="12" />
		<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
	</svg>
);

export const IconDownload = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="7 10 12 15 17 10" />
		<line x1="12" y1="15" x2="12" y2="3" />
	</svg>
);

export const IconUpload = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="17 8 12 3 7 8" />
		<line x1="12" y1="3" x2="12" y2="15" />
	</svg>
);

export const IconCopy = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	</svg>
);

export const IconEye = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

export const IconEyeOff = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
		<line x1="1" y1="1" x2="23" y2="23" />
	</svg>
);

export const IconCheck = ({ size = 16, color = "currentColor" }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

export const IconRefresh = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="23 4 23 10 17 10" />
		<polyline points="1 20 1 14 7 14" />
		<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
	</svg>
);

export const IconChevronLeft = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="15 18 9 12 15 6" />
	</svg>
);

export const IconChevronRight = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="9 18 15 12 9 6" />
	</svg>
);

export const IconFolder = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
	</svg>
);

export const IconPaperclip = ({
	size = 16,
	color = "currentColor",
}: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
	</svg>
);

// ── Shared UI Components ────────────────────────────────────────────────────

export const BackButton = ({ onClick }: { onClick: () => void }) => (
	<button className="back-btn" onClick={onClick}>
		<IconArrowLeft size={14} />
		Back
	</button>
);

export const Notice = ({
	message,
	tone = "info",
}: {
	message: string;
	tone?: "info" | "danger" | "success" | "warning";
}) => <div className={`notice notice-${tone}`}>{message}</div>;

export const Spinner = () => <div className="spinner" />;

export const EmptyState = ({
	icon,
	title,
	description,
}: {
	icon: string;
	title: string;
	description: string;
}) => (
	<div className="empty-state">
		<div className="empty-state-icon">{icon}</div>
		<div className="empty-state-title">{title}</div>
		<div className="empty-state-desc">{description}</div>
	</div>
);

type SegmentedControlProps = {
	options: readonly { label: string; value: string }[];
	value: string;
	onChange: (v: string) => void;
};

export const SegmentedControl = ({
	options,
	value,
	onChange,
}: SegmentedControlProps) => (
	<div className="segmented">
		{options.map((opt) => (
			<button
				key={opt.value}
				className={value === opt.value ? "active" : ""}
				onClick={() => onChange(opt.value)}
			>
				{opt.label}
			</button>
		))}
	</div>
);

type FieldProps = {
	label: string;
	children: ReactNode;
};
export const Field = ({ label, children }: FieldProps) => (
	<div className="field">
		<label>{label}</label>
		{children}
	</div>
);

type TextInputProps = {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	type?: string;
	autoFocus?: boolean;
};
export const TextInput = ({
	value,
	onChange,
	placeholder,
	type = "text",
	autoFocus,
}: TextInputProps) => (
	<input
		type={type}
		value={value}
		onChange={(e: ChangeEvent<HTMLInputElement>) =>
			onChange(e.target.value)
		}
		placeholder={placeholder}
		autoFocus={autoFocus}
	/>
);

type SelectInputProps = {
	value: string;
	onChange: (v: string) => void;
	options: readonly { label: string; value: string; description?: string }[];
	placeholder?: string;
};

export const SelectInput = ({
	value,
	onChange,
	options,
	placeholder,
}: SelectInputProps) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const selected = options.find((o) => o.value === value);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return options;
		return options.filter(
			(o) =>
				o.label.toLowerCase().includes(q) ||
				(o.description ?? "").toLowerCase().includes(q),
		);
	}, [options, search]);

	const handleSelect = (v: string) => {
		onChange(v);
		setOpen(false);
		setSearch("");
	};

	return (
		<div style={{ position: "relative" }}>
			<button
				type="button"
				onClick={() => {
					setSearch("");
					setOpen((o) => !o);
				}}
				style={{
					width: "100%",
					background: "rgba(255,255,255,0.04)",
					border: `1px solid ${open ? "var(--border-strong)" : "var(--border)"}`,
					borderRadius: "var(--radius-sm)",
					padding: "10px 12px",
					fontSize: 14,
					color: selected ? "var(--text)" : "var(--text-dim)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					cursor: "pointer",
					textAlign: "left",
					transition: "border-color 0.15s",
				}}
			>
				<span
					style={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{selected?.label ?? placeholder ?? "Select..."}
				</span>
				<span
					style={{
						color: "var(--text-dim)",
						fontSize: 10,
						flexShrink: 0,
						marginLeft: 6,
					}}
				>
					▾
				</span>
			</button>

			{open && (
				<>
					{/* backdrop */}
					<div
						style={{ position: "fixed", inset: 0, zIndex: 49 }}
						onClick={() => {
							setOpen(false);
							setSearch("");
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: "calc(100% + 4px)",
							left: 0,
							right: 0,
							zIndex: 50,
							background: "var(--bg-elevated)",
							border: "1px solid var(--border-strong)",
							borderRadius: "var(--radius)",
							boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
							overflow: "hidden",
							maxHeight: 320,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div style={{ padding: "8px 8px 4px" }}>
							<input
								autoFocus
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search..."
								style={{
									width: "100%",
									background: "rgba(255,255,255,0.06)",
									border: "1px solid var(--border)",
									borderRadius: "var(--radius-sm)",
									padding: "7px 10px",
									fontSize: 13,
									color: "var(--text)",
									outline: "none",
								}}
							/>
						</div>
						<div style={{ overflowY: "auto", flex: 1 }}>
							{placeholder && (
								<button
									type="button"
									onClick={() => handleSelect("")}
									style={{
										width: "100%",
										textAlign: "left",
										padding: "9px 12px",
										background: "none",
										border: "none",
										cursor: "pointer",
										color: "var(--text-dim)",
										fontSize: 13,
									}}
								>
									{placeholder}
								</button>
							)}
							{filtered.length === 0 ? (
								<div
									style={{
										padding: "12px",
										color: "var(--text-dim)",
										fontSize: 13,
										textAlign: "center",
									}}
								>
									No results for "{search}"
								</div>
							) : null}
							{filtered.map((opt) => (
								<button
									key={opt.value}
									type="button"
									onClick={() => handleSelect(opt.value)}
									style={{
										width: "100%",
										textAlign: "left",
										padding: "9px 12px",
										background:
											opt.value === value
												? "var(--primary-muted)"
												: "none",
										border: "none",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 8,
										transition: "background 0.1s",
									}}
									onMouseEnter={(e) => {
										if (opt.value !== value)
											(
												e.currentTarget as HTMLButtonElement
											).style.background =
												"rgba(255,255,255,0.05)";
									}}
									onMouseLeave={(e) => {
										if (opt.value !== value)
											(
												e.currentTarget as HTMLButtonElement
											).style.background = "none";
									}}
								>
									<div>
										<div
											style={{
												color:
													opt.value === value
														? "var(--primary-bright)"
														: "var(--text)",
												fontSize: 14,
												fontWeight: 600,
											}}
										>
											{opt.label}
										</div>
										{opt.description && (
											<div
												style={{
													color: "var(--text-dim)",
													fontSize: 11,
													marginTop: 1,
												}}
											>
												{opt.description}
											</div>
										)}
									</div>
									{opt.value === value && (
										<span
											style={{
												color: "var(--primary-bright)",
												fontSize: 13,
												flexShrink: 0,
											}}
										>
											✓
										</span>
									)}
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

type TextareaInputProps = {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	rows?: number;
};
export const TextareaInput = ({
	value,
	onChange,
	placeholder,
	rows = 3,
}: TextareaInputProps) => (
	<textarea
		value={value}
		onChange={(e) => onChange(e.target.value)}
		placeholder={placeholder}
		rows={rows}
	/>
);

export const PasswordInput = ({
	value,
	onChange,
	placeholder,
}: TextInputProps) => {
	const [show, setShow] = useState(false);
	return (
		<div className="input-with-btn">
			<input
				type={show ? "text" : "password"}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
			/>
			<button
				className="reveal-btn"
				type="button"
				onClick={() => setShow((s) => !s)}
			>
				{show ? <IconEyeOff size={14} /> : <IconEye size={14} />}
			</button>
		</div>
	);
};

type DateInputProps = {
	value: number;
	onChange: (v: number) => void;
};
export const DateInput = ({ value, onChange }: DateInputProps) => {
	const toDateString = (ts: number): string => {
		const d = new Date(ts);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	};
	return (
		<input
			type="date"
			value={toDateString(value)}
			onChange={(e) => {
				const d = new Date(e.target.value);
				d.setHours(12, 0, 0, 0);
				onChange(d.getTime());
			}}
		/>
	);
};

type SwitchProps = { checked: boolean; onChange: (v: boolean) => void };
export const Switch = ({ checked, onChange }: SwitchProps) => (
	<label className="switch">
		<input
			type="checkbox"
			checked={checked}
			onChange={(e) => onChange(e.target.checked)}
		/>
		<span className="switch-slider" />
	</label>
);

type ModalProps = {
	title: string;
	message?: string;
	children?: ReactNode;
	onClose: () => void;
};
export const Modal = ({ title, message, children, onClose }: ModalProps) => (
	<div className="modal-overlay" onClick={onClose}>
		<div className="modal" onClick={(e) => e.stopPropagation()}>
			<div className="modal-title">{title}</div>
			{message && <div className="modal-message">{message}</div>}
			{children}
		</div>
	</div>
);

type ConfirmModalProps = {
	title: string;
	message: string;
	confirmLabel?: string;
	variant?: "danger" | "primary";
	onConfirm: () => void;
	onCancel: () => void;
};
export const ConfirmModal = ({
	title,
	message,
	confirmLabel = "Confirm",
	variant = "danger",
	onConfirm,
	onCancel,
}: ConfirmModalProps) => (
	<Modal title={title} onClose={onCancel}>
		<div className="modal-message">{message}</div>
		<div className="modal-actions">
			<button className="btn btn-secondary" onClick={onCancel}>
				Cancel
			</button>
			<button
				className={`btn btn-${variant}`}
				onClick={() => {
					onConfirm();
					onCancel();
				}}
			>
				{confirmLabel}
			</button>
		</div>
	</Modal>
);

export const GlassCard = ({
	children,
	style,
}: {
	children: ReactNode;
	style?: React.CSSProperties;
}) => (
	<div className="glass-card" style={style}>
		{children}
	</div>
);

export const SectionHeading = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: string;
}) => (
	<div className="section-heading">
		<div className="section-heading-title">{title}</div>
		{subtitle && <div className="section-heading-sub">{subtitle}</div>}
	</div>
);

export const Chips = ({
	options,
	value,
	onChange,
	onLongPress,
}: {
	options: readonly { id: string; name: string }[];
	value: string;
	onChange: (id: string) => void;
	onLongPress?: (id: string) => void;
}) => (
	<div className="chips">
		{options.map((opt) => (
			<button
				key={opt.id}
				className={`chip ${value === opt.id ? "active" : ""}`}
				onClick={() => onChange(opt.id)}
				onContextMenu={(e) => {
					if (onLongPress) {
						e.preventDefault();
						onLongPress(opt.id);
					}
				}}
			>
				{opt.name}
			</button>
		))}
	</div>
);

export const CopyButton = ({ value }: { value: string }) => {
	const [copied, setCopied] = useState(false);
	const handle = () => {
		void navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};
	return (
		<button className="btn-icon btn" onClick={handle} title="Copy">
			{copied ? (
				<IconCheck size={13} color="var(--success)" />
			) : (
				<IconCopy size={13} />
			)}
		</button>
	);
};

// Simple SVG donut chart
type DonutDatum = { label: string; value: number; color: string };
export const DonutChart = ({
	data,
	size = 180,
}: {
	data: DonutDatum[];
	size?: number;
}) => {
	const total = data.reduce((s, d) => s + Math.abs(d.value), 0);
	if (!total) return null;
	const r = 70;
	const cx = size / 2;
	const cy = size / 2;
	const segments: { d: string; color: string; label: string }[] = [];
	let angle = -Math.PI / 2;
	data.forEach((item) => {
		const frac = Math.abs(item.value) / total;
		const sweep = frac * 2 * Math.PI;
		const x1 = cx + r * Math.cos(angle);
		const y1 = cy + r * Math.sin(angle);
		angle += sweep;
		const x2 = cx + r * Math.cos(angle);
		const y2 = cy + r * Math.sin(angle);
		const large = sweep > Math.PI ? 1 : 0;
		segments.push({
			d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
			color: item.color,
			label: item.label,
		});
	});
	return (
		<svg width={size} height={size}>
			{segments.map((seg, i) => (
				<path key={i} d={seg.d} fill={seg.color} opacity={0.85} />
			))}
			<circle cx={cx} cy={cy} r={r * 0.55} fill="var(--bg)" />
		</svg>
	);
};
