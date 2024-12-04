import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import SourceRoutes from "./SourceRoutes";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/database/DatabaseFunctions";
import SourceTotal from "./SourceTotal";
import SourceRenderItem from "./SourceRenderItem";
import ISource from "../../../interfaces/ISource";

const SourceMain = () => {
	const { getSources } = useDatabase();
	const [sources, setSources] = useState<null | ISource[]>(null);

	useFocusEffect(useCallback(() => {
		setSources(getSources());
	}, []));

	if (!sources || sources.length === 0)
		return <NoContent sources />;

	return <ScreenLayout>
		<SourceTotal sources={sources} />
		<FlatList
			data={sources}
			renderItem={SourceRenderItem}
		/>
		<PlusButton to={SourceRoutes.Add} />
	</ScreenLayout>;
};


export default SourceMain;
