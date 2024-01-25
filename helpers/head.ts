import {
 type Dict,
} from "~/helpers/type";

export const generateTitle =
  (title: string): string =>
    `${ title } | Job Fair`
;

const aliasMap: Map<string, string[]> = new Map(Object.entries({
  "og:title": [ "apple-mobile-web-app-title", "twitter:title" ],
  "og:image": [ "og:image:secure_url", "twitter:image" ],
  description: [ "og:description", "twitter:description" ],
  locale: [ "og:locale" ],
  "locale:alternative": [ "og:locale:alternative" ],
}));

const renameMap: Map<string, string> = new Map(Object.entries({
  title: "og:title",
  image: "og:image",
  type: "og:type",
  siteName: "og:site_name",
  "article:published_time": "og:article:published_time",
}));

const mappedContent: Map<string, (param: string) => string> = new Map(Object.entries({
  "og:title": generateTitle,
}));

const hid = ({ name, content }: { name: string, content: string, }) =>
  name.startsWith("og:")
    ? ({ name, property: name, content })
    : ({ name, content })
;

const getMappedContent = (key: string, content: unknown) => (mappedContent.get(key) || ((x) => x))(String(content));
const getRenamedKey = (key: string) => renameMap.get(key) || key;
const getKeyAliases = (key: string) => aliasMap.get(key) || [];
const getKeyWithAliases =
  (key: string, content: string) =>
    [
      key,
      ...getKeyAliases(key),
    ]
      .map((name) => hid({ name, content }))
;

export const generateMetadataFor =
  (
    key: string,
    content: string,
  ) =>
    getMappedContent(
      getRenamedKey(key),
      content,
    )
;

export const generateMetadata =
  (pageData: Dict): Record<string, string>[] =>
    Object
      .entries(pageData)
      .map(
        ([ key, content ]) => {
          const newKey = getRenamedKey(key);
          const newContent = getMappedContent(newKey, content);

          return [
            newKey,
            newContent,
          ];
        },
      )
      .flatMap(
        ([ key, content ]) =>
          getKeyWithAliases(key, content)
        ,
      ) as unknown as Record<string, string>[]
;
