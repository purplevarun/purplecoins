import typographyConstants from "@/constants/typography";

import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import COLORS from "@/constants/colors";
import AnalysisScreen from "@/screens/AnalysisScreen";
import ArchivedRelationsScreen from "@/screens/ArchivedRelationsScreen";
import BudgetFormScreen from "@/screens/BudgetFormScreen";
import BudgetsScreen from "@/screens/BudgetsScreen";
import ExchangeRatesScreen from "@/screens/ExchangeRatesScreen";
import GlobalSearchScreen from "@/screens/GlobalSearchScreen";
import HomeScreen from "@/screens/HomeScreen";
import LinkedTransactionsScreen from "@/screens/LinkedTransactionsScreen";
import NoteFormScreen from "@/screens/NoteFormScreen";
import NotesScreen from "@/screens/NotesScreen";
import RelationFormScreen from "@/screens/RelationFormScreen";
import RelationsScreen from "@/screens/RelationsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import TodoFormScreen from "@/screens/TodoFormScreen";
import TodosScreen from "@/screens/TodosScreen";
import TransactionFormScreen from "@/screens/TransactionFormScreen";
import TransactionsScreen from "@/screens/TransactionsScreen";
import VaultFormScreen from "@/screens/VaultFormScreen";
import VaultScreen from "@/screens/VaultScreen";
import type RootStackParamList from "@/types/RootStackParamList";
import getRelationLabels from "@/utils/relation";
const { FONT_FAMILY } = typographyConstants;

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
			initialRouteName="Home"
			screenOptions={{
				contentStyle: { backgroundColor: COLORS.background },
				headerStyle: { backgroundColor: COLORS.backgroundElevated },
				headerTintColor: COLORS.text,
				headerShadowVisible: false,
				headerTitleStyle: {
					fontFamily: FONT_FAMILY,
					fontWeight: "800",
				},
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen
				component={HomeScreen}
				name="Home"
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
				component={ArchivedRelationsScreen}
				name="ArchivedRelations"
				options={{ title: "Archived relations" }}
			/>
			<Stack.Screen
				component={LinkedTransactionsScreen}
				name="LinkedTransactions"
				options={({ route }) => ({ title: route.params.entityName })}
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
				component={GlobalSearchScreen}
				name="GlobalSearch"
				options={({ route }) => ({
					title: `Search ${route.params.mode.charAt(0)}${route.params.mode
						.slice(1)
						.toLowerCase()}`,
				})}
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

export default AppNavigator;
