import React, { useEffect, useState, useRef } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { uploadImageToCloudinary } from '../../lib/cloudinary';


const Chat = () => {
    const [chat, setChat] = useState(null);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null); // State for image upload
    const endRef = useRef(null);
    const { chatId, user } = useChatStore();
    const { currentUser } = useUserStore();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    useEffect(() => {
        if (!chatId) return;
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });
        return () => unSub();
    }, [chatId]);

    const handleEmoji = (emojiObject) => {
        setText((prevText) => prevText + emojiObject.emoji);
    };

    const handleSend = async (imageUrl = null) => {
        if (text === "" && !imageUrl) return;

        try {
            const newMessage = {
                senderId: currentUser.id,
                text,
                image: imageUrl, // Attach image URL if present
                createdAt: new Date().toISOString(),
            };

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion(newMessage),
            });

            setText(""); // Clear the input after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const imageUrl = await uploadImageToCloudinary(file);
            await handleSend(imageUrl); // Send image as a message
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
                    <div className="texts">
                        <span>{user?.username || "Unknown User"}</span>
                        <p>{user?.status || "Online"}</p>
                    </div>
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div
                        className={`message ${message.senderId === currentUser.id ? "own" : ""}`}
                        key={index}
                    >
                        <div className="texts">
                            {/* <img
                                src={message.senderId === currentUser.id ? currentUser.avatar : user?.avatar || "./avatar.png"}
                                alt="User Avatar"
                            /> */}
                            {message.image && (
                                <img src={message.image} alt="Uploaded" className="uploaded-image" />
                            )}
                            <p>{message.text}</p>
                            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="imageUpload">
                        <img src="./img.png" alt="Upload Image" className="icon" />
                    </label>
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                    <img src="./camera.png" alt="Camera" className="icon" />
                    <img src="./mic.png" alt="Mic" className="icon" />
                </div>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <div className="emoji">
                    <img src="./emoji.png" alt="Emoji" onClick={() => setOpen(!open)} />
                    {open && (
                        <div className="emoji-picker">
                            <EmojiPicker onEmojiClick={handleEmoji} />
                        </div>
                    )}
                </div>
                <button className="sendButton" onClick={() => handleSend()}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
