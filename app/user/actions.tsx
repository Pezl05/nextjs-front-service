'use server'
import { cookies } from 'next/headers'

export interface User {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

export async function get_users(): Promise<User[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3000/api/v1/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        console.log(res)
        if (!res.ok) {
            throw new Error("Failed to fetch users");
        }
        const data = await res.json(); // Parse the response body as JSON
        return data;
    } catch (error) {
        console.log("Error: ", error);
        return [];
    }
}

export async function get_user(user_id: number): Promise<User> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3000/api/v1/users/${user_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        console.log(res)
        if (!res.ok) {
            throw new Error("Failed to fetch users");
        }
        const data = await res.json(); // Parse the response body as JSON
        return data;
    } catch (error) {
        console.log("Error: ", error);
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
        const res = await fetch("http://localhost:3000/api/v1/register", {
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
    } catch (error) {
        console.log("Error: ", error);
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
        const res = await fetch(`http://localhost:3000/api/v1/users/${user_id}`, {
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
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to edit user. Please try again." }
    }
}

export async function delete_users(user_id: number) {
    
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3000/api/v1/users/${user_id}`, {
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
        
        return { success: true, message: "User successfully deleted." }
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to delete user. Please try again." }
    }
}

export async function reset_password(user_id: number, password?: string) {
    
    try {
        const newPassword = password || `P@ssw0rd@${new Date().getFullYear()}`;

        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3000/api/v1/users/${user_id}`, {
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
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to reset passowrd. Please try again." }
    }
}

