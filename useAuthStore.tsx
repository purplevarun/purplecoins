import { create } from "zustand";

export enum Mode {
	null,
	sign_up,
	sign_in,
}

interface AuthState {
	username: string;
	password: string;
	confirmPassword: string;
	error: string;
	loading: boolean;
	mode: Mode;
	setUsername: (username: string) => void;
	setPassword: (password: string) => void;
	setConfirmPassword: (confirmPassword: string) => void;
	setError: (error: string) => void;
	setLoading: (loading: boolean) => void;
	setMode: (mode: Mode) => void;
	clear: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
	username: "",
	password: "",
	confirmPassword: "",
	error: "",
	loading: false,
	mode: Mode.null,
	setUsername: (username) => set({ username }),
	setPassword: (password) => set({ password }),
	setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
	setError: (error) => set({ error }),
	setLoading: (loading) => set({ loading }),
	setMode: (mode) => set({ mode }),
	clear: () =>
		set({
			username: "",
			password: "",
			confirmPassword: "",
			error: "",
			loading: false,
			mode: Mode.null,
		}),
}));

export default useAuthStore;
