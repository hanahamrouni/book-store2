import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import getBaseUrl from "../utils/baseURL";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvide = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // register a user
  const registerUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("تم تسجيل المستخدم بنجاح في Firebase:", user.uid);

      const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل تسجيل المستخدم في الـ Backend!");
      }

      console.log("تم تسجيل المستخدم بنجاح في MongoDB!");
      return user;
    } catch (error) {
      console.error("خطأ أثناء تسجيل المستخدم:", error.message);
      throw error;
    }
  };

  // login the user
  const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // sing up with google
  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  // logout the user
  const logout = () => {
    return signOut(auth);
  };

  // manage user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        const { email, displayName, photoURL } = user;
        const userData = {
          email,
          username: displayName,
          photo: photoURL,
        };
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    registerUser,
    loginUser,
    signInWithGoogle,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
