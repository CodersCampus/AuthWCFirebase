import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  User, signInWithPopup, GoogleAuthProvider, signOut
} from "firebase/auth";
import { auth } from './firebase/config';

const DEFAULT_MESSAGE = 'Please login. Or, if you are seeing this message on every secured page, you probably have popups blocked. You can unblock them for this entire site and then refresh the page.';
const SHOW_USER = 'Show Google User Data';
const HIDE_USER = 'Hide Google User Data';

@customElement('fbauth-element')
export class FBAuthElement extends LitElement {

  constructor() {
    super();
    this._initAuth();
    this.message = DEFAULT_MESSAGE;
  }
  static override styles = css`
    :host {
      padding: 16px;
    }
  `;

  @property()
  message = DEFAULT_MESSAGE;
  @property()
  buttonName = 'Login';
  @property()
  showHideUser = SHOW_USER;
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
      <hr>
      <button @click=${this._onClick} part="button">${this.buttonName}</button>
      <button @click=${this._onShowHideUser} part="button">${this.showHideUser}</button>
      ${this.showHideUser === HIDE_USER ? html`<br><br><img src="${this.user?.photoURL}"/><pre>${JSON.stringify(this.user, null, 2)}</pre>` : ''}
    `;
  }

  override updated(changedProperties: Map<PropertyKey, unknown>): void {
    changedProperties.forEach((_oldValue: any, propName: PropertyKey) => {
      if (propName === 'user') {
        this.dispatchEvent(new CustomEvent('user-changed', {
          detail: { newValue: this.user },
          bubbles: true,
          composed: true
        }));
      }
    });
  }


  private async _initAuth() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const currentUser = await auth.currentUser;
        this.user = currentUser;
        if (currentUser) {
          this.isAuthorized = true;         
        }
      } else {
        this.isAuthorized = false;
        const userCredentials = await signInWithPopup(auth, new GoogleAuthProvider());
        this.user = userCredentials.user;
        this.isAuthorized = true;
        this.message = this._greeting();
      }
    })
    this.message = this._greeting();
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

  private _onShowHideUser() {
    if (this.showHideUser === SHOW_USER) {
      this.showHideUser = HIDE_USER;
    } else {
      this.showHideUser = SHOW_USER;
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
