import {
  z,
  ZodType,
} from "zod";
import {
  ZodTypeDef,
} from "zod/lib/types";

export const PASSWORD_LENGTH_MIN = 8 as const;
export const PASSWORD_LENGTH_MAX = 99 as const;

const passwordValidation = z.string().min(PASSWORD_LENGTH_MIN).max(PASSWORD_LENGTH_MAX);

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


const registerValidation = z.object({
  email: z.string().email().max(127),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().min(4).max(80),
  password: passwordValidation,
  passwordRepeat: passwordValidation,
});
export const RegisterValidation = <T>(user: T) => formatValidation(registerValidation, user);


const profileValidation = registerValidation.omit({
  password: true,
  passwordRepeat: true,
});
export const ProfileValidation = <T>(user: T) => formatValidation(profileValidation, user);


const passwordUpdateValidation = z.object({
  newPassword: passwordValidation,
  newPasswordRepeat: passwordValidation,
});
export const PasswordUpdateValidation = <T>(update: T) => formatValidation(passwordUpdateValidation, update);
