import {
  z,
} from "zod";

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

export async function RegisterValidation<T>(user: T): Promise<{ success: boolean, errors: { field: string, message: string, }[], }> {
  const validation = await registerValidation.safeParseAsync(user);

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
