import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import AppButton from "@/components/AppButton";
import ScreenList from "@/components/ScreenList";
import appConstants from "@/constants/appConstants";
import styleConstants from "@/constants/styleConstants";
import type PagedScreenListProps from "@/types/PagedScreenListProps";

const { LIST_PAGE_SIZE } = appConstants;

const PagedScreenList = <T,>({
	data,
	...props
}: PagedScreenListProps<T>): ReactNode => {
	const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);
	const items = useMemo(() => data ?? [], [data]);
	const pagedData = useMemo(
		() => items.slice(0, visibleCount),
		[items, visibleCount],
	);
	const showMore = useCallback(() => {
		setVisibleCount((current) => current + LIST_PAGE_SIZE);
	}, []);
	const listFooter =
		items.length > visibleCount ? (
			<AppButton
				icon="chevron-down-outline"
				label="Load more"
				onPress={showMore}
				style={styles.footer}
				variant="secondary"
			/>
		) : null;
	return (
		<ScreenList
			{...props}
			ListFooterComponent={listFooter}
			data={pagedData}
		/>
	);
};

const { SIZES, SPACING } = styleConstants;

const styles = StyleSheet.create({
	footer: {
		marginTop: SPACING.S16,
		minHeight: SIZES.S50,
	},
});

export default PagedScreenList;
