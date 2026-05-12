'use client';

import { useState } from 'react';
import { LoginForm }    from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';

export function AuthTabs() {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            )}
          >
            {t === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'login'    && <LoginForm />}
      {tab === 'register' && <RegisterForm />}

    </div>
  );
}
