import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { NoiseOverlay } from './components/ui/NoiseOverlay';
import { PillNav } from './components/ui/PillNav';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Onboarding } from './pages/Onboarding';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { REVEAL_VARIANTS } from './lib/utils';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const location = useLocation();
  const [user, setUser] = React.useState<any>(null);
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch user profile from Firestore
        try {
          const docRef = doc(db, 'user_profiles', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ id: fbUser.uid, ...docSnap.data() });
          } else {
            setUser(null); // Need to complete onboarding
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'user_profiles');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOnboardingComplete = async (profileData: any) => {
    if (!firebaseUser) return;
    try {
      const docRef = doc(db, 'user_profiles', firebaseUser.uid);
      await setDoc(docRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setUser({ id: firebaseUser.uid, ...profileData });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'user_profiles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="font-anton text-forest text-4xl animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-md bg-sage rounded-huge p-12 text-center shadow-forest border border-forest/5">
          <div className="font-anton text-6xl text-forest mb-2 tracking-tighter">CALORIQ</div>
          <p className="text-[10px] font-bold tracking-widest text-forest/60 mb-12 uppercase">AI Nutrition Coach</p>
          <button 
            onClick={login}
            className="w-full py-4 bg-forest text-cream rounded-full font-bold text-[10px] tracking-widest uppercase hover:scale-105 transition-transform"
          >
            CONTINUE WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-cream text-forest font-inter">
      <NoiseOverlay />
      {user && <PillNav />}
      
      <main className="max-w-screen-xl mx-auto px-6 pt-24">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Routes location={location}>
              <Route 
                path="/" 
                element={user ? <Navigate to="/dashboard" /> : <Onboarding onComplete={handleOnboardingComplete} />} 
              />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
              <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/" />} />
              <Route path="/history" element={user ? <History user={user} /> : <Navigate to="/" />} />
              <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
