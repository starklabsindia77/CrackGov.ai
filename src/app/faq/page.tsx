import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function FAQPage() {
  let faqs: Array<{ question: string; answer: string; category?: string }> = [];

  try {
    const faqsData = await prisma.faq.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    faqs = faqsData;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
  }

  const categories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions about CrackGov.ai
          </p>
        </div>

        <div className="space-y-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqs
                    .filter((f) => f.category === category)
                    .map((faq, idx) => (
                      <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                        <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                        <div className="prose dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {faq.answer}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                    <div className="prose dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {faq.answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No FAQs available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

