"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  // Position is computed once when opening — no re-render needed
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click — stable ref callback pattern avoids stale closure
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target) ?? false;
      const inDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
        setSearch("");
      }
    };

    // Delay adding listener by one frame so the opening click isn't caught
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleOutside);
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [isOpen]);

  // Close on page scroll or window resize — but NOT when scrolling inside the dropdown
  useEffect(() => {
    if (!isOpen) return;
    const closeOnScroll = (e: Event) => {
      // If the scroll is happening inside the dropdown panel, don't close
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
      setSearch("");
    };
    const closeOnResize = () => {
      setIsOpen(false);
      setSearch("");
    };
    window.addEventListener("scroll", closeOnScroll, { passive: true, capture: true });
    window.addEventListener("resize", closeOnResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", closeOnScroll, { capture: true });
      window.removeEventListener("resize", closeOnResize);
    };
  }, [isOpen]);

  // Open/close toggle: compute position at click time (no effect needed)
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      // Snapshot position right now — no async setState
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen((prev) => !prev);
    if (isOpen) setSearch("");
  };

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearch("");
  };

  // Compute portal dropdown style from snapshotted rect
  const dropdownStyle = (): React.CSSProperties => {
    if (!rect) return {};
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const PANEL_MAX_H = 256;
    const goAbove = spaceBelow < PANEL_MAX_H && rect.top > PANEL_MAX_H;

    return {
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(goAbove
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    };
  };

  const portal =
    mounted && isOpen
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle()}
            className="rounded-2xl border border-card-border bg-background p-2 shadow-2xl max-h-64 overflow-hidden flex flex-col animate-dropdown-in"
          >
            {searchable && (
              <div className="relative pb-1.5 border-b border-card-border/40 mb-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-3.5 w-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-card-border bg-card-bg/60 py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary/80 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            <div className="overflow-y-auto flex flex-col gap-0.5">
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    // preventDefault prevents blur on search input but still fires click
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between gap-2
                      ${value === opt.value
                        ? "bg-primary text-white font-bold"
                        : "text-foreground hover:bg-primary-glow hover:text-primary"
                      }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {value === opt.value && <FaCheck className="h-3 w-3 shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-muted">
                  Tidak ditemukan.
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full h-[54px] flex items-center justify-between rounded-2xl border border-card-border bg-card-bg/60 px-4 text-sm font-semibold text-foreground transition-all duration-200 shadow-xs cursor-pointer select-none text-left
          ${isOpen ? "border-primary/50 bg-card-bg/80" : "hover:border-primary/40"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`truncate ${!value ? "text-muted" : ""}`}>
          {selectedLabel}
        </span>
        <FaChevronDown
          className={`h-3 w-3 text-muted ml-2 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      {portal}
    </div>
  );
}
