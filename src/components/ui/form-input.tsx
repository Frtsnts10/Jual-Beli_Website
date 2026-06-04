"use client";

import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  startContent?: React.ReactNode;
}

export function FormInput({ label, startContent, className, ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-3 w-full group">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">
        {label}
      </label>
      <div className="relative flex items-center">
        {startContent && (
          <div className="absolute left-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
            {startContent}
          </div>
        )}
        <input 
          {...props}
          className={`
            w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl 
            ${startContent ? 'pl-12' : 'px-6'} pr-6 
            text-sm font-bold text-white placeholder:text-slate-800
            focus:border-indigo-500 focus:bg-white/[0.05] focus:outline-none
            transition-all duration-300
            ${className}
          `}
        />
      </div>
    </div>
  );
}
