type AutoBackupSettings = Readonly<{
	enabled: boolean;
	intervalDays: number;
	directoryUri: string | null;
	lastBackupAt: number;
}>;

export type { AutoBackupSettings as default };
