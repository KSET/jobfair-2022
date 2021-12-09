const aliasMap: Map<string, string[]> = new Map(Object.entries({
  "og:title": [ "apple-mobile-web-app-title" ],
  locale: [ "og:locale" ],
}));

const renameMap: Map<string, string> = new Map(Object.entries({
  title: "og:title",
  description: "og:description",
  image: "og:image",
  type: "og:type",
}));

const mappedContent: Map<string, (param: string) => string> = new Map(Object.entries({
  "og:title": (title: string): string => `${ title } | Job Fair Meetup`,
  "og:image": (imageUrl: string): string => {
    if (!imageUrl.startsWith(process.env.BASE_URL || "/")) {
      imageUrl = process.env.BASE_URL + imageUrl;
    }

    return imageUrl;
  },
}));

const hid = ({ name, content }: { name: string, content: string }) =>
  name.startsWith("og:")
    ? ({ hid: name, property: name, content })
    : ({ hid: name, name, content })
;

const getMappedContent = (key: string, content: string) => (mappedContent.get(key) || ((x) => x))(content);
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

export const generateMetadata =
  (pageData: Record<string, string>) =>
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
      )
;
