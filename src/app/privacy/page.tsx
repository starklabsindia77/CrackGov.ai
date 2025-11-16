import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PrivacyPage() {
  let content = `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly to us, including:
- Name and email address
- Payment information (processed securely through Razorpay)
- Study progress and test results

## 2. How We Use Your Information
We use your information to:
- Provide and improve our services
- Process payments
- Send you important updates about your account

## 3. Data Security
We implement appropriate security measures to protect your personal information.

## 4. Cookies
We use cookies to enhance your experience and analyze usage patterns.

## 5. Your Rights
You have the right to:
- Access your personal data
- Request deletion of your data
- Opt-out of marketing communications

## Contact
For privacy concerns, please contact us.`;

  try {
    const privacyPage = await prisma.page.findUnique({
      where: { slug: "privacy", published: true },
    });

    if (privacyPage) {
      content = privacyPage.content;
    }
  } catch (error) {
    console.error("Error fetching privacy page:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

