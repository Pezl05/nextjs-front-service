'use server'
import { logger } from '@/lib';
import { cookies } from 'next/headers'

export interface User {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

const AUTH_API = process.env.AUTH_API

export async function get_users(name?:string , role?:string): Promise<User[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${AUTH_API}/api/v1/users/?name=${ name ? name : "" }&role=${ role ? role : ""}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        if (!res.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        return data;
    } catch (err) {
        logger.error(`Error occurred during user fetch. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return [];
    }
}

export async function get_user(user_id: number): Promise<User> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${AUTH_API}/api/v1/users/${user_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        if (!res.ok) {
            throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        return data;
    } catch (err) {
        logger.error(`Error occurred during fetching user with ID: ${user_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);
        throw new Error("Failed to fetch users");
    }
}

export async function add_users(formData: FormData) {
    const rawFormData = {
        username: (formData.get('username') as string).trim(),
        password: "P@ssw0rd@" + new Date().getFullYear(),
        email: (formData.get('username') as string).trim() + "@company.co.th",
        full_name: (formData.get('first_name') as string).trim() + " " + (formData.get('last_name') as string).trim(),
        role: formData.get('role')
    }
    
    const rawFormDataJson = JSON.stringify(rawFormData)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${AUTH_API}/api/v1/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            body: rawFormDataJson,
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to add user. Please try again." }
        }
        
        return { success: true, message: "User successfully added." }
    } catch (err) {
        logger.error(`Error during user creation for username: ${rawFormData.username}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);
        return { success: false, message: "Failed to add user. Please try again." }
    }
}

export async function edit_users(user_id: number ,formData: FormData) {
    const rawFormData = {
        username: (formData.get('username') as string).trim(),
        email: (formData.get('username') as string).trim() + "@company.co.th",
        full_name: (formData.get('first_name') as string).trim() + " " + (formData.get('last_name') as string).trim(),
        role: formData.get('role')
    }
    
    const rawFormDataJson = JSON.stringify(rawFormData)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${AUTH_API}/api/v1/users/${user_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            body: rawFormDataJson,
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to edit user. Please try again." }
        }
        
        return { success: true, message: "User successfully updated." }
    } catch (err) {
        logger.error(`Error during editing user with ID: ${user_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to edit user. Please try again." }
    }
}

export async function delete_users(user_id: number) {
    
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${AUTH_API}/api/v1/users/${user_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to delete user. Please try again." }
        }
        logger.info(`User with ID: ${user_id} successfully deleted.`);

        return { success: true, message: "User successfully deleted." }
    } catch (err) {
        logger.error(`Error during deleting user with ID: ${user_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to delete user. Please try again." }
    }
}

export async function reset_password(user_id: number, password?: string) {
    
    try {
        const newPassword = password || `P@ssw0rd@${new Date().getFullYear()}`;

        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${AUTH_API}/api/v1/users/${user_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            body: JSON.stringify({
                'password': newPassword,
            }),
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to reset passowrd. Please try again." }
        }
        
        return { success: true, message: "Reset password successfully." }
    } catch (err) {
        logger.error(`Error during password reset for user ID: ${user_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to reset passowrd. Please try again." }
    }
}

