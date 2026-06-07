import "react-native-gesture-handler";

import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { LoadingScreen } from "@/components/LoadingScreen";
import { APP_FONTS } from "@/constants/typography";
import { initializeDatabase } from "@/database/initializeDatabase";
import { AppNavigator } from "@/navigation/AppNavigator";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import type { DatabaseState } from "@/types/DatabaseState";

const INITIAL_DATABASE_STATE: DatabaseState = {
	database: null,
	error: null,
};

const App = (): React.JSX.Element => {
	const [fontsLoaded] = useFonts(APP_FONTS);
	const [databaseState, setDatabaseState] = useState<DatabaseState>(
		INITIAL_DATABASE_STATE,
	);

	useEffect(() => {
		const getInitializedDatabase = async (): Promise<void> => {
			try {
				const database = await initializeDatabase();
				setDatabaseState({ database, error: null });
			} catch (error: unknown) {
				const message =
					error instanceof Error
						? error.message
						: "Unable to initialize the database.";
				setDatabaseState({ database: null, error: message });
			}
		};

		void getInitializedDatabase();
	}, []);

	if (!fontsLoaded) {
		return <View style={styles.container} />;
	}

	if (!databaseState.database) {
		return <LoadingScreen error={databaseState.error} />;
	}

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<DatabaseProvider database={databaseState.database}>
				<AppNavigator />
			</DatabaseProvider>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#080B14",
	},
});

export { App };
