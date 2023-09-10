/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  User, signInWithPopup, GoogleAuthProvider, signOut
  //   onAuthStateChanged, 
} from "firebase/auth";
import { auth } from './firebase/config';

@customElement('fbauth-element')
export class FBAuthElement extends LitElement {
  constructor() {
    super();
    this._initAuth();
  }
  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 800px;
    }
  `;

  @property()
  message = 'You are not authorized, please login';
  @property()
  buttonName = 'Logout';
  @property({ type: Boolean })
  isAuthorized = false;
  @property({ type: Object })
  user: User | null = null;


  override render() {
    return html`
      <div>${this._greeting()}!</div>
      <hr>
      ${this.isAuthorized ? html`<slot></slot>` : ''}
      <button @click=${this._onClick} part="button">${this.buttonName}</button>
    `;
  }

  private async _initAuth() {
    if (!this.isAuthorized) {
      const userCredentials = await signInWithPopup(auth, new GoogleAuthProvider());
      this.user = userCredentials.user;
      this.isAuthorized = true;
      this.message = this._greeting();
    }
  }

  private _onClick() {
    if(this.isAuthorized){
    this._signMeOut();
    this.buttonName = 'Login';
    this.isAuthorized = false;
    } else {  
      this._initAuth();
      this.buttonName = 'Logout';
    }
  } 

  private async _signMeOut() {
    signOut(auth)
      .then(() => {
        this.user = null;
        this.isAuthorized = false;
        this.message = 'You are not authorized please login';
        this.buttonName = 'Login';
        //   notLoggedIn.style.display = "block"; // Show login button
        //   loggedIn.style.display = "none"; // Hide logout button
      })
      .catch((error) => {
        alert(error);
      });
  };

  private _greeting() {
    if (this.user) { return 'Welcome, ' + this.user.displayName }
    return  'You are not authorized please login';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fbauth-element': FBAuthElement;
  }
}
