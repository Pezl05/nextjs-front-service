'use server'
import { logger } from '@/lib';
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

export interface Task {
    title: string;
    description?: string;
    status: string;
    phase: string;
    start_date?: Date;
    due_date?: Date;
    task_id: number;
    project_id: number;
    project_name?: string;
    created_by: number;
}

export interface TaskSearch {
    title?: string;
    status?: string;
    phase?: string;
    start_date?: string;
    due_date?: string;
    project_id?: number[];
    project_name?: string;
    today?: boolean;
    offset?: number;
    limit?: number;
}

const PROJECT_API = process.env.PROJECT_API
const TASK_API = process.env.TASK_API


export async function get_projects(name?: string, status?: string): Promise<Project[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/projects/?name=${name ? name : ""}&status=${status ? status : ""}`, {
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
    } catch (err) {
        logger.error(`Error during fetching projects with name: ${name}, status: ${status}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return [];
    }
}

export async function get_project(project_id: number): Promise<Project> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/projects/${project_id}`, {
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
    } catch (err) {
        logger.error(`Error during fetching project ID: ${project_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        throw new Error("Failed to fetch project");
    }
}

export async function get_projects_by_user(user_id?: number): Promise<Project[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/project_members${user_id ? `/?user_id=${user_id}` : ''}`, {
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
        const project = data.map((item: ProjectMember) => item.projectId);

        return project;
    } catch (err) {
        logger.error(`Error during fetching projects by user ID: ${user_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return [];
    }
}

