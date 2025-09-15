"use client";
import { forwardRef } from "react";
import Icon from "./ui/Icon";
import { cn } from "../lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Base input styles for consistency
const inputStyles = "w-full rounded border border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, placeholder = "Search...", className }, ref) => (
    <div className={cn("relative", className)}>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search components"
        className={inputStyles}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
        <Icon name="search" size={16} className="text-gray-400" />
      </div>
    </div>
  )
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
