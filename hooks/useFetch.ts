import {
  collection,
  getDocs,
  onSnapshot,
  query,
  QueryConstraint,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

interface UseFetchResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch data from a Firestore collection.
 *
 * @param collectionName The name of the Firestore collection to fetch from.
 * @param constraints Optional array of QueryConstraint (e.g., where(), orderBy(), limit()) to filter/sort results.
 * @param useRealtime Updates data in real-time if true. Defaults to false (single fetch).
 * @returns Object containing data, loading state, error, and refetch function.
 */
const useFetch = <T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  useRealtime: boolean = false,
): UseFetchResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0); // Used to manually refetch

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, ...constraints);

        if (useRealtime) {
          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const fetchedData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as T[];
              setData(fetchedData);
              setLoading(false);
            },
            (err) => {
              console.error(
                `Error fetching real-time data from ${collectionName}:`,
                err,
              );
              setError("Failed to fetch data.");
              setLoading(false);
            },
          );
        } else {
          const snapshot = await getDocs(q);
          const fetchedData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(fetchedData);
          setLoading(false);
        }
      } catch (err: any) {
        console.error(`Error fetching data from ${collectionName}:`, err);
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [collectionName, trigger, ...constraints]);

  // Function to manually re-trigger the fetch (useful for non-realtime)
  const refetch = () => {
    setTrigger((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
};

export default useFetch;
