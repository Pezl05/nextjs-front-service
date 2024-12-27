'use client'
import { useState, useEffect } from 'react'
import { get_users, User } from './actions';
import ModalAddUser from './components/ModalAddUser';
import ModalEditUser from './components/ModalEditUser';
import { formatDate } from '@/lib';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function User() {
  // const session = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addStatus, setAddStatus] = useState(false);
  const [editStatus, setEditStatus] = useState({ status: false, message: ""});
  const [editId, setEditId] = useState(Number);

  // ฟังก์ชันดึงข้อมูลผู้ใช้
  async function getUsers() {
    const data = await get_users();
    setUsers(data);
    setLoading(false);
  }

  const openEditUser = (user_id: number) => {
    setEditId(user_id);
    setShowEditModal(true);
  };

  const handleAddUser = (status: boolean) => {
    setAddStatus(status);
    setShowAddModal(false);
    getUsers();
  };

  const handleEditUser = (status: boolean, message: string) => {
    setEditStatus({status, message});
    setShowEditModal(false);
    getUsers();
  };

  // เรียกฟังก์ชัน getUsers เมื่อ component ถูกโหลด
  useEffect(() => {
    getUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status">
          <span
            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
          >Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-1 py-5 sm:px-2 lg:px-4">

      {addStatus && (

        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 flex justify-start items-center border-2 border-gray-600 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon aria-hidden="true" className="size-12 text-green-600 mr-5" />
            <div className="text-xl font-semibold text-gray-900">
              User successfully added.
            </div>
          </div>
        </div>

      )}

      {editStatus.status && (

      <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 flex justify-start items-center border-2 border-gray-600 rounded-lg">
        <div className="flex items-center">
          <CheckCircleIcon aria-hidden="true" className="size-12 text-green-600 mr-5" />
          <div className="text-xl font-semibold text-gray-900">
            { editStatus.message }
          </div>
        </div>
      </div>

      )}

      <div className='flex justify-end'>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-green-500 me-2 px-5 py-2 my-4 text-lg w-28 font-semibold text-white ring-1 drop-shadow-lg ring-gray-300 ring-inset hover:text-green-500 hover:bg-slate-50"
        >
          Add
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-100 rounded-lg">
        {users.map((user) => {
          const imageUrl = user.role === 'admin' ? '/admin.png' : '/user.png';
          return (
            <li
              key={user.email}
              onClick={() => openEditUser(user?.user_id)}
              className="flex justify-between gap-x-6 py-5 px-1 py-1 sm:px-2 lg:px-4 rounded-lg group hover:bg-gray-800 cursor-pointer shadow"
            >
              <div className="flex min-w-0 gap-x-4">
                <img alt="" src={imageUrl} className="size-12 flex-none rounded-full bg-gray-50" />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm/6 font-semibold text-gray-900 group-hover:text-white">{user.full_name}</p>
                  <p className="mt-1 truncate text-xs/5 text-gray-500 group-hover:text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="hidden shrink-0 xs:flex xs:flex-col xs:items-end">
                <p className="text-sm/6 text-gray-900 group-hover:text-white">{user.role}</p>
                <p className="mt-1 text-xs/5 text-gray-500 group-hover:text-slate-400">
                  Created at <time dateTime={user.created_at}>{formatDate(user.created_at)}</time>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {showAddModal && (
        <ModalAddUser
          open={showAddModal}
          onClose={handleAddUser} // ปิด modal
        />
      )}

      {showEditModal && (
        <ModalEditUser
          user_id={editId}
          open={showEditModal}
          onClose={handleEditUser} // ปิด modal
        />
      )}


    </div>
  );
}