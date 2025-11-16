import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TermsPage() {
  let content = `# Terms of Service

## 1. Acceptance of Terms
By accessing and using CrackGov.ai, you accept and agree to be bound by these Terms of Service.

## 2. Use of Service
- You must be at least 18 years old to use this service
- You are responsible for maintaining the confidentiality of your account
- You agree to use the service only for lawful purposes

## 3. Subscription
- Pro subscriptions are billed monthly
- Subscriptions auto-renew unless cancelled
- Refunds are available within 7 days of purchase

## 4. Intellectual Property
All content on CrackGov.ai is protected by copyright and other intellectual property laws.

## 5. Limitation of Liability
CrackGov.ai is provided "as is" without warranties of any kind.

## Contact
For questions about these terms, please contact us.`;

  try {
    const termsPage = await prisma.page.findUnique({
      where: { slug: "terms", published: true },
    });

    if (termsPage) {
      content = termsPage.content;
    }
  } catch (error) {
    console.error("Error fetching terms page:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
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

