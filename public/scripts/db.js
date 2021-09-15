const createUser = (uid, data) => {
  db.collection("users")
    .doc(uid)
    .set({ uid, ...data }, { merge: true });
};
const formatUser = (user) => {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    provider: user.providerData[0].providerId,
    photoUrl: user.photoURL,
  };
};
