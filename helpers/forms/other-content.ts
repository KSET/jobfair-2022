import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";

export type OtherContentFormData = {
  nameHr: string,
  nameEn: string,
  descriptionHr: string,
  descriptionEn: string,
  subtype: string,
};

export type OtherContentPresenterFormData = {
  firstName: string,
  lastName: string,
  bioHr: string,
  bioEn: string,
  photo: string,
};

export const subtypeOptions = [
  { label: "Hot Talk", value: "hot-talk" },
  { label: "Loosen Up", value: "loosen-up" },
  { label: "Debate", value: "debate" },
  { label: "Other", value: "other" },
];

export const otherContentCreate =
  <T extends Partial<OtherContentFormData>>(item?: T | null): Record<keyof OtherContentFormData, InputEntry> =>
    ({
      nameHr: {
        value: item?.nameHr ?? "",
        type: "text" as const,
        placeholder: "Naziv (HR)",
        classes: "span-1",
      },
      nameEn: {
        value: item?.nameEn ?? "",
        type: "text" as const,
        placeholder: "Name (EN)",
        classes: "span-1",
      },
      descriptionHr: {
        value: item?.descriptionHr ?? "",
        type: "textarea" as const,
        placeholder: "Opis (HR)",
      },
      descriptionEn: {
        value: item?.descriptionEn ?? "",
        type: "textarea" as const,
        placeholder: "Description (EN)",
      },
      subtype: {
        value: item?.subtype ?? "other",
        type: "dropdown" as const,
        options: subtypeOptions,
        required: false,
      },
    })
;

type PresenterArg = {
  firstName?: string,
  lastName?: string,
  bioHr?: string,
  bioEn?: string,
  photo?: { uid: string, name?: string, full?: { mimeType: string, }, } | string | null,
};

export const otherContentPresenterCreate =
  (presenter?: PresenterArg | null): Record<keyof OtherContentPresenterFormData, InputEntry> => {
    const photoValue =
      presenter?.photo && "object" === typeof presenter.photo
        ? `/api/i/${ presenter.photo.uid }/full`
        : (presenter?.photo as string | null | undefined) ?? ""
    ;
    const photoName =
      presenter?.photo && "object" === typeof presenter.photo
        ? presenter.photo.name
        : undefined
    ;
    const photoMime =
      presenter?.photo && "object" === typeof presenter.photo
        ? presenter.photo.full?.mimeType
        : undefined
    ;

    return {
      firstName: {
        value: presenter?.firstName ?? "",
        type: "text" as const,
        placeholder: "Ime",
        classes: "span-1",
      },
      lastName: {
        value: presenter?.lastName ?? "",
        type: "text" as const,
        placeholder: "Prezime",
        classes: "span-1",
      },
      bioHr: {
        value: presenter?.bioHr ?? "",
        type: "textarea" as const,
        placeholder: "Bio (HR)",
        required: false,
      },
      bioEn: {
        value: presenter?.bioEn ?? "",
        type: "textarea" as const,
        placeholder: "Bio (EN)",
        required: false,
      },
      photo: {
        value: photoValue,
        fileName: photoName,
        fileType: photoMime,
        accept: "image/png,image/jpeg",
        type: "file" as const,
        required: false,
      },
    };
  }
;
