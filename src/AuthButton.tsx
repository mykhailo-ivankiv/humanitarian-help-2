import React, { useState } from "react";
import { signInWithGoogle } from './auth';

import { ReactComponent as GoogleIcon } from './img/google.svg';

import './AuthButton.css';
import BEM from './helpers/BEM';
const b = BEM('AuthButton');

const AuthButton = () => {
    return <div>
        <button className={b()} onClick={signInWithGoogle}>
          <GoogleIcon className={b("icon")} />
          Login with Google
        </button>
    </div>
}

export default AuthButton;
