import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import ScreenLayout from "../../components/ScreenLayout";
import PlusButton from "../../components/PlusButton";
import NoContent from "../../NoContent";
import SourceTotal from "./SourceTotal";
import SourceRenderItem from "./SourceRenderItem";
import ISource from "../../interfaces/ISource";
import useSourceService from "./SourceService";
import Routes from "../../Routes";

const SourceMain = () => {
	const { fetchSources } = useSourceService();
	const [sources, setSources] = useState<null | ISource[]>(null);

	useFocusEffect(useCallback(() => setSources(fetchSources()), []));

	if (!sources || sources.length === 0) return <NoContent sources />;

	return (
		<ScreenLayout>
			<SourceTotal sources={sources} />
			<FlatList data={sources} renderItem={SourceRenderItem} />
			<PlusButton to={Routes.Source.Add} />
		</ScreenLayout>
	);
};

export default SourceMain;
