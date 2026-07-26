import { createNavigationContainerRef } from "@react-navigation/native";

import type RootStackParamList from "@/types/RootStackParamList";

const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default navigationRef;
