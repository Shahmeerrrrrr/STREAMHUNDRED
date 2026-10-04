import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, ...props }, ref) => {
    return (
      <label className={`box cursor-text hover:border-slate-400 ${className}`}>
        {icon}
        <input
          ref={ref}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          {...props}
        />
      </label>
    );
  }
);
Input.displayName = "Input";
