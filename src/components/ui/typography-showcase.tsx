/**
 * Typography Showcase Component
 * Displays all the text styles
 */
export function TypographyShowcase() {
  return (
    <div className="p-8 bg-bg-canvas">
      <h1 className="text-display-h1 text-text-primary mb-8">Typography Styles</h1>
      
      <div className="space-y-8 bg-bg-card p-6 rounded-lg border border-borderSubtle">
        <div>
          <div className="text-label-xs text-text-secondary mb-2 font-mono">Display / H1</div>
          <h1 className="text-display-h1 text-text-primary">
            The quick brown fox jumps over the lazy dog
          </h1>
          <div className="text-body-s text-text-secondary mt-2">
            36px, 48px line-height, SemiBold (600)
          </div>
        </div>

        <div>
          <div className="text-label-xs text-text-secondary mb-2 font-mono">Display / H2</div>
          <h2 className="text-display-h2 text-text-primary">
            The quick brown fox jumps over the lazy dog
          </h2>
          <div className="text-body-s text-text-secondary mt-2">
            28px, 36px line-height, Medium (500)
          </div>
        </div>

        <div>
          <div className="text-label-xs text-text-secondary mb-2 font-mono">Heading / H3</div>
          <h3 className="text-heading-h3 text-text-primary">
            The quick brown fox jumps over the lazy dog
          </h3>
          <div className="text-body-s text-text-secondary mt-2">
            22px, 30px line-height, Medium (500)
          </div>
        </div>

        <div>
          <div className="text-label-xs text-text-secondary mb-2 font-mono">Body / M</div>
          <p className="text-body-m text-text-primary">
            The quick brown fox jumps over the lazy dog. This is body text used for regular content and paragraphs.
          </p>
          <div className="text-body-s text-text-secondary mt-2">
            16px, 24px line-height, Regular (400)
          </div>
        </div>

        <div>
          <div className="text-label-xs text-text-secondary mb-2 font-mono">Body / S</div>
          <p className="text-body-s text-text-primary">
            The quick brown fox jumps over the lazy dog. This is smaller body text for secondary content.
          </p>
          <div className="text-body-s text-text-secondary mt-2">
            14px, 20px line-height, Regular (400)
          </div>
        </div>

        <div>
          <div className="text-label-xs text-text-secondary mb-2 font-mono">Label / XS</div>
          <p className="text-label-xs text-text-primary">
            The quick brown fox jumps over the lazy dog
          </p>
          <div className="text-body-s text-text-secondary mt-2">
            12px, 16px line-height, Medium (500)
          </div>
        </div>
      </div>
    </div>
  );
}

