'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
    const [firebaseServices, setFirebaseServices] = useState<{
        firebaseApp: ReturnType<typeof initializeFirebase>['firebaseApp'];
        auth: ReturnType<typeof initializeFirebase>['auth'];
        firestore: ReturnType<typeof initializeFirebase>['firestore'];
    } | null>(null);

    useEffect(() => {
        // Initialize Firebase on the client side, once per component mount.
        setFirebaseServices(initializeFirebase());
    }, []); // Empty dependency array ensures this runs only once on mount


    if (!firebaseServices) {
        // You can render a loader here if you want
        return null; 
    }


  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
