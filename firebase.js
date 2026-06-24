const firebaseConfig = {
  apiKey: "AIzaSyBXWOw-z9mXrjAQR7zgNex4vHFw4J3KFnU",
  authDomain: "little-greenhouse.firebaseapp.com",
  projectId: "little-greenhouse",
  storageBucket: "little-greenhouse.firebasestorage.app",
  messagingSenderId: "124331435636",
  appId: "1:124331435636:web:dc1fb84b0e65573ea61321"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const FirebaseSystem = {
  getUserId() {
    let uid = localStorage.getItem('greenhouse_uid');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('greenhouse_uid', uid);
    }
    return uid;
  },

  async save(data) {
    try {
      const uid = this.getUserId();
      await db.collection('saves').doc(uid).set(data);
      console.log('클라우드 저장 완료');
    } catch (e) {
      console.error('클라우드 저장 실패:', e);
    }
  },

  async load() {
    try {
      const uid = this.getUserId();
      const doc = await db.collection('saves').doc(uid).get();
      if (doc.exists) {
        console.log('클라우드 불러오기 완료');
        return doc.data();
      }
    } catch (e) {
      console.error('클라우드 불러오기 실패:', e);
    }
    return null;
  }
};