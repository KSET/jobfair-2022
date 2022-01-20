import {
  z,
  ZodType,
} from "zod";
import {
  ZodTypeDef,
} from "zod/lib/types";

export const PASSWORD_LENGTH_MIN = 8 as const;
export const PASSWORD_LENGTH_MAX = 99 as const;

const registerValidation = z.object({
  email: z.string().email().max(127),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().min(4).max(80),
  password: z.string().min(PASSWORD_LENGTH_MIN).max(PASSWORD_LENGTH_MAX),
  passwordRepeat: z.string().min(PASSWORD_LENGTH_MIN),
});

const formatValidation =
  async <Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(validationObject: ZodType<Output, Def, Input>, data: unknown): Promise<{ success: boolean, errors: { field: string, message: string, }[], }> => {
    const validation = await validationObject.safeParseAsync(data);

    if (validation.success) {
      return {
        success: true,
        errors: [],
      };
    }

    const errors = validation.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      success: validation.success,
      errors,
    };
  }
;

export const RegisterValidation = <T>(user: T) => formatValidation(registerValidation, user);
