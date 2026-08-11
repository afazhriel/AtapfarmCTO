import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFarm } from '../contexts/FarmContext';

export function useFarmCollection(collectionName) {
  const { selectedFarmId } = useFarm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(selectedFarmId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFarmId || !db) {
      setData([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    return onSnapshot(
      collection(db, 'farms', selectedFarmId, collectionName),
      (snapshot) => {
        setData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setError('');
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, [selectedFarmId, collectionName]);

  return { data, loading, error };
}
