'use client';
import React, { useState } from 'react';
import styles from './login.module.css';
import { loginUser, registerUser } from '../actions/auth';
import { useActionState } from 'react';
import Image from 'next/image';

function SubmitButton({ isLogin, pending }: { isLogin: boolean; pending: boolean }) {
  return (
    <button type="submit" className={styles.submitBtn} disabled={pending} aria-disabled={pending}>
      {pending ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
    </button>
  );
}

export default function LoginForm({ logoUrl }: { logoUrl?: string | null }) {
  const [isLoginFlow, setIsLoginFlow] = useState(true);
  const [loginState, loginAction, loginPending] = useActionState(loginUser, null);
  const [registerState, registerAction, registerPending] = useActionState(registerUser, null);

  const activeState = isLoginFlow ? loginState : registerState;
  const pending = isLoginFlow ? loginPending : registerPending;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Image src={logoUrl || "/logo.svg"} alt="Logo" width={240} height={80} style={{ objectFit: 'contain' }} priority />
        </div>
        <h1 className={styles.title}>{isLoginFlow ? 'Welcome Back' : 'Join Kookies Ventures'}</h1>
        <p className={styles.subtitle}>
          {isLoginFlow ? 'Sign in to your account' : 'Sign up for a new account'}
        </p>

        {activeState?.error && <div className={styles.error}>{activeState.error}</div>}

        <form action={isLoginFlow ? loginAction : registerAction} className={styles.form}>
          {!isLoginFlow && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" className={styles.input} />
              </div>

            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" className={styles.input} required autoComplete="email" />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className={styles.input} required autoComplete="current-password" />
          </div>

          <SubmitButton isLogin={isLoginFlow} pending={pending} />
        </form>

        <div className={styles.toggleFooter}>
          {isLoginFlow ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLoginFlow(!isLoginFlow)} className={styles.toggleBtn}>
            {isLoginFlow ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