export async function add_projects(formData: FormData) {
    const rawFormData: { name: string, status: string, description?: string, start_date?: string, end_date?: string } = {
        name: (formData.get('name') as string).trim(),
        status: (formData.get('status') as string).trim()
    }

    const description = formData.get('description') as string
    if (description)
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
        const res = await fetch(`${PROJECT_API}/api/v1/projects`, {
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
    } catch (err) {
        logger.error(`Error during project creation. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to add project. Please try again." }
    }
}

export async function edit_projects(project_id: number, formData: FormData) {
    const rawFormData: { name: string, status: string, description?: string, startDate?: string, endDate?: string } = {
        name: (formData.get('name') as string).trim(),
        status: (formData.get('status') as string).trim()
    }

    const description = formData.get('description') as string
    if (description)
        rawFormData.description = description;

    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    if (startDate && endDate) {
        rawFormData.startDate = startDate;
        rawFormData.endDate = endDate;
    }
    const rawFormDataJson = JSON.stringify(rawFormData)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/projects/${project_id}`, {
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
            return { success: false, message: errorData.message || "Failed to edit project. Please try again." }
        }

        return { success: true, message: "Project successfully updated." }
    } catch (err) {
        logger.error(`Error during project update. Project ID: ${project_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to edit project. Please try again." }
    }
}

export async function delete_project(project_id: number) {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/projects/${project_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            credentials: 'include'
        })
        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to delete project. Please try again." }
        }

        logger.info(`Project deleted successfully. Project ID: ${project_id}.`);
        return { success: true, message: "Project successfully deleted." }
    } catch (err) {
        logger.error(`Error during project deletion. Project ID: ${project_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to delete project. Please try again." }
    }
}


export async function get_project_member({ project_id, user_id }: { project_id?: number, user_id?: number }): Promise<ProjectMember[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/project_members/?project_id=${project_id ? project_id : ""}&user_id=${user_id ? user_id : ""}`, {
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
    } catch (err) {
        logger.error(`Error during fetching project members. Project ID: ${project_id ?? "N/A"}, User ID: ${user_id ?? "N/A"}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

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

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/project_members`, {
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
    } catch (err) {
        logger.error(`Error during adding project member. Project ID: ${project_id}, User ID: ${user_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to add member. Please try again." }
    }
}

export async function delete_project_members(project_member_id: number) {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${PROJECT_API}/api/v1/project_members/${project_member_id}`, {
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
    } catch (err) {
        logger.error(`Error during deleting project member with ID: ${project_member_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to delete member. Please try again." }
    }
}

export async function get_tasks(search?: TaskSearch): Promise<Task[]> {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const projectIds = search?.project_id
            ? search.project_id.map(id => `project_id=${id}`).join("&")
            : "";

        const param = `${projectIds}`
            + `${search?.title ? `&title=${search.title}` : ""}`
            + `${search?.phase ? `&phase=${search.phase}` : ""}`
            + `${search?.status ? `&status=${search.status}` : ""}`
            + `${search?.today ? `&today=${search.today}` : ""}`
            + `${search?.start_date ? `&start_date=${search.start_date}` : ""}`
            + `${search?.due_date ? `&due_date=${search.due_date}` : ""}`
            + `${search?.offset ? `&offset=${search.offset}` : ""}`
            + `${search?.limit ? `&limit=${search.limit}` : ""}`;

        const res = await fetch(`${TASK_API}/api/v1/tasks/?${param}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            }
        })
        if (!res.ok) {
            throw new Error("Failed to fetch tasks.");
        }

        const data = await res.json();
        return data;
    } catch (err) {
        logger.error(`Error during fetching tasks. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return [];
    }
}

export async function add_tasks(project_id: number, created_by: number, formData: FormData) {
    const rawFormData: { project_id: number, created_by: number, title: string, phase: string, status: string, description?: string, start_date?: string, due_date?: string } = {
        project_id: project_id,
        created_by: created_by,
        title: (formData.get('title') as string).trim(),
        phase: (formData.get('phase') as string).trim(),
        status: (formData.get('status') as string).trim()
    }

    const description = formData.get('description') as string
    if (description)
        rawFormData.description = description;

    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('due_date') as string;
    if (startDate && endDate) {
        rawFormData.start_date = startDate;
        rawFormData.due_date = endDate;
    }
    const rawFormDataJson = JSON.stringify(rawFormData)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${TASK_API}/api/v1/tasks`, {
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
            return { success: false, message: errorData.message || "Failed to add task. Please try again." }
        }

        return { success: true, message: "Task successfully added." }
    } catch (err) {
        logger.error(`Error during task creation for project ID: ${project_id} by user ID: ${created_by}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to add task. Please try again." }
    }
}

export async function edit_tasks(task_id: number, formData: FormData) {
    const rawFormData: { title: string, phase: string, status: string, description?: string, start_date?: string, due_date?: string } = {
        title: (formData.get('title') as string).trim(),
        phase: (formData.get('phase') as string).trim(),
        status: (formData.get('status') as string).trim()
    }

    const description = formData.get('description') as string
    if (description)
        rawFormData.description = description;

    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('due_date') as string;
    if (startDate && endDate) {
        rawFormData.start_date = startDate;
        rawFormData.due_date = endDate;
    }
    const rawFormDataJson = JSON.stringify(rawFormData)

    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${TASK_API}/api/v1/tasks/${task_id}`, {
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
            return { success: false, message: errorData.message || "Failed to edit task. Please try again." }
        }

        return { success: true, message: "Task successfully updated." }
    } catch (err) {
        logger.error(`Error during task update for task ID: ${task_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to edit task. Please try again." }
    }
}

export async function delete_task(task_id: number) {
    try {
        const cookieStore = (await cookies()).get('jwt');
        const res = await fetch(`${TASK_API}/api/v1/tasks/${task_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${cookieStore?.value}`
            },
            credentials: 'include'
        })
        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Failed to delete task. Please try again." }
        }

        return { success: true, message: "Task successfully deleted." }
    } catch (err) {
        logger.error(`Error during task deletion for task ID: ${task_id}. Message: ${err instanceof Error ? err.message : "Unknown error"}`);
        logger.error(`Stack trace: ${err instanceof Error ? err.stack : "No stack trace available"}`);

        return { success: false, message: "Failed to delete task. Please try again." }
    }
}