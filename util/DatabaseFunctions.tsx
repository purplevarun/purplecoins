import { useQuery, useRealm } from "@realm/react";
import { useMemo } from "react";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";
import TripModel from "../models/TripModel";
import InvestmentModel from "../models/InvestmentModel";
import SourceModel from "../models/SourceModel";
import UserModel from "../models/UserModel";
import { generateUUID } from "./HelperFunctions";

const useDatabase = () => {
	const realm = useRealm();
	const users = useQuery(UserModel);
	const user = {
		exists: users !== null && !users.isEmpty(),
		id: users[0]?.id,
		name: users[0]?.name,
	};
	const transactions = useQuery(TransactionModel).sorted("date", true);
	const categoryModels = useQuery(CategoryModel);
	const trips = useQuery(TripModel).sorted("startDate", true);
	const investments = useQuery(InvestmentModel).sorted("currentAmount", true);
	const sources = useQuery(SourceModel).sorted("amount", true);
	const categories = useMemo(() => {
		const categoryUsageMap = new Map();
		transactions.forEach((transaction) => {
			transaction.categories?.forEach((categoryId) => {
				categoryUsageMap.set(
					categoryId,
					(categoryUsageMap.get(categoryId) || 0) + 1,
				);
			});
		});
		return [...categoryModels].sort((a, b) => {
			const countA = categoryUsageMap.get(a.id) || 0;
			const countB = categoryUsageMap.get(b.id) || 0;
			return countB - countA;
		});
	}, [categoryModels, transactions]);

	//

	const createSource = (name: string, initialAmount: string) => {
		try {
			realm.write(() => {
				realm.create(SourceModel, {
					id: generateUUID(),
					name,
					initialAmount: parseInt(initialAmount),
					amount: parseInt(initialAmount),
				});
			});
		} catch (error) {
			console.error(error);
		}
	};
	const createUser = (userId: string, userName: string) => {
		try {
			realm.write(() => {
				realm.create(UserModel, {
					id: userId,
					name: userName,
				});
			});
		} catch (error) {
			console.error(error);
		}
	};
	//

	return {
		transactions,
		categories,
		sources,
		investments,
		trips,
		users,
		user,
		createSource,
		createUser,
	};
};
export default useDatabase;
