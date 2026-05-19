import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import juice from "juice";
import { logger } from "../config/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Renders MJML template with Mustache-style variables.
 * Uses juice to inline CSS from MJML output.
 * @param templateName - Name of .mjml file (e.g., 'welcome', 'order-confirmation')
 * @param variables - Object with template variables
 * @returns HTML string ready to send
 */
export async function renderMjmlTemplate(
  templateName: string,
  variables: Record<string, any>
): Promise<string> {
  try {
    // Try both src/emails and the local directory (for production dist structure)
    const possiblePaths = [
      path.join(__dirname, "..", "emails", `${templateName}.mjml`),
      path.join(__dirname, `${templateName}.mjml`),
    ];

    let templatePath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }

    if (!templatePath) {
      logger.warn({ templateName }, "MJML template not found, returning fallback HTML");
      // Improved fallback that actually includes the variables for critical emails
      if (templateName === "otp") {
        return `<p>Your NestMart verification code is: <strong>${variables.otp}</strong></p><p>It expires in 10 minutes.</p>`;
      }
      return `<p>Hello, ${variables.name || "there"}!</p><p>This is a notification from NestMart.</p>`;
    }

    let mjmlContent = fs.readFileSync(templatePath, "utf-8");

    // Replace Mustache-style variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      mjmlContent = mjmlContent.replace(regex, escapeHtml(String(value ?? "")));
    });

    // Handle simple Handlebars-style loops (for items in order confirmation)
    const itemsMatch = mjmlContent.match(/{{#items}}([\s\S]*?){{\/items}}/);
    if (itemsMatch && Array.isArray(variables.items)) {
      const itemTemplate = itemsMatch[1] ?? "";
      const renderedItems = variables.items
        .map((item: Record<string, any>) => {
          let rendered: string = itemTemplate;
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            rendered = rendered.replace(regex, escapeHtml(String(value ?? "")));
          });
          return rendered;
        })
        .join("");

      mjmlContent = mjmlContent.replace(/{{#items}}[\s\S]*?{{\/items}}/, renderedItems);
    }

    // Note: Full MJML compilation requires @mjml-core library
    // For now, we return the cleaned-up template with inlined styles using juice
    // In production, integrate MJML compiler:
    // const { render } = await import('mjml');
    // const { html } = render(mjmlContent, { beautify: true });
    // return juice(html);

    // Fallback: Extract content from MJML for now
    // Strip MJML tags but preserve mj-text content
    const htmlContent = mjmlContent
      .replace(/<mj-[^>]*>/g, "")
      .replace(/<\/mj-[^>]*>/g, "");

    return juice(htmlContent);
  } catch (error) {
    logger.error({ error, templateName }, "Failed to render MJML template");
    throw error;
  }
}

/**
 * Helper to escape HTML entities in template variables
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
