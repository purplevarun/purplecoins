import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import CustomList from "./CustomList";
import ISource from "./ISource";
import NewHeader from "./NewHeader";
import NoContent from "./NoContent";
import ScreenLayout from "./ScreenLayout";
import useSourceService from "./SourceService";
import SourceTotal from "./SourceTotal";
import useFocus from "./useFocus";

const SourceMain = () => {
	const { fetchSources } = useSourceService();
	const [sources, setSources] = useState<ISource[]>([]);
	const { name } = useRoute();
	useFocus(() => setSources(fetchSources()));

	if (sources.length === 0) return <NoContent />;

	return (
		<ScreenLayout>
			<NewHeader screenName={name} />
			<SourceTotal sources={sources} />
			<CustomList data={sources} />
		</ScreenLayout>
	);
};

export default SourceMain;
