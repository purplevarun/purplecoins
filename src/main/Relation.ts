import RelationType from "./RelationType";

interface Relation {
	id: string;
	name: string;
	type: RelationType;
	total?: number;
}

export default Relation;
