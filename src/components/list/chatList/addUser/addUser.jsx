import React, { useState } from 'react';
import './adduser.css';
import { arrayUnion, collection, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { doc } from 'firebase/firestore';
import { useUserStore } from '../../../../lib/userStore';

const AddUser = () => {
    const [user, setUser] = useState(null);  // State to store the searched user
    const { currentUser } = useUserStore();

    // Async function to handle user search
    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("userName");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));  
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();  
                setUser(userData);  // Store the entire user data
            } else {
                setUser(null);  // Clear user if no match found
                alert("User not found");
            }
        } catch (err) {
            console.error("Error fetching user: ", err);
        }
    };

    // Async function to handle adding a new chat
    const handleAdd = async () => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        
        try {
            const newChatRef = doc(chatRef);  // Create a new chat document reference
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            // Update receiver's chat list
            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            });

            // Update current user's chat list
            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })
            });

            alert("User added successfully!");
        } catch (err) {
            console.error("Error adding user to chat: ", err);
        }
    };

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username' name='userName' required />
                <button type="submit">Search</button>
            </form>
            {user && (
                <div className="user">
                    <div className="detail">
                        <img
                            src={user.avatar || "./avatar.png"}
                            alt="User Avatar"
                            onError={(e) => { e.target.src = "./avatar.png"; }}  // Fallback to default avatar on error
                        />
                        <span>{user.username || "Unknown User"}</span>
                    </div>
                    <div className="button" onClick={handleAdd}>Add User</div>
                </div>
            )}
        </div>
    );
};

export default AddUser;
