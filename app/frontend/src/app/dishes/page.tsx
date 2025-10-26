'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DishesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to integrated delivery page
    router.push('/eat/delivery');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cargando platos...</h1>
        <p className="text-gray-600 mt-2">Te estamos llevando a nuestro catálogo de delivery</p>
      </div>
    </div>
  );
}
