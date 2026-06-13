import {
	BackButton,
	ConfirmModal,
	CopyButton,
	EmptyState,
	Field,
	GlassCard,
	IconPlus,
	IconTrash,
	Notice,
	PasswordInput,
	TextInput,
	TextareaInput,
} from "@/components/ui";
import type { VaultKind } from "@/hooks/router";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { deleteCard, getCards, saveCard } from "@/services/cardService";
import {
	deleteIdentity,
	getIdentities,
	saveIdentity,
} from "@/services/identityService";
import {
	deletePassword,
	getPasswords,
	savePassword,
} from "@/services/passwordService";
import type { CardEntry } from "@/types/CardEntry";
import type { IdentityEntry } from "@/types/IdentityEntry";
import type { PasswordEntry } from "@/types/PasswordEntry";
import { getErrorMessage } from "@/utils/error";
import { useCallback, useEffect, useState } from "react";

// ── Vault List ────────────────────────────────────────────────────────────────
export const VaultPage = ({ kind }: { kind: VaultKind }) => {
	const { db, dataVersion, refreshData } = useDb();
	const { navigate } = useRouter();
	const [items, setItems] = useState<
		readonly (PasswordEntry | CardEntry | IdentityEntry)[]
	>([]);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [expanded, setExpanded] = useState<string | null>(null);

	const load = useCallback(async () => {
		if (!db) return;
		try {
			if (kind === "PASSWORD") setItems(await getPasswords(db));
			else if (kind === "CARD") setItems(await getCards(db));
			else setItems(await getIdentities(db));
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db, kind]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const handleDelete = async (id: string) => {
		if (!db) return;
		try {
			if (kind === "PASSWORD") await deletePassword(db, id);
			else if (kind === "CARD") await deleteCard(db, id);
			else await deleteIdentity(db, id);
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	const LABELS: Record<VaultKind, string> = {
		PASSWORD: "password",
		CARD: "card",
		IDENTITY: "identity",
	};
	const ICONS: Record<VaultKind, string> = {
		PASSWORD: "⚿",
		CARD: "▬",
		IDENTITY: "◻",
	};

	const renderItem = (item: PasswordEntry | CardEntry | IdentityEntry) => {
		const id = item.id;
		const isOpen = expanded === id;
		if (kind === "PASSWORD") {
			const p = item as PasswordEntry;
			return (
				<GlassCard key={id}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
						}}
					>
						<div style={{ flex: 1 }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
								}}
							>
								<span
									style={{
										fontWeight: 800,
										color: "var(--text)",
										cursor: "pointer",
									}}
									onClick={() =>
										setExpanded(isOpen ? null : id)
									}
								>
									{p.title}
								</span>
								{p.website && (
									<span
										style={{
											fontSize: 11,
											color: "var(--text-dim)",
										}}
									>
										{p.website}
									</span>
								)}
							</div>
							{isOpen && (
								<div
									style={{
										marginTop: 10,
										display: "flex",
										flexDirection: "column",
										gap: 6,
									}}
								>
									{p.username && (
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 6,
											}}
										>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-dim)",
												}}
											>
												User:
											</span>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-muted)",
												}}
											>
												{p.username}
											</span>
											<CopyButton value={p.username} />
										</div>
									)}
									{p.password && (
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 6,
											}}
										>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-dim)",
												}}
											>
												Pass:
											</span>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-muted)",
													fontFamily: "monospace",
												}}
											>
												{"•".repeat(
													Math.min(
														p.password.length,
														12,
													),
												)}
											</span>
											<CopyButton value={p.password} />
										</div>
									)}
									{p.notes && (
										<div
											style={{
												fontSize: 12,
												color: "var(--text-dim)",
												marginTop: 2,
											}}
										>
											{p.notes}
										</div>
									)}
								</div>
							)}
						</div>
						<div style={{ display: "flex", gap: 6 }}>
							<button
								className="btn btn-secondary"
								style={{ fontSize: 11, padding: "5px 10px" }}
								onClick={() =>
									navigate({
										page: "vault-form",
										kind,
										entryId: id,
									})
								}
							>
								Edit
							</button>
							<button
								className="btn-icon btn"
								onClick={() =>
									setDeleteTarget({ id, name: p.title })
								}
							>
								<IconTrash size={13} />
							</button>
						</div>
					</div>
				</GlassCard>
			);
		}
		if (kind === "CARD") {
			const c = item as CardEntry;
			return (
				<GlassCard key={id}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
						}}
					>
						<div style={{ flex: 1 }}>
							<div
								style={{
									fontWeight: 800,
									color: "var(--text)",
									cursor: "pointer",
								}}
								onClick={() => setExpanded(isOpen ? null : id)}
							>
								{c.name} {c.network ? `· ${c.network}` : ""}
							</div>
							{isOpen && (
								<div
									style={{
										marginTop: 10,
										display: "flex",
										flexDirection: "column",
										gap: 6,
									}}
								>
									{c.cardNumber && (
										<div
											style={{
												display: "flex",
												gap: 6,
												alignItems: "center",
											}}
										>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-dim)",
												}}
											>
												Number:
											</span>
											<span
												style={{
													fontSize: 12,
													fontFamily: "monospace",
												}}
											>
												{c.cardNumber}
											</span>
											<CopyButton value={c.cardNumber} />
										</div>
									)}
									{c.expiry && (
										<div
											style={{
												fontSize: 12,
												color: "var(--text-dim)",
											}}
										>
											Expiry: {c.expiry}
										</div>
									)}
									{c.cvv && (
										<div
											style={{
												display: "flex",
												gap: 6,
												alignItems: "center",
											}}
										>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-dim)",
												}}
											>
												CVV:
											</span>
											<span
												style={{
													fontFamily: "monospace",
													fontSize: 12,
												}}
											>
												{c.cvv}
											</span>
											<CopyButton value={c.cvv} />
										</div>
									)}
									{c.pin && (
										<div
											style={{
												display: "flex",
												gap: 6,
												alignItems: "center",
											}}
										>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-dim)",
												}}
											>
												PIN:
											</span>
											<span
												style={{
													fontFamily: "monospace",
													fontSize: 12,
												}}
											>
												{c.pin}
											</span>
											<CopyButton value={c.pin} />
										</div>
									)}
									{c.notes && (
										<div
											style={{
												fontSize: 12,
												color: "var(--text-dim)",
											}}
										>
											{c.notes}
										</div>
									)}
								</div>
							)}
						</div>
						<div style={{ display: "flex", gap: 6 }}>
							<button
								className="btn btn-secondary"
								style={{ fontSize: 11, padding: "5px 10px" }}
								onClick={() =>
									navigate({
										page: "vault-form",
										kind,
										entryId: id,
									})
								}
							>
								Edit
							</button>
							<button
								className="btn-icon btn"
								onClick={() =>
									setDeleteTarget({ id, name: c.name })
								}
							>
								<IconTrash size={13} />
							</button>
						</div>
					</div>
				</GlassCard>
			);
		}
		const ident = item as IdentityEntry;
		return (
			<GlassCard key={id}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
					}}
				>
					<div
						style={{ flex: 1, cursor: "pointer" }}
						onClick={() => setExpanded(isOpen ? null : id)}
					>
						<div style={{ fontWeight: 800, color: "var(--text)" }}>
							{ident.title}
						</div>
						{isOpen && (
							<div
								style={{
									marginTop: 8,
									display: "flex",
									flexDirection: "column",
									gap: 4,
								}}
							>
								{ident.idNumber && (
									<div
										style={{
											display: "flex",
											gap: 6,
											alignItems: "center",
										}}
									>
										<span
											style={{
												fontSize: 12,
												color: "var(--text-dim)",
											}}
										>
											ID:
										</span>
										<span
											style={{
												fontSize: 12,
												fontFamily: "monospace",
											}}
										>
											{ident.idNumber}
										</span>
										<CopyButton value={ident.idNumber} />
									</div>
								)}
								{ident.notes && (
									<div
										style={{
											fontSize: 12,
											color: "var(--text-dim)",
										}}
									>
										{ident.notes}
									</div>
								)}
							</div>
						)}
					</div>
					<div style={{ display: "flex", gap: 6 }}>
						<button
							className="btn btn-secondary"
							style={{ fontSize: 11, padding: "5px 10px" }}
							onClick={() =>
								navigate({
									page: "vault-form",
									kind,
									entryId: id,
								})
							}
						>
							Edit
						</button>
						<button
							className="btn-icon btn"
							onClick={() =>
								setDeleteTarget({ id, name: ident.title })
							}
						>
							<IconTrash size={13} />
						</button>
					</div>
				</div>
			</GlassCard>
		);
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					marginBottom: 16,
				}}
			>
				<button
					className="btn btn-primary"
					onClick={() => navigate({ page: "vault-form", kind })}
				>
					<IconPlus size={14} /> Add {LABELS[kind]}
				</button>
			</div>
			{error && <Notice message={error} tone="danger" />}
			{items.length === 0 ? (
				<EmptyState
					icon={ICONS[kind]}
					title={`No ${LABELS[kind]}s`}
					description={`Store your ${LABELS[kind]} details securely.`}
				/>
			) : (
				<div className="list">{items.map(renderItem)}</div>
			)}
			{deleteTarget && (
				<ConfirmModal
					title={`Delete "${deleteTarget.name}"?`}
					message="This entry will be permanently removed."
					confirmLabel="Delete"
					onConfirm={() => handleDelete(deleteTarget.id)}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
};

// ── Vault Form ────────────────────────────────────────────────────────────────
export const VaultFormPage = ({
	kind,
	entryId,
}: {
	kind: VaultKind;
	entryId?: string;
}) => {
	const { db, refreshData } = useDb();
	const { back } = useRouter();
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	const set = (key: string) => (v: string) =>
		setFields((f) => ({ ...f, [key]: v }));
	const get = (key: string) => fields[key] ?? "";

	useEffect(() => {
		if (!db || !entryId) return;
		const load = async () => {
			try {
				if (kind === "PASSWORD") {
					const p = (await getPasswords(db)).find(
						(x) => x.id === entryId,
					);
					if (p)
						setFields({
							title: p.title,
							username: p.username,
							password: p.password,
							website: p.website,
							notes: p.notes,
						});
				} else if (kind === "CARD") {
					const c = (await getCards(db)).find(
						(x) => x.id === entryId,
					);
					if (c)
						setFields({
							name: c.name,
							cardNumber: c.cardNumber,
							expiry: c.expiry,
							cvv: c.cvv,
							pin: c.pin,
							network: c.network,
							notes: c.notes,
						});
				} else {
					const i = (await getIdentities(db)).find(
						(x) => x.id === entryId,
					);
					if (i)
						setFields({
							title: i.title,
							idNumber: i.idNumber,
							notes: i.notes,
						});
				}
			} catch (e) {
				setError(getErrorMessage(e));
			}
		};
		void load();
	}, [db, entryId, kind]);

	const handleSave = async () => {
		if (!db) return;
		setIsSaving(true);
		setError("");
		try {
			if (kind === "PASSWORD")
				await savePassword(db, {
					id: entryId,
					title: get("title"),
					username: get("username"),
					password: get("password"),
					website: get("website"),
					notes: get("notes"),
				});
			else if (kind === "CARD")
				await saveCard(db, {
					id: entryId,
					name: get("name"),
					cardNumber: get("cardNumber"),
					expiry: get("expiry"),
					cvv: get("cvv"),
					pin: get("pin"),
					network: get("network"),
					notes: get("notes"),
				});
			else
				await saveIdentity(db, {
					id: entryId,
					title: get("title"),
					idNumber: get("idNumber"),
					notes: get("notes"),
				});
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsSaving(false);
		}
	};

	const TITLES: Record<VaultKind, string> = {
		PASSWORD: "Password",
		CARD: "Card",
		IDENTITY: "Identity",
	};

	return (
		<div className="page-form">
			<BackButton onClick={back} />
			<div
				style={{
					fontSize: 20,
					fontWeight: 900,
					color: "var(--text)",
					marginBottom: 4,
				}}
			>
				{entryId ? `Edit ${TITLES[kind]}` : `New ${TITLES[kind]}`}
			</div>
			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					{kind === "PASSWORD" && (
						<>
							<Field label="Title">
								<TextInput
									value={get("title")}
									onChange={set("title")}
									placeholder="e.g. Gmail"
									autoFocus
								/>
							</Field>
							<Field label="Username">
								<TextInput
									value={get("username")}
									onChange={set("username")}
									placeholder="username or email"
								/>
							</Field>
							<Field label="Password">
								<PasswordInput
									value={get("password")}
									onChange={set("password")}
									placeholder="password"
								/>
							</Field>
							<Field label="Website">
								<TextInput
									value={get("website")}
									onChange={set("website")}
									placeholder="https://..."
								/>
							</Field>
							<Field label="Notes">
								<TextareaInput
									value={get("notes")}
									onChange={set("notes")}
									placeholder="Any extra info..."
									rows={2}
								/>
							</Field>
						</>
					)}
					{kind === "CARD" && (
						<>
							<Field label="Name">
								<TextInput
									value={get("name")}
									onChange={set("name")}
									placeholder="Card name"
									autoFocus
								/>
							</Field>
							<Field label="Card number">
								<TextInput
									value={get("cardNumber")}
									onChange={set("cardNumber")}
									placeholder="1234 5678 9012 3456"
								/>
							</Field>
							<Field label="Expiry">
								<TextInput
									value={get("expiry")}
									onChange={set("expiry")}
									placeholder="MM/YY"
								/>
							</Field>
							<Field label="CVV">
								<TextInput
									value={get("cvv")}
									onChange={set("cvv")}
									placeholder="123"
								/>
							</Field>
							<Field label="PIN">
								<TextInput
									value={get("pin")}
									onChange={set("pin")}
									placeholder="1234"
								/>
							</Field>
							<Field label="Network">
								<TextInput
									value={get("network")}
									onChange={set("network")}
									placeholder="Visa / Mastercard / RuPay..."
								/>
							</Field>
							<Field label="Notes">
								<TextareaInput
									value={get("notes")}
									onChange={set("notes")}
									placeholder="Any extra info..."
									rows={2}
								/>
							</Field>
						</>
					)}
					{kind === "IDENTITY" && (
						<>
							<Field label="Title">
								<TextInput
									value={get("title")}
									onChange={set("title")}
									placeholder="e.g. Aadhaar"
									autoFocus
								/>
							</Field>
							<Field label="ID Number">
								<TextInput
									value={get("idNumber")}
									onChange={set("idNumber")}
									placeholder="ID number"
								/>
							</Field>
							<Field label="Notes">
								<TextareaInput
									value={get("notes")}
									onChange={set("notes")}
									placeholder="Any extra info..."
									rows={2}
								/>
							</Field>
						</>
					)}
				</div>
			</GlassCard>
			{error && <Notice message={error} tone="danger" />}
			<div className="form-actions">
				<button
					className="btn btn-primary"
					onClick={handleSave}
					disabled={isSaving}
				>
					{isSaving ? "Saving..." : entryId ? "Update" : "Save"}
				</button>
				<button className="btn btn-secondary" onClick={back}>
					Cancel
				</button>
			</div>
		</div>
	);
};
