import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  User, signInWithPopup, GoogleAuthProvider, signOut
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
      padding: 16px;
    }
    .full-width-div {
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      border-bottom: 1px solid #000;
    }

    .full-width-div > div {
        text-align: center;
        flex-grow: 1;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      border: 1px solid #ccc;
      padding: 5px 10px;
      cursor: pointer;
    }
    
    .full-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
    }

    .login-button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
    }
  `;


  @property({ type: Boolean })
  showHideUser = false;
  @property({ type: Boolean })
  isAuthorized = true;
  @property({ type: Object })
  user: User | null = null;


  override render() {
    return this.user ? html`
      <div class="full-width-div">
        <img height="50" width="50" src="${this.user?.photoURL}"/>
        <h2>${this.user?.displayName}</h2>
        <button @click=${this._handleLogoutClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="12" viewBox="0 0 42 12">
            <text x="3" y="10" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:12.7px;font-family:'DIN Condensed';-inkscape-font-specification:'DIN Condensed, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;word-spacing:-0.0211667px;stroke-width:0;stroke-dasharray:none" fill="black">LOGOUT</text>
          </svg>
        </button>
      </div>  
      ${this.showHideUser  ? html`<pre>${JSON.stringify(this.user, null, 2)}</pre>` : ''}
      <slot></slot>
      ` : html`
        <div class="full-screen">
          <button @click=${this._handleLoginClick} class="login-button">Login</button>
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
      if (user && this.isAuthorized) {
        console.log('user is logging in');
        const userCredentials = await signInWithPopup(auth, new GoogleAuthProvider());
        this.user = userCredentials.user;
      } else if (user && !this.isAuthorized) {
        console.log('some other condition' , user,  this.isAuthorized) ;
        this._signMeOut()
      }
    })
  }

  private async _handleLoginClick(){
    this.isAuthorized = true;
    const userCredentials = await signInWithPopup(auth, new GoogleAuthProvider());
    this.user = userCredentials.user;
  }
    private _handleLogoutClick(_event: { altKey: any; }) {
      if (_event.altKey) {
        if (this.showHideUser ) {
          this.showHideUser = false;
        } else {
          this.showHideUser = true;
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
    this.isAuthorized = false;
    signOut(auth)
      .then(() => {
        this.user = null;
        this.isAuthorized = false;
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
