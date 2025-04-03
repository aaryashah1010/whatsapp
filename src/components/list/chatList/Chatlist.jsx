import React, { useEffect, useState } from 'react';
import './chatlist.css';
import AddUser from './addUser/addUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const Chatlist = () => {
    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState([]);
    const [input, setInput] = useState("");
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    useEffect(() => {
        if (!currentUser?.id) return;

        const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            if (!res.exists()) return;

            const items = res.data().chats || [];
            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);
                const user = userDocSnap.exists() ? userDocSnap.data() : {};
                return { ...item, user };
            });

            const chatData = await Promise.all(promises);
            chatData.sort((a, b) => b.updatedAt - a.updatedAt);
            setChats(chatData);
        });

        return () => unsub();
    }, [currentUser?.id]);

    const handleSelect = async (chat) => {
        const userChats = chats.map(item => {
            const { user, ...rest } = item;
            return rest;
        });
        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;
        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        }
    };

    const filteredChats = chats.filter(c =>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div className="chatlist">
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="Search Icon" />
                    <input
                        type="text"
                        placeholder="Search"
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <img
                    src={addMode ? "./minus.png" : "./plus.png"}
                    onClick={() => setAddMode((prev) => !prev)}
                    className="add"
                    alt="Add/Remove Icon"
                />
            </div>
            {filteredChats.map(chat => (
                <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}>
                    <img src={chat.user.avatar || "./avatar.png"} alt="User Avatar" />
                    <div className="texts">
                        <span>{chat.user.username || "Unknown User"}</span>
                        {chat.user.online ? (
                            <p className="online">Online</p>
                        ) : (
                            <p className="last-seen">
                                Last seen: {new Date(chat.user.lastSeen?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                        <p>{chat.lastMessage || "No messages yet"}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
};

export default Chatlist;
