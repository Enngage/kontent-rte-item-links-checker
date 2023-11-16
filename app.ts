import { createDeliveryClient, IContentItem } from "@kontent-ai/delivery-sdk";
import striptags from "striptags";
import { green, yellow } from "colors";
import { createObjectCsvWriter } from "csv-writer";

interface MissingLinkRteRecord {
  contentItem: IContentItem;
  elementCodename: string;
}

interface IRecord {
  id: string;
  codename: string;
  name: string;
  element: string;
}

const deliveryClient = createDeliveryClient({
  environmentId: "2542ce4a-3be3-01e8-fdf0-ce1b87b58f11",
});
const csvFilename = `missing-rte-items.csv`;

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
    missingRteRecords.push({
      contentItem: item,
      elementCodename: "hello",
    });
  }

  console.log(
    `Saving records with missing content item links in RTE '${yellow(
      csvFilename
    )}'`
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
    };

    return record;
  });

  await csvWriter.writeRecords(records);

  console.log(`File '${yellow(csvFilename)}' successfully created`);
};

run();
