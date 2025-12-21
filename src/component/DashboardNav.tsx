'use client';
import React from 'react';
import Link from 'next/link';
import Header from './Header'; // Importando o Header

const DashboardNav: React.FC = () => {
  return (
    <>
      <Header />
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4 mt-[var(--header-height,50px)]">
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          <Link href="/dashboard" className="text-white dark:text-gray-100 text-sm uppercase hidden lg:inline-block font-semibold">
            Dashboard
          </Link>
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;