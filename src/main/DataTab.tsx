import { FC } from "react";
import { PRIMARY_COLOR, RED_COLOR } from "./colors.config";
import CustomText from "./CustomText";
import DataTabWrapper from "./DataTabWrapper";

type IDataTab = FC<{
	name: string;
	value: string | number | undefined;
	debit?: boolean;
}>;

const DataTab: IDataTab = ({ name, value, debit }) => {
	if (value)
		return (
			<DataTabWrapper>
				<CustomText text={name} />
				<CustomText
					text={value === "null" ? "Not specified" : value}
					color={debit ? RED_COLOR : PRIMARY_COLOR}
				/>
			</DataTabWrapper>
		);
};

export default DataTab;
