import React from 'react';
import LoginForm from '../components/LoginForm/LoginForm';

export default function LoginPage({ darkMode, onToggleDark }) {
  return <LoginForm darkMode={darkMode} onToggleDark={onToggleDark} />;
}
