import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CustomText from "./CustomText";
import Header from "./Header";
import ISource from "./ISource";
import ScreenLayout from "./ScreenLayout";
import SourceRenderItem from "./SourceRenderItem";
import useSourceService from "./SourceService";
import SourceTotal from "./SourceTotal";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";

const SourceMain = () => {
	const { fetchSources } = useSourceService();
	const [sources, setSources] = useState<ISource[]>([]);
	const { navigate } = useNavigation<any>();
	useFocusEffect(useCallback(() => setSources(fetchSources()), []));

	return (
		<ScreenLayout>
			<Header
				title={"Sources"}
				navigateToAddScreen={() => navigate("Source.Add")}
			/>
			{sources.length > 0 ? (
				<>
					<SourceTotal sources={sources} />
					<FlatList
						data={sources}
						renderItem={({ item }) => (
							<SourceRenderItem item={item} />
						)}
					/>
				</>
			) : (
				<CustomText
					text={"No Sources found"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 3}
				/>
			)}
		</ScreenLayout>
	);
};

export default SourceMain;
