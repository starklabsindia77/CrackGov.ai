import { toast } from "sonner";

export interface ShareableContent {
  title: string;
  description: string;
  url?: string;
  data?: any;
}

export async function shareContent(content: ShareableContent): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: content.description,
        url: content.url || window.location.href,
      });
      return true;
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        toast.error("Failed to share");
      }
      return false;
    }
  } else {
    // Fallback: copy to clipboard
    return copyToClipboard(content);
  }
}

export async function copyToClipboard(content: ShareableContent): Promise<boolean> {
  const text = `${content.title}\n\n${content.description}\n\n${content.url || window.location.href}`;
  
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    toast.error("Failed to copy to clipboard");
    return false;
  }
}

export function generateShareableLink(
  type: "test" | "study_plan",
  id: string
): string {
  const baseUrl = process.env.NEXTAUTH_URL || window.location.origin;
  return `${baseUrl}/share/${type}/${id}`;
}

export function generateTestResultShareText(
  exam: string,
  score: number,
  total: number,
  accuracy: number
): string {
  return `I scored ${score}/${total} (${accuracy.toFixed(1)}%) on ${exam} test on CrackGov.ai! 🎯`;
}

export function generateStudyPlanShareText(
  exam: string,
  targetDate: string
): string {
  return `I'm preparing for ${exam} with a personalized study plan on CrackGov.ai! 📚 Target date: ${targetDate}`;
}

