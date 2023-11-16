import {
  createDeliveryClient,
  Elements,
  ElementType,
  IContentItem,
} from "@kontent-ai/delivery-sdk";
import { green, red, yellow } from "colors";
import { createObjectCsvWriter } from "csv-writer";
import { extractLinksFromRichTextElement } from "./helpers";
import { csvFilename, deliveryClient } from "./config";

interface MissingLinkRteRecord {
  contentItem: IContentItem;
  elementCodename: string;
  linkText: string | undefined;
  linkedItemId: string;
}

interface IRecord {
  id: string;
  codename: string;
  name: string;
  element: string;
  linkText: string;
  linkedItemId: string;
}

const run = async () => {
  const items = (
    await deliveryClient.itemsFeed().toAllPromise({
      responseFetched: (response) => {
        console.log(
          `Fetched '${yellow(
            response.data.items.length.toString()
          )}' items from API`
        );
      },
    })
  ).data.items;

  const missingRteRecords: MissingLinkRteRecord[] = [];

  console.log(
    `Loaded '${yellow(
      items.length.toString()
    )}' items in total from Delivery API`
  );

  for (const item of items) {
    for (const [elementCodename, element] of Object.entries(item.elements)) {
      if (element.type === ElementType.RichText) {
        const linksInRte = extractLinksFromRichTextElement({
          richTextElement: element as Elements.RichTextElement,
        });

        for (const link of linksInRte) {
          if (link.linkItemId) {
            // check if item exists
            const linkedItem = items.find(
              (m) => m.system.id === link.linkItemId
            );

            if (!linkedItem) {
              missingRteRecords.push({
                contentItem: item,
                elementCodename: elementCodename,
                linkedItemId: link.linkItemId,
                linkText: link.linkText,
              });

              console.log(
                `${red(
                  "[Missing link]"
                )}: Found missing linked item in '${yellow(
                  item.system.codename
                )}' (${green(item.system.name)}) within element '${yellow(
                  elementCodename
                )}' (${green(element.name)}). The link text is '${yellow(
                  link.linkText ?? "n/a"
                )}'`
              );
            }
          }
        }
      }
    }
  }

  if (missingRteRecords.length === 0) {
    console.log(
      `${green("Success! No missing linked items in RTE were found.")}`
    );
  } else {
    console.log(
      `Saving '${yellow(
        missingRteRecords.length.toString()
      )}' invalid content item links to file '${yellow(csvFilename)}'`
    );

    const headers: { id: string; title: string }[] = [
      { id: "id", title: "Id" },
      { id: "name", title: "Name" },
      { id: "codename", title: "Codename" },
      { id: "element", title: "Element" },
    ];

    const csvWriter = createObjectCsvWriter({
      path: csvFilename,
      alwaysQuote: true,
      header: headers,
    });

    const records = missingRteRecords.map((m) => {
      const record: IRecord = {
        id: m.contentItem.system.id,
        name: m.contentItem.system.name,
        codename: m.contentItem.system.codename,
        element: m.contentItem.system.lastModified,
        linkText: m.linkText ?? "n/a",
        linkedItemId: m.linkedItemId,
      };

      return record;
    });

    await csvWriter.writeRecords(records);

    console.log(`File '${yellow(csvFilename)}' successfully created`);
  }
};

run();
