import { ColorPalette } from "@/components/ui/color-palette";
import { TypographyShowcase } from "@/components/ui/typography-showcase";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen">
      <ColorPalette />
      <div className="border-t border-borderSubtle" />
      <TypographyShowcase />
    </div>
  );
}

