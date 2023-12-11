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
    .full-width-div {
      width: 100%;      /* Full width of the viewport */
      height: 50px;     /* Height set to 50 pixels */
      display: flex; /* Enables Flexbox */
      justify-content: space-between; /* Spreads out the children */
      align-items: center; /* Aligns items vertically in the center */
      height: 50px; /* Your desired height */
      border-bottom: 1px solid #000;
    }

    .full-width-div > div {
        text-align: center; /* Center the text inside the middle div */
        flex-grow: 1; /* Allows the middle div to take up the available space */
    }

    button {
      display: flex; /* Enable Flexbox */
      justify-content: center; /* Center horizontally */
      align-items: center; /* Center vertically */
      border-radius: 10px; /* This value can be adjusted as per your design needs */
      border: 1px solid #ccc; /* Just an example border */
      padding: 5px 10px; /* Adjust padding as needed */
      cursor: pointer;
    }
    
    .full-screen {
      display: flex;
      justify-content: center; /* Center horizontally */
      align-items: center; /* Center vertically */
      height: 100vh; /* 100% of the viewport height */
      width: 100vw; /* 100% of the viewport width */
    }

    .login-button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
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
    return this.isAuthorized ? html`
      <div class="full-width-div">
        <img height="50" width="50" src="${this.user?.photoURL}"/>
        <h2>${this.user?.displayName}</h2>
        <button @click=${this._handleLoginClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="12" viewBox="0 0 42 12">
            <text x="3" y="10" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:12.7px;font-family:'DIN Condensed';-inkscape-font-specification:'DIN Condensed, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;word-spacing:-0.0211667px;stroke-width:0;stroke-dasharray:none" fill="black">LOGOUT</text>
          </svg>
        </button>
      </div>  
      ${this.showHideUser === HIDE_USER ? html`<pre>${JSON.stringify(this.user, null, 2)}</pre>` : ''}
      <slot></slot>
      ` : html`
        <div class="full-screen">
          <button class="login-button">Login</button>
        </div>
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
      }
    })
  }

  private _handleLoginClick(_event: { altKey: any; }) {
      // Check if the Alt key was pressed during the click
      if (_event.altKey) {
        if (this.showHideUser === SHOW_USER) {
          this.showHideUser = HIDE_USER;
        } else {
          this.showHideUser = SHOW_USER;
        }
      } else {
        if (this.isAuthorized) {
          this._signMeOut();
          this.isAuthorized = false;
        } else {
          this._initAuth();
        }
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

}

declare global {
  interface HTMLElementTagNameMap {
    'fbauth-element': FBAuthElement;
  }
}
