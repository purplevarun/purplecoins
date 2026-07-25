import folderConstants from "@/constants/folderConstants";

import { describe, expect, it } from "vitest";

const { FOLDER_FILTER_ALL, FOLDER_FILTER_NONE } = folderConstants;

describe("folderConstants", () => {
	it("defines distinct sentinel values for the 'all' and 'no folder' filters", () => {
		expect(FOLDER_FILTER_ALL).toBeTruthy();
		expect(FOLDER_FILTER_NONE).toBeTruthy();
		expect(FOLDER_FILTER_ALL).not.toBe(FOLDER_FILTER_NONE);
	});
});
