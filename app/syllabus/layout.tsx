import React from "react";

export default function SyllabusLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-start bg-gray-600 font-raleway">
      {children}
    </section>
  );
} 