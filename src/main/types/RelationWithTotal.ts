import RelationType from "../constants/enums/RelationType";

interface RelationWithTotal {
	id: string;
	name: string;
	type: RelationType;
	total: number;
}

export default RelationWithTotal