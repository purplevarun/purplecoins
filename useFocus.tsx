import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const useFocus = (fn: () => void, params?: any[]) =>
	useFocusEffect(useCallback(fn, params ?? []));

export default useFocus;
