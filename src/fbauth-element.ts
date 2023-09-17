/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  User, signInWithPopup, GoogleAuthProvider, signOut
} from "firebase/auth";
import { auth } from './firebase/config';

const DEFAULT_MESSAGE = 'Please login. Or, if you are seeing this message on every secured page, you probably have popups blocked. You can unblock them for this entire site and then refresh the page.';


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
  message = DEFAULT_MESSAGE;
  @property()
  buttonName = 'Login';
  @property({ type: Boolean })
  isAuthorized = false;
  @property({ type: Object })
  user: User | null = null;


  override render() {
    this.buttonName = this._buttonMessage();
    return html`
      <div>${this._greeting()}</div>
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

  private _buttonMessage() {
    if (this.isAuthorized) { return 'Logout' }
    return 'Login';
  }

  private _onClick() {
    if (this.isAuthorized) {
      this._signMeOut();
      this.isAuthorized = false;
    } else {
      this._initAuth();
    }
  }

  private async _signMeOut() {
    signOut(auth)
      .then(() => {
        this.user = null;
        this.isAuthorized = false;
        this.message = DEFAULT_MESSAGE;
      })
      .catch((error) => {
        alert(error);
      });
  };

  private _greeting() {
    if (this.user) { return 'Welcome, ' + this.user.displayName }
    return DEFAULT_MESSAGE;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fbauth-element': FBAuthElement;
  }
}
