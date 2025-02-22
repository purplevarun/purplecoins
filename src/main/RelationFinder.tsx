import { useState } from "react";
import CustomInput from "./CustomInput";
import Relation from "./Relation";
import RelationType from "./RelationType";
import { PADDING } from "./constants.config";
import useDatabase from "./useDatabase";

const RelationFinder = ({
	setRelations,
	type,
	showFinder,
}: {
	setRelations: (_: Relation[]) => void;
	type: RelationType;
	showFinder: boolean;
}) => {
	const [searchText, setSearchText] = useState("");
	const { fetchAllRelations } = useDatabase();
	const onFind = (value: string) => {
		setSearchText(value);
		const rawRelations = fetchAllRelations(type);
		const filteredRelations = rawRelations.filter((relation) =>
			relation.name.toLowerCase().includes(value.toLowerCase()),
		);
		setRelations(filteredRelations);
	};
	return (
		showFinder && (
			<CustomInput
				name={"Search"}
				value={searchText}
				setValue={onFind}
				width={"100%"}
				bottom={PADDING}
				autoFocus
			/>
		)
	);
};

export default RelationFinder;
