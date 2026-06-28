'use client';

import { useState } from 'react';
import { LoginForm }    from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';

export function AuthTabs({ defaultTab = 'login' }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="space-y-5">

      {/* Tab switcher */}
      <div className="flex rounded-xl bg-[#f0f4fa] p-1 gap-1">
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              tab === t
                ? 'bg-white text-[#003087] shadow-sm border border-[#e2e8f4]'
                : 'text-[#7a8fb0] hover:text-[#3a4a6b]',
            )}
          >
            {t === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'login'    && <LoginForm />}
      {tab === 'register' && <RegisterForm />}

    </div>
  );
}

