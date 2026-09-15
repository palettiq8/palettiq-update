"use client";

import { Check, ChevronRight } from "lucide-react";
import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  Fragment,
  cloneElement,
  isValidElement,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { IconType } from "react-icons";

export interface ActionMenuItem {
  type?: "action";
  label: string;
  icon?: IconType;
  children?: MenuSection[];
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

export interface CheckboxMenuItem {
  type: "checkbox";
  label: string;
  icon?: IconType;
  endContent?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export type MenuItem = ActionMenuItem | CheckboxMenuItem;

export interface RadioOption {
  label: string;
  value: string;
  icon?: IconType;
  endContent?: React.ReactNode;
  disabled?: boolean;
}

export interface ItemSection {
  type?: "group";
  title?: string;
  items: MenuItem[];
}

export interface RadioSection {
  type: "radio";
  title?: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: RadioOption[];
}

export type MenuSection = ItemSection | RadioSection;

interface Coords {
  top: number;
  left: number;
  vPosition: "top" | "bottom";
  hPosition: "left" | "right";
}

interface MenuRootContextValue {
  register: (el: HTMLElement) => void;
  unregister: (el: HTMLElement) => void;
}

const MenuRootContext = createContext<MenuRootContextValue | null>(null);

function computeCoords(
  triggerRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
): Coords {
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const vPosition: "top" | "bottom" =
    spaceBelow < menuHeight && spaceAbove > spaceBelow ? "top" : "bottom";

  const spaceRight = window.innerWidth - triggerRect.left;
  const hPosition: "left" | "right" = spaceRight < menuWidth ? "right" : "left";

  const top =
    vPosition === "bottom"
      ? triggerRect.bottom + 4
      : triggerRect.top - menuHeight - 4;
  const left =
    hPosition === "left" ? triggerRect.left : triggerRect.right - menuWidth;

  return { top, left, vPosition, hPosition };
}

function getTransform(coords: Coords | null, ready: boolean) {
  if (!ready || !coords) {
    const y =
      coords?.vPosition === "top" ? "translateY(4px)" : "translateY(-4px)";
    return `scale(0.95) ${y}`;
  }
  return "scale(1) translateY(0px)";
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 select-none">
      {title}
    </div>
  );
}

function SectionDivider() {
  return <div className="my-1.5 h-px bg-zinc-200 dark:bg-zinc-700" />;
}

function SectionList({
  sections,
  closeMenu,
  forcedHPosition,
}: {
  sections: MenuSection[];
  closeMenu: () => void;
  forcedHPosition?: "left" | "right";
}) {
  return (
    <>
      {sections.map((section, sIndex) => (
        <Fragment key={sIndex}>
          {sIndex > 0 && <SectionDivider />}
          {section.title && <SectionTitle title={section.title} />}

          {section.type === "radio"
            ? section.options.map((option, oIndex) => {
                const isSelected = option.value === section.value;
                return (
                  <RadioItemRow
                    key={oIndex}
                    option={option}
                    selected={isSelected}
                    onSelect={() => {
                      section.onValueChange(isSelected ? null : option.value);
                    }}
                  />
                );
              })
            : section.items.map((item, iIndex) =>
                item.type === "checkbox" ? (
                  <CheckboxItemRow key={iIndex} item={item} />
                ) : (
                  <MenuItemRow
                    key={iIndex}
                    item={item}
                    closeMenu={closeMenu}
                    forcedHPosition={forcedHPosition}
                  />
                ),
              )}
        </Fragment>
      ))}
    </>
  );
}

function CheckboxItemRow({ item }: { item: CheckboxMenuItem }) {
  const Icon = item.icon;

  return (
    <button
      disabled={item.disabled}
      onClick={() => item.onCheckedChange(!item.checked)}
      className="relative flex w-full items-center justify-between gap-2 rounded-lg py-1.5 pl-8 pr-2 text-sm font-medium text-zinc-900 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer dark:text-zinc-50 dark:hover:bg-zinc-700/70 dark:focus:bg-zinc-700/70"
    >
      <span className="flex items-center gap-2">
        <span className="absolute left-2 flex items-center justify-center">
          {item.checked && <Check size={16} />}
        </span>

        {Icon && (
          <Icon
            size={16}
            className="shrink-0 text-zinc-900 dark:text-zinc-50"
          />
        )}
        {item.label}
      </span>

      {item.endContent}
    </button>
  );
}

function RadioItemRow({
  option,
  selected,
  onSelect,
}: {
  option: RadioOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      disabled={option.disabled}
      onClick={onSelect}
      className="relative flex w-full items-center justify-between gap-2 rounded-lg py-1.5 pl-8 pr-2 text-sm font-medium text-zinc-900 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer dark:text-zinc-50 dark:hover:bg-zinc-700/70 dark:focus:bg-zinc-700/70"
    >
      <span className="flex items-center gap-2">
        <span className="absolute left-2 flex items-center justify-center">
          {selected && <Check size={16} />}
        </span>

        {Icon && (
          <Icon
            size={16}
            className="shrink-0 text-zinc-900 dark:text-zinc-50"
          />
        )}
        {option.label}
      </span>

      {option.endContent}
    </button>
  );
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  sections: MenuSection[];
  header?: React.ReactNode;
  className?: string;
}

export default function DropdownMenu({
  trigger,
  sections,
  header,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [ready, setReady] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Shob nested submenu portal element ekhane track hobe
  const portalNodesRef = useRef<Set<HTMLElement>>(new Set());

  const register = useCallback((el: HTMLElement) => {
    portalNodesRef.current.add(el);
  }, []);
  const unregister = useCallback((el: HTMLElement) => {
    portalNodesRef.current.delete(el);
  }, []);

  const recalculate = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 180;
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    setCoords(computeCoords(triggerRect, menuWidth, menuHeight));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      setReady(false);
      return;
    }
    recalculate();
    window.addEventListener("resize", recalculate);
    window.addEventListener("scroll", recalculate, true);
    return () => {
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("scroll", recalculate, true);
    };
  }, [open, recalculate]);

  useLayoutEffect(() => {
    if (coords) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [coords]);

  useLayoutEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      for (const el of portalNodesRef.current) {
        if (el.contains(target)) return;
      }

      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="inline-block" ref={triggerRef}>
      <div onClick={() => setOpen((prev) => !prev)}>
        {isValidElement(trigger)
          ? cloneElement(trigger as React.ReactElement<any>, {
              "data-state": open ? "open" : "closed",
              "aria-expanded": open,
            })
          : trigger}
      </div>

      {open &&
        createPortal(
          <MenuRootContext.Provider value={{ register, unregister }}>
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                visibility: coords ? "visible" : "hidden",
                opacity: ready ? 1 : 0,
                transform: getTransform(coords, ready),
                transition: "opacity 150ms ease-out, transform 150ms ease-out",
              }}
              className={`z-50 min-w-45 rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-900 shadow-md ${className ?? ""} dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50`}
            >
              {header && (
                <>
                  <div className="px-2 py-1.5">{header}</div>
                  <div className="my-1.5 h-px bg-zinc-200 dark:bg-zinc-700" />
                </>
              )}
              <SectionList
                sections={sections}
                closeMenu={() => setOpen(false)}
              />
            </div>
          </MenuRootContext.Provider>,
          document.body,
        )}
    </div>
  );
}

function MenuItemRow({
  item,
  closeMenu,
  forcedHPosition,
}: {
  item: ActionMenuItem;
  closeMenu: () => void;
  forcedHPosition?: "left" | "right";
}) {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [ready, setReady] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRoot = useContext(MenuRootContext);

  const hasChildren = item.children && item.children.length > 0;
  const isDestructive = item.variant === "destructive";
  const Icon = item.icon;

  const recalculate = useCallback(() => {
    if (!rowRef.current) return;
    const rowRect = rowRef.current.getBoundingClientRect();
    const submenuWidth = submenuRef.current?.offsetWidth ?? 180;
    const submenuHeight = submenuRef.current?.offsetHeight ?? 0;

    const spaceBelow = window.innerHeight - rowRect.top;
    const spaceAbove = rowRect.bottom;
    const vPosition: "top" | "bottom" =
      spaceBelow < submenuHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    let hPosition: "left" | "right";
    if (forcedHPosition) {
      hPosition = forcedHPosition;
    } else {
      const spaceRight = window.innerWidth - rowRect.right;
      hPosition = spaceRight < submenuWidth ? "left" : "right";
    }

    const top =
      vPosition === "bottom" ? rowRect.top : rowRect.bottom - submenuHeight;
    const left =
      hPosition === "right" ? rowRect.right : rowRect.left - submenuWidth;

    setCoords({ top, left, vPosition, hPosition });
  }, [forcedHPosition]);

  useLayoutEffect(() => {
    if (!submenuOpen) {
      setCoords(null);
      setReady(false);
      return;
    }
    recalculate();
    window.addEventListener("resize", recalculate);
    window.addEventListener("scroll", recalculate, true);
    return () => {
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("scroll", recalculate, true);
    };
  }, [submenuOpen, recalculate]);

  useLayoutEffect(() => {
    if (coords) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [coords]);

  useLayoutEffect(() => {
    if (submenuOpen && submenuRef.current && menuRoot) {
      const el = submenuRef.current;
      menuRoot.register(el);
      return () => menuRoot.unregister(el);
    }
  }, [submenuOpen, menuRoot]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (hasChildren) setSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setSubmenuOpen(false), 150);
  };

  function getSubmenuTransform() {
    if (!ready || !coords) {
      const x =
        coords?.hPosition === "right" ? "translateX(-4px)" : "translateX(4px)";
      return `scale(0.95) ${x}`;
    }
    return "scale(1) translateX(0px)";
  }

  return (
    <div
      ref={rowRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        disabled={item.disabled}
        onClick={() => {
          if (!hasChildren) {
            item.onClick?.();
            closeMenu();
          }
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 font-medium py-1.5 text-sm outline-none transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 ${
          isDestructive
            ? "text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/70"
            : "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-700/70"
        }`}
      >
        <span className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isDestructive
                  ? "text-red-600 dark:text-red-500"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            />
          )}
          {item.label}
        </span>
        {hasChildren && (
          <ChevronRight size={14} className="text-gray-900 dark:text-zinc-50" />
        )}
      </button>

      {hasChildren &&
        submenuOpen &&
        createPortal(
          <div
            ref={submenuRef}
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? "visible" : "hidden",
              opacity: ready ? 1 : 0,
              transform: getSubmenuTransform(),
              transition: "opacity 150ms ease-out, transform 150ms ease-out",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="z-50 min-w-45 rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-900 shadow-md dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
          >
            <SectionList
              sections={item.children!}
              closeMenu={closeMenu}
              forcedHPosition={coords?.hPosition}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
