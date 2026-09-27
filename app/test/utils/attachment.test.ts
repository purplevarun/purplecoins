import { formatFileSize, getAttachmentOwnerLabel } from "@/utils/attachment";

import { describe, expect, it } from "vitest";

describe("attachment utilities", () => {
	it("formats file sizes in KB and MB", () => {
		expect(formatFileSize(512)).toBe("1 KB");
		expect(formatFileSize(10 * 1024)).toBe("10 KB");
		expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
		expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
	});

	it("labels attachment owner types", () => {
		expect(getAttachmentOwnerLabel("DOCUMENT")).toBe("Document");
		expect(getAttachmentOwnerLabel("TRANSACTION")).toBe("Transaction");
		expect(getAttachmentOwnerLabel("NOTE")).toBe("Note");
		expect(getAttachmentOwnerLabel("TODO")).toBe("Todo");
		expect(getAttachmentOwnerLabel("CARD")).toBe("Card");
		expect(getAttachmentOwnerLabel("IDENTITY")).toBe("Identity");
	});
});
