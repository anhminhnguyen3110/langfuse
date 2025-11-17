import React, { useState } from "react";
import { CodeView } from "@/src/components/ui/CodeJsonViewer";
import { Button } from "@/src/components/ui/button";
import { copyTextToClipboard } from "@/src/utils/clipboard";

export const WebhookSecretRender = ({
  webhookSecret,
}: {
  webhookSecret: string;
}) => {
  const [revealed, setRevealed] = useState(false);

  const mask = (s: string) => {
    if (!s) return "";
    // Keep first 6 and last 4 characters visible, mask the middle
    const start = s.slice(0, 6);
    const end = s.slice(-4);
    return start + "•".repeat(Math.max(8, s.length - 10)) + end;
  };

  return (
    <>
      <div className="mb-4">
        <div className="text-md font-semibold">Webhook Secret</div>
        <div className="my-2 text-sm">
          This secret can only be viewed once. You can regenerate it in the
          automation settings if needed. Use this secret to verify webhook
          signatures in your endpoint.
        </div>

        {/* Mask secret by default. Revealing is an explicit user action. */}
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <CodeView
              content={revealed ? webhookSecret : mask(webhookSecret)}
              defaultCollapsed={false}
            />
          </div>
          <div className="flex flex-col gap-2">
            {!revealed ? (
              <Button
                variant="outline"
                onClick={() => setRevealed(true)}
                title="Reveal secret"
              >
                Reveal
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => copyTextToClipboard(webhookSecret)}
                >
                  Copy
                </Button>
                <Button variant="ghost" onClick={() => setRevealed(false)}>
                  Hide
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
