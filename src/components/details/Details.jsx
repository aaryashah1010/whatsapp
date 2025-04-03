import React, { useState, useEffect } from 'react';
import './details.css';
import { auth, db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';
import { onSnapshot, doc } from 'firebase/firestore';

const Details = () => {
    const { currentUser } = useUserStore();
    const { chatId, user } = useChatStore(); // Get the chat partner's info
    const [sharedPhotos, setSharedPhotos] = useState([]);
    const [openSettings, setOpenSettings] = useState(false);
    const [openPrivacy, setOpenPrivacy] = useState(false);
    const [openPhotos, setOpenPhotos] = useState(false);

    // Fetch the latest shared photos from the chat
    useEffect(() => {
        if (!chatId) return;
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            const chatData = res.data();
            if (chatData?.messages) {
                const photos = chatData.messages
                    .filter(msg => msg.image) // Filter messages with images
                    .slice(-3) // Get the latest 3 images
                    .reverse(); // Show the most recent first
                setSharedPhotos(photos);
            }
        });
        return () => unSub();
    }, [chatId]);

    return (
        <div className='detail'>
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="Chat Partner Avatar" />
                <h2>{user?.username || "Chat Partner"}</h2>
                <p>Stay connected and enjoy chatting with {user?.username || "your friend"}!</p>
            </div>
            <div className="info">
                <div className={`option ${openSettings ? 'open' : ''}`} onClick={() => setOpenSettings(!openSettings)}>
                    <div className="title">
                        <span>Chat Settings</span>
                        <img
                            src={openSettings ? "./arrowDown.png" : "./arrowUp.png"}
                            alt="Toggle"
                            className={openSettings ? 'rotate' : ''}
                        />
                    </div>
                    {openSettings && (
                        <p className="description">
                            Customize your chat experience, update preferences, and manage notifications.
                        </p>
                    )}
                </div>

                <div className={`option ${openPrivacy ? 'open' : ''}`} onClick={() => setOpenPrivacy(!openPrivacy)}>
                    <div className="title">
                        <span>Privacy & Help</span>
                        <img
                            src={openPrivacy ? "./arrowDown.png" : "./arrowUp.png"}
                            alt="Toggle"
                            className={openPrivacy ? 'rotate' : ''}
                        />
                    </div>
                    {openPrivacy && (
                        <p className="description">
                            Manage your privacy settings and get support for any issues.
                        </p>
                    )}
                </div>

                <div className={`option ${openPhotos ? 'open' : ''}`} onClick={() => setOpenPhotos(!openPhotos)}>
                    <div className="title">
                        <span>Shared Photos</span>
                        <img
                            src={openPhotos ? "./arrowDown.png" : "./arrowUp.png"}
                            alt="Toggle"
                            className={openPhotos ? 'rotate' : ''}
                        />
                    </div>
                    {openPhotos && (
                        <div className="photos">
                            {sharedPhotos.length > 0 ? (
                                sharedPhotos.map((photo, index) => (
                                    <div className="photoItem" key={index}>
                                        <div className="photoDetail">
                                            <img src={photo.image} alt="Shared" />
                                            <span>Recent Photo</span>
                                        </div>
                                        <a href={photo.image} download>
                                            <img src="./download.png" alt="Download" />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p>No shared photos yet.</p>
                            )}
                        </div>
                    )}
                </div>

                <button className='logout' onClick={() => auth.signOut()}>Logout</button>
            </div>
        </div>
    );
};

export default Details;
