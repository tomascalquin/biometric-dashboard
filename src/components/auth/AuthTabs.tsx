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
      <div className="flex rounded-xl bg-[#0f1923] p-1 gap-1">
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              tab === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200',
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
