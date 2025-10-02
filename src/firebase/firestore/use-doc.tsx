'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  getDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

export interface UseDocOptions {
  listen?: boolean;
}

/**
 * React hook to subscribe to a single Firestore document.
 * Handles nullable references safely.
 *
 * IMPORTANT: You MUST memoize the 'docRef' passed to this hook using 'useMemo' or 'useMemoFirebase'.
 * Failure to do so will result in infinite re-renders.
 *
 * @template T Type of the document data.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef - The memoized Firestore DocumentReference.
 * @param {UseDocOptions} options - Options for the hook, like whether to listen for real-time updates.
 * @returns {UseDocResult<T>} Object with data, isLoading, and error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
  options: UseDocOptions = { listen: true }
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the docRef is not provided, we are not ready to fetch.
    if (!memoizedDocRef) {
      setIsLoading(false);
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);

    if (options.listen) {
      const unsubscribe = onSnapshot(
        memoizedDocRef,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          if (snapshot.exists()) {
            setData({ ...(snapshot.data() as T), id: snapshot.id });
          } else {
            setData(null);
          }
          setError(null);
          setIsLoading(false);
        },
        (err: FirestoreError) => {
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: memoizedDocRef.path,
          });
          setError(contextualError);
          setData(null);
          setIsLoading(false);
          errorEmitter.emit('permission-error', contextualError);
        }
      );
      return () => unsubscribe();
    } else {
      getDoc(memoizedDocRef).then(snapshot => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      }).catch((err: FirestoreError) => {
         const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: memoizedDocRef.path,
          });
          setError(contextualError);
          setData(null);
          setIsLoading(false);
          errorEmitter.emit('permission-error', contextualError);
      });
    }

  }, [memoizedDocRef, options.listen]);

  return { data, isLoading, error };
}
