import { FlatList } from "react-native";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
import SourceRenderItem from "./SourceRenderItem";
import SourceTotal from "./SourceTotal";
import useSource from "./useSource";

const SourceMain = () => {
	const { handlePlus, handleMainFocus, sources } = useSource();
	useFocus(handleMainFocus);

	if (sources.length === 0) return <NoContent handlePlus={handlePlus} />;

	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<SourceTotal sources={sources} />
			<FlatList data={sources} renderItem={SourceRenderItem} />
		</ScreenLayout>
	);
};

export default SourceMain;
