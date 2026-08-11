import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  collection
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const FarmContext = createContext(null);
const STORAGE_KEY = 'farmfleet:selectedFarm';

export function FarmProvider({ children }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(localStorage.getItem(STORAGE_KEY) || '');
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !db) {
      setMemberships([]);
      setFarms([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const membershipQuery = query(collection(db, 'memberships'), where('userId', '==', user.uid));
    return onSnapshot(
      membershipQuery,
      async (snapshot) => {
        try {
          const memberRows = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }));
          const farmRows = await Promise.all(
            memberRows.map(async (membership) => {
              const farmSnapshot = await getDoc(doc(db, 'farms', membership.farmId));
              return farmSnapshot.exists()
                ? { id: farmSnapshot.id, ...farmSnapshot.data(), role: membership.role }
                : null;
            })
          );
          const validFarms = farmRows.filter(Boolean);
          setMemberships(memberRows);
          setFarms(validFarms);
          setError('');

          const storedStillExists = validFarms.some((farm) => farm.id === selectedFarmId);
          if (!storedStillExists && validFarms[0]) {
            setSelectedFarmId(validFarms[0].id);
            localStorage.setItem(STORAGE_KEY, validFarms[0].id);
          }
        } catch (loadError) {
          setError(loadError.message);
        } finally {
          setLoading(false);
        }
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, [user, selectedFarmId]);

  const selectedFarm = farms.find((farm) => farm.id === selectedFarmId) || null;
  const membership = memberships.find((item) => item.farmId === selectedFarmId) || null;

  const value = useMemo(
    () => ({
      farms,
      memberships,
      selectedFarm,
      selectedFarmId,
      membership,
      role: membership?.role || selectedFarm?.role || 'viewer',
      loading,
      error,
      selectFarm(farmId) {
        setSelectedFarmId(farmId);
        localStorage.setItem(STORAGE_KEY, farmId);
      },
      async createFarm({ name, type, location }) {
        if (!user) throw new Error('Authentication required.');
        const farm = await api.post('/api/v1/farms', { name, type, location });
        setSelectedFarmId(farm.id);
        localStorage.setItem(STORAGE_KEY, farm.id);
        return farm.id;
      }
    }),
    [farms, memberships, selectedFarm, selectedFarmId, membership, loading, error, user]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used inside FarmProvider.');
  return context;
}
