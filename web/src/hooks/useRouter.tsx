import type { Route } from "@/hooks/router";
import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";

type RouterContextValue = {
	route: Route;
	navigate: (route: Route) => void;
	back: () => void;
};

const RouterContext = createContext<RouterContextValue>({
	route: { page: "dashboard" },
	navigate: () => {},
	back: () => {},
});

export const RouterProvider = ({ children }: { children: ReactNode }) => {
	const [stack, setStack] = useState<Route[]>([{ page: "dashboard" }]);

	const navigate = useCallback((route: Route) => {
		setStack((s) => [...s, route]);
	}, []);

	const back = useCallback(() => {
		setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
	}, []);

	const route = stack[stack.length - 1];

	return (
		<RouterContext.Provider value={{ route, navigate, back }}>
			{children}
		</RouterContext.Provider>
	);
};

export const useRouter = () => useContext(RouterContext);
