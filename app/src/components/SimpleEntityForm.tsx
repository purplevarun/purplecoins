import AppButton from "@/components/AppButton";
import Notice from "@/components/Notice";
import TextField from "@/components/TextField";
import styleConstants from "@/constants/styleConstants";
import type SimpleEntityFormProps from "@/types/SimpleEntityFormProps";
import getErrorMessage from "@/utils/error";
import React, { useState } from "react";
import { View } from "react-native";

const { SPACING } = styleConstants;

const SimpleEntityForm = ({
	onSave,
}: SimpleEntityFormProps): React.JSX.Element => {
	const [name, setName] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	return (
		<View style={{ gap: SPACING.S16 }}>
			<TextField
				label="Name"
				value={name}
				onChangeText={setName}
				placeholder="Name"
			/>
			{error ? <Notice message={error} tone="danger" /> : null}
			<AppButton
				label="Save"
				isLoading={isSaving}
				onPress={async () => {
					if (isSaving) return;
					setIsSaving(true);
					setError("");
					try {
						await onSave(name);
					} catch (caughtError: unknown) {
						setError(getErrorMessage(caughtError));
					} finally {
						setIsSaving(false);
					}
				}}
			/>
		</View>
	);
};

export default SimpleEntityForm;
