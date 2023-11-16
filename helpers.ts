import { Elements } from "@kontent-ai/delivery-sdk";

export interface IRichTextExtractedLink {
  sourceLinkHtml: string;
  linkItemId?: string;
  externalUrl?: string;
  linkText?: string;
}

export function extractLinksFromRichTextElement(data: {
  richTextElement: Elements.RichTextElement;
}): IRichTextExtractedLink[] {
  const extractedLinks: IRichTextExtractedLink[] = [];
  const regex = new RegExp(`<a(.+?)</a>`, "g");
  const text = data.richTextElement.value;

  text.match(regex)?.forEach((element) => {
    const dataItemId: string | undefined = extractDataItemId(element);
    const linkText: string | undefined = getTextFromHyperlink(element);

    if (dataItemId) {
      // internal link
      extractedLinks.push({
        sourceLinkHtml: element,
        linkItemId: dataItemId,
        linkText: linkText,
      });
    } else {
      const externalHref = extractUrlFromHyperlink(element);

      // external link
      if (externalHref) {
        extractedLinks.push({
          sourceLinkHtml: element,
          externalUrl: externalHref,
          linkText: linkText,
        });
      }
    }
  });

  return extractedLinks;
}

function extractDataItemId(text: string): string | undefined {
  const regex = new RegExp(`data-item-id="(.+?)"`);
  const match = text.match(regex);

  if (match && match.length > 1) {
    return match[1];
  }

  return undefined;
}

function extractUrlFromHyperlink(text: string): string | undefined {
  var regex = /href="([^"]*)/;

  return text.match(regex)?.[1];
}

function getTextFromHyperlink(text: string): string | undefined {
  return text.match(/<a [^>]+>([^<]+)<\/a>/)?.[1];
}
