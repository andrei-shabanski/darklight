import * as firebase from 'firebase/app';

import { firebaseApp } from '../config';

class AuthenticationService {
  constructor() {
    this.auth = firebaseApp.auth();
  }

  async getCurrentUser() {
    return new Promise(resolve => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async createTemporaryUser() {
    let currentUser = await this.getCurrentUser();
    if (currentUser) {
      throw new Error('Log out before creating a temporary user');
    }

    await this.auth.signInAnonymously();
    currentUser = await this.getCurrentUser();
    return currentUser;
  }

  async signInViaGoogle() {
    const currentUser = await this.getCurrentUser();
    if (currentUser && !currentUser.isAnonymous) {
      throw new Error('Sign out before creating a temporary user');
    }

    const provider = new firebase.auth.GoogleAuthProvider();

    // TODO: need to handle a case when user has logged in the app before.
    // if (currentUser) {
    //   const result = await currentUser.linkWithPopup(provider);
    //   return result.user;
    // }

    const result = await this.auth.signInWithPopup(provider);
    return result.user;
  }

  async signOut() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new TypeError('No current user to sign out.');
    }

    await this.auth.signOut();
  }
}

const auth = new AuthenticationService();
window.auth = auth;
export default auth;
