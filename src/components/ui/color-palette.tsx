/**
 * Color Palette Component
 * Displays all the color styles in a visual palette
 */
export function ColorPalette() {
  const colors = [
    { name: "Primary / Teal", value: "#00A884", className: "bg-primary-teal" },
    { name: "Primary / Teal Light", value: "#D6F5EB", className: "bg-primary-teal-light" },
    { name: "Ink / Dark", value: "#0F172A", className: "bg-ink-dark" },
    { name: "Text / Primary", value: "#111827", className: "bg-text-primary" },
    { name: "Text / Secondary", value: "#4B5563", className: "bg-text-secondary" },
    { name: "Border / Subtle", value: "#E5E7EB", className: "bg-borderSubtle" },
    { name: "BG / Canvas", value: "#F9FAFB", className: "bg-bg-canvas" },
    { name: "BG / Card", value: "#FFFFFF", className: "bg-bg-card border border-borderSubtle" },
    { name: "State / Error", value: "#DC2626", className: "bg-state-error" },
    { name: "State / Success", value: "#16A34A", className: "bg-state-success" },
  ];

  return (
    <div className="p-8 bg-bg-canvas">
      <h1 className="text-display-h1 text-text-primary mb-8">Color Palette</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colors.map((color) => (
          <div
            key={color.name}
            className="bg-bg-card rounded-lg p-4 border border-borderSubtle shadow-sm"
          >
            <div
              className={`w-full h-24 rounded-md mb-3 ${color.className}`}
              style={{ backgroundColor: color.value }}
            />
            <div className="text-body-m text-text-primary font-medium mb-1">
              {color.name}
            </div>
            <div className="text-body-s text-text-secondary font-mono">
              {color.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

