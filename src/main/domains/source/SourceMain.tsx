import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { sourceRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import ISource from "./ISource";
import SourceRenderItem from "./SourceRenderItem";
import SourceTotal from "./SourceTotal";

const SourceMain = () => {
	const [sources, setSources] = useState<ISource[]>([]);
	const { navigate } = useScreen();
	const { fetchAllSources } = useDatabase();
	const handlePlus = () => navigate(sourceRoutes.add);
	useFocus(() => setSources(fetchAllSources()));

	if (sources.length === 0) return <NoContent handlePlus={handlePlus} />;
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<SourceTotal />
			<FlashList
				data={sources}
				renderItem={SourceRenderItem}
				estimatedItemSize={3}
			/>
		</ScreenLayout>
	);
};

export default SourceMain;
