import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const useFocus = (fn: () => void) => useFocusEffect(useCallback(fn, []));

export default useFocus;
