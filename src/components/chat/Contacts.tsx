import { TUserWithChat } from '@/helper/type';
import React from 'react';
import User from './User';

interface ContactsProps {
  users: TUserWithChat[];
  currentUser: TUserWithChat;
  setLayout: (layout: boolean) => void;
  setReceiver: (reciever: { receiverId: string; receiverName: string; receiverImage: string }) => void;
}

const Contacts = ({ users, currentUser, setLayout, setReceiver }: ContactsProps) => {
  // 중복 제거
  const uniqueUsers = users.reduce<TUserWithChat[]>((acc, user) => {
    if (!acc.find((u) => u.id === user.id)) {
      acc.push(user);
    }
    return acc;
  }, []);

  const filterMessages = (userId: string, userName: string | null, userImage: string | null) => {
    setReceiver({
      receiverId: userId,
      receiverName: userName || '',
      receiverImage: userImage || '',
    });
  };

  return (
    <div className='w-full overflow-auto h-[calc(100vh_-_56px)] border-[1px]'>
      <h1 className='m-4 text-2xl font-semibold'>Chat</h1>
      <hr />
      <div className='flex flex-col'>
        {uniqueUsers.length > 0 &&
          uniqueUsers
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  filterMessages(user.id, user.name!, user.image!);
                  setLayout(true);
                }}
              >
                <User user={user} currentUserId={currentUser.id} />
              </div>
            ))}
      </div>
    </div>
  );
};

export default Contacts;
