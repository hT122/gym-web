import { ChevronRight } from "lucide-react";
import { Button } from "./button";

export function GetStartedButton({ label = "Entrar", type = "button", onClick, disabled, className }) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={`group relative overflow-hidden w-full font-extrabold tracking-widest text-xs ${className ?? ""}`}
    >
      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
        {label}
      </span>
      <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 not-italic">
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </i>
    </Button>
  );
}
