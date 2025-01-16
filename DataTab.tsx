import { FC } from "react";
import CustomText from "./CustomText";
import DataTabWrapper from "./DataTabWrapper";

type IDataTab = FC<{
	name: string;
	value: string | number | undefined;
}>;

const DataTab: IDataTab = ({ name, value }) => {
	if (value)
		return (
			<DataTabWrapper>
				<CustomText text={name} />
				<CustomText text={value === "null" ? "Not specified" : value} />
			</DataTabWrapper>
		);
};

export default DataTab;
