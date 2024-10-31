import uuid from "react-native-uuid";

export const generateUUID = () => uuid.v4().toString();

export const objectify = (data: any) => JSON.stringify(data, null, 2);
