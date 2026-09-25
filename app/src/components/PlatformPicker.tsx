import SelectField from "@/components/SelectField";
import type PlatformPickerProps from "@/types/PlatformPickerProps";
import React from "react";
import { View } from "react-native";

const PlatformPicker = ({
	platforms,
	value,
	onValueChange,
	placeholder,
}: PlatformPickerProps): React.JSX.Element => {
	return (
		<View>
			<SelectField
				label="Platform"
				isOptional
				value={value ?? ""}
				onChange={(id) => onValueChange(id || null)}
				placeholder={placeholder ?? "Select platform"}
				options={platforms
					.filter(
						(platform) =>
							!platform.archived || platform.id === value,
					)
					.map((platform) => ({
						label: platform.name,
						value: platform.id,
					}))}
			/>
		</View>
	);
};

export default PlatformPicker;
