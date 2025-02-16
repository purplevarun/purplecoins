import { useState } from "react";
import { PADDING } from "../../constants/config/constants.config";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import Relation from "../../models/Relation";
import CustomInput from "../input/CustomInput";

const RelationFinder = ({
	setRelations,
	type,
}: {
	setRelations: (_: Relation[]) => void;
	type: RelationType;
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
		<CustomInput
			name={"Search"}
			value={searchText}
			setValue={onFind}
			width={"100%"}
			bottom={PADDING}
		/>
	);
};

export default RelationFinder;
