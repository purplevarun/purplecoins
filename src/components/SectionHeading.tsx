import CustomText from "@/components/CustomText";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";

type SectionHeadingProps = Readonly<{
	title: string;
	subtitle?: string;
}>;

const SectionHeading = ({
	title,
	subtitle,
}: SectionHeadingProps): React.JSX.Element => (
	<View style={styles.container}>
		<CustomText style={styles.title}>{title}</CustomText>
		{subtitle ? (
			<CustomText style={styles.subtitle}>{subtitle}</CustomText>
		) : null}
	</View>
);

const styles = StyleSheet.create({
	container: {
		gap: 3,
	},
	title: {
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "900",
		letterSpacing: -0.2,
	},
	subtitle: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 18,
	},
});

export default SectionHeading;
