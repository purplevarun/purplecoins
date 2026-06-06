import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "@/constants/colors";
import { AnalysisScreen } from "@/screens/AnalysisScreen";
import { BudgetFormScreen } from "@/screens/BudgetFormScreen";
import { BudgetsScreen } from "@/screens/BudgetsScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { ExchangeRatesScreen } from "@/screens/ExchangeRatesScreen";
import { NoteFormScreen } from "@/screens/NoteFormScreen";
import { NotesScreen } from "@/screens/NotesScreen";
import { RelationFormScreen } from "@/screens/RelationFormScreen";
import { RelationsScreen } from "@/screens/RelationsScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { TodoFormScreen } from "@/screens/TodoFormScreen";
import { TodosScreen } from "@/screens/TodosScreen";
import { TransactionFormScreen } from "@/screens/TransactionFormScreen";
import { TransactionsScreen } from "@/screens/TransactionsScreen";
import { VaultFormScreen } from "@/screens/VaultFormScreen";
import { VaultScreen } from "@/screens/VaultScreen";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { getRelationLabels } from "@/utils/relation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
	...DarkTheme,
	colors: {
		...DarkTheme.colors,
		background: COLORS.background,
		card: COLORS.backgroundElevated,
		border: COLORS.border,
		primary: COLORS.primary,
		text: COLORS.text,
	},
};

const AppNavigator = (): React.JSX.Element => (
	<NavigationContainer theme={navigationTheme}>
		<Stack.Navigator
			initialRouteName="Dashboard"
			screenOptions={{
				contentStyle: { backgroundColor: COLORS.background },
				headerStyle: { backgroundColor: COLORS.backgroundElevated },
				headerTintColor: COLORS.text,
				headerShadowVisible: false,
				headerTitleStyle: { fontWeight: "800" },
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen
				component={DashboardScreen}
				name="Dashboard"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				component={TransactionsScreen}
				name="Transactions"
				options={{ title: "Transactions" }}
			/>
			<Stack.Screen
				component={TransactionFormScreen}
				name="TransactionForm"
				options={{ title: "Transaction" }}
			/>
			<Stack.Screen
				component={RelationsScreen}
				name="Relations"
				options={({ route }) => ({
					title: getRelationLabels(route.params.kind).title,
				})}
			/>
			<Stack.Screen
				component={RelationFormScreen}
				name="RelationForm"
				options={{ title: "Details" }}
			/>
			<Stack.Screen
				component={BudgetsScreen}
				name="Budgets"
				options={{ title: "Budgets" }}
			/>
			<Stack.Screen
				component={BudgetFormScreen}
				name="BudgetForm"
				options={{ title: "Budget" }}
			/>
			<Stack.Screen
				component={AnalysisScreen}
				name="Analysis"
				options={{ title: "Analysis" }}
			/>
			<Stack.Screen
				component={ExchangeRatesScreen}
				name="ExchangeRates"
				options={{ title: "Exchange rates" }}
			/>
			<Stack.Screen
				component={NotesScreen}
				name="Notes"
				options={{ title: "Notes" }}
			/>
			<Stack.Screen
				component={NoteFormScreen}
				name="NoteForm"
				options={{ title: "Note" }}
			/>
			<Stack.Screen
				component={TodosScreen}
				name="Todos"
				options={{ title: "Todos" }}
			/>
			<Stack.Screen
				component={TodoFormScreen}
				name="TodoForm"
				options={{ title: "Todo" }}
			/>
			<Stack.Screen
				component={VaultScreen}
				name="Vault"
				options={({ route }) => ({
					title:
						route.params.kind === "IDENTITY"
							? "Identity"
							: `${route.params.kind.charAt(0)}${route.params.kind
									.slice(1)
									.toLowerCase()}s`,
				})}
			/>
			<Stack.Screen
				component={VaultFormScreen}
				name="VaultForm"
				options={{ title: "Vault entry" }}
			/>
			<Stack.Screen
				component={SettingsScreen}
				name="Settings"
				options={{ title: "Settings & backup" }}
			/>
		</Stack.Navigator>
	</NavigationContainer>
);

export { AppNavigator };
