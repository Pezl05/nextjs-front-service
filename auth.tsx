'use server'
import { jwtVerify } from "jose";
import { cookies } from 'next/headers'
import { logger } from "@/lib";

const JWT_SECRET = process.env.JWT_SECRET
const AUTH_API = process.env.AUTH_API
const key = new TextEncoder().encode(JWT_SECRET);

export async function decrypt(token: string): Promise<any> {
  try {
    const payload = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return payload.payload;
  } catch (err) {
    logger.error(`Error during token decryption. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
    logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

    return null;
  }
}

export async function login(formData: FormData) {
  const rawFormData = {
    username: formData.get('username'),
    password: formData.get('password'),
  }
  const rawFormDataJson = JSON.stringify(rawFormData)

  try {
    const res = await fetch(`${AUTH_API}/api/v1/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: rawFormDataJson,
      credentials: 'include'
    })

    if (res.ok) {
      const setCookieHeader = res.headers.get('set-cookie')
      if (setCookieHeader) {
        const jwt = setCookieHeader.split(';')[0].split('=')[1]
        const cookieStore = await cookies();
        cookieStore.set('jwt', jwt, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 60 * 60 * 24,
        })
      }

      logger.info(`Login successful for username: ${rawFormData.username}`);
      return { success: true }
    } else {
      return { success: false, message: "Invalid username or password. Please check and try again." }
    }

  } catch (err) {
    logger.error(`Error during login for username: ${rawFormData.username}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
    logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

    return { success: false, message: "An error occurred during login. Please try again later." }
  }
}


export async function getSession() {
  const cookieStore = (await cookies()).get('jwt');
  const session = cookieStore?.value;
  if (!session) return null;
  return await decrypt(session);
}