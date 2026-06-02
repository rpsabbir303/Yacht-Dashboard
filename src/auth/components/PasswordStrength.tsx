import { CheckOutlined, MinusOutlined } from "@ant-design/icons";

import { scorePassword } from "@auth/validation/passwordStrength";
import { cn } from "@utils/cn";

interface Props {
  value: string;
}

const TIER_TONE: Record<string, { bar: string; text: string }> = {
  empty: { bar: "bg-white/[0.08]", text: "text-grey-500" },
  weak: { bar: "bg-[#AA2727]", text: "text-[#C24545]" },
  fair: { bar: "bg-gold-500", text: "text-gold-400" },
  good: { bar: "bg-teal-500/70", text: "text-teal-300" },
  strong: { bar: "bg-teal-500", text: "text-teal-300" },
};

/**
 * Password strength meter + rule checklist.
 *
 * Renders four equal-width segments tinted up to the user's score, plus a
 * compact checklist of policy rules that flip from grey ticks to teal as each
 * rule is satisfied. Used below the new-password input on the reset page.
 */
export const PasswordStrength = ({ value }: Props) => {
  const result = scorePassword(value);
  const tone = TIER_TONE[result.tier] ?? TIER_TONE.empty;
  const segments = 4;
  const filled = Math.round(result.score * segments);

  const ruleItems: { key: keyof typeof result.rules; label: string }[] = [
    { key: "length", label: "8+ characters" },
    { key: "uppercase", label: "Uppercase letter" },
    { key: "lowercase", label: "Lowercase letter" },
    { key: "number", label: "Number" },
    { key: "symbol", label: "Symbol" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < filled ? tone.bar : "bg-white/[0.08]",
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "ml-3 text-[11px] font-medium uppercase tracking-[0.18em]",
            tone.text,
          )}
        >
          {result.label}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px] text-grey-500">
        {ruleItems.map((rule) => {
          const ok = result.rules[rule.key];
          return (
            <li
              key={rule.key}
              className={cn(
                "flex items-center gap-1.5 transition",
                ok && "text-teal-300",
              )}
            >
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full border text-[9px]",
                  ok
                    ? "border-teal-500/40 bg-teal-500/15 text-teal-300"
                    : "border-white/[0.08] bg-white/[0.03] text-grey-500",
                )}
                aria-hidden
              >
                {ok ? <CheckOutlined /> : <MinusOutlined />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
