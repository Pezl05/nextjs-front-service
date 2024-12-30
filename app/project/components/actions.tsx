'use server'
import { cookies } from 'next/headers'

export interface Project {
    projectId: number;
    name: string;
    description: string;
    status: string;
    startDate: Date;
    endDate: Date;
    updatedAt?: Date;
}

export interface User {
    userId: number;
    username: string;
    fullName: string;
}

export interface ProjectMember {
    projectMemberId: number;
    role: string;
    projectId: Project;
    userId: User;
}

export async function get_projects(name?: string, status?: string): Promise<Project[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3001/api/v1/projects/?name=${ name ? name : "" }&status=${ status ? status : "" }`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        if (!res.ok) {
            throw new Error("Failed to fetch projects");
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log("Error: ", error);
        return [];
    }
}

export async function get_project(project_id:number): Promise<Project> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3001/api/v1/projects/${project_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        if (!res.ok) {
            throw new Error("Project not found.");
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Failed to fetch project");
    }
}

export async function get_projects_by_user(user_id?: number): Promise<Project[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3001/api/v1/project_members${ user_id ? `/?user_id=${user_id}` : '' }`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        if (!res.ok) {
            throw new Error("Failed to fetch projects");
        }
        const data = await res.json();
        console.log(data)
        return data;
    } catch (error) {
        console.log("Error: ", error);
        return [];
    }
}

export async function add_projects(formData: FormData) {
    const rawFormData: { name: string, status: string, description?: string, start_date?: string, end_date?: string } = {
        name: (formData.get('name') as string).trim(),
        status: (formData.get('status') as string).trim()
    }
    
    const description = formData.get('description') as string
    if(description)
        rawFormData.description = description;

    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    if (startDate && endDate) {
        rawFormData.start_date = startDate;
        rawFormData.end_date = endDate;
    }

    const rawFormDataJson = JSON.stringify(rawFormData)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch("http://localhost:3001/api/v1/projects", {
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
            return { success: false, message: errorData.message || "Failed to add project. Please try again." }
        }
        
        return { success: true, message: "Project successfully added." }
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to add project. Please try again." }
    }
}

export async function edit_projects(project_id: number,formData: FormData) {
    const rawFormData: { name: string, status: string, description?: string, startDate?: string, endDate?: string } = {
        name: (formData.get('name') as string).trim(),
        status: (formData.get('status') as string).trim()
    }
    
    const description = formData.get('description') as string
    if(description)
        rawFormData.description = description;

    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    if (startDate && endDate) {
        rawFormData.startDate = startDate;
        rawFormData.endDate = endDate;
    }

    const rawFormDataJson = JSON.stringify(rawFormData)
    console.log(rawFormDataJson)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3001/api/v1/projects/${project_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            body: rawFormDataJson,
            credentials: 'include'
        })

        console.log(res)

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to edit project. Please try again." }
        }
        
        console.log("success")
        return { success: true, message: "Project successfully updated." }
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to edit project. Please try again." }
    }
}


export async function get_project_member({project_id, user_id} : {project_id?:number, user_id?: number} ): Promise<ProjectMember[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3001/api/v1/project_members/?project_id=${ project_id ? project_id : "" }&user_id=${ user_id ? user_id : "" }`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })

        if (!res.ok) {
            throw new Error("Failed to fetch project members");
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log("Error: ", error);
        return [];
    }
}

export async function add_project_member(project_id: number, user_id: number) {
    const rawFormData = {
        projectId: Number(project_id),
        userId: Number(user_id),
        role: "member"
    }
    
    const rawFormDataJson = JSON.stringify(rawFormData)

    console.log(rawFormDataJson)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch("http://localhost:3001/api/v1/project_members", {
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
            return { success: false, message: errorData.message || "Failed to add member. Please try again." }
        }
        
        return { success: true, message: "Member successfully added." }
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to add member. Please try again." }
    }
}

export async function delete_project_members(project_member_id: number) {
    
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`http://localhost:3001/api/v1/project_members/${project_member_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to delete member. Please try again." }
        }
        
        return { success: true, message: "Member successfully deleted." }
    } catch (error) {
        console.log("Error: ", error);
        return { success: false, message: "Failed to delete member. Please try again." }
    }
}