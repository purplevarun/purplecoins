import {
	FINANCE_ICON,
	PASSWORDS_ICON,
	SETTINGS_ICON,
	TODO_ICON,
} from "../config/icons.config";
import FinanceRouter from "../screens/finance/router/FinanceRouter";
import PasswordScreen from "../screens/main/PasswordScreen";
import TodoScreen from "../screens/main/TodoScreen";
import SettingsScreen from "../screens/main/SettingsScreen";

const BottomRoutes = {
	Finance: { page: FinanceRouter, icon: FINANCE_ICON },
	Passwords: { page: PasswordScreen, icon: PASSWORDS_ICON },
	Todo: { page: TodoScreen, icon: TODO_ICON },
	Settings: { page: SettingsScreen, icon: SETTINGS_ICON },
};

export default BottomRoutes;
