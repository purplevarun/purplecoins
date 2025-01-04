import { useState } from "react";
import CustomList from "../CustomList";
import Header from "../Header";
import NoContent from "../NoContent";
import ScreenLayout from "../ScreenLayout";
import useFocus from "../useFocus";
import ISource from "./ISource";
import SourceTotal from "./SourceTotal";
import useSource from "./useSource";

const SourceMain = () => {
	const { fetchSources, handlePlus } = useSource();
	const [sources, setSources] = useState<ISource[]>([]);
	useFocus(() => setSources(fetchSources()));

	if (sources.length === 0) return <NoContent />;
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<SourceTotal sources={sources} />
			<CustomList data={sources} />
		</ScreenLayout>
	);
};

export default SourceMain;
