import React, { useState } from 'react';
import './login.css';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useUserStore } from '../../lib/userStore';

const Login = () => {
    const [avatar, setAvatar] = useState({ file: null, url: "" });
    const [loading, setLoading] = useState(false);
    const { fetchUserInfo } = useUserStore();

    // Handle avatar file selection
    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    // Upload avatar to Cloudinary
    const uploadAvatar = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await response.json();
            return data.secure_url;
        } catch (err) {
            console.error("Avatar upload error:", err);
            toast.error("Failed to upload avatar.");
            return "";
        }
    };

    // Register a new user
    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            setLoading(true);
            const res = await createUserWithEmailAndPassword(auth, email, password);

            // Upload avatar if exists
            const avatarUrl = avatar.file ? await uploadAvatar(avatar.file) : "";

            // Store user details in Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                id: res.user.uid,
                avatar: avatarUrl,
                blocked: [],
            });

            // Initialize empty chat list for the new user
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [] // Ensure empty chat list for new users
            });

            await fetchUserInfo(res.user.uid);
            toast.success("Account created successfully! You can now log in.");
        } catch (err) {
            console.error('Registration error:', err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Login an existing user
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            const res = await signInWithEmailAndPassword(auth, email, password);

            // Check if the user has any existing chats
            const userChatDoc = await getDoc(doc(db, "userchats", res.user.uid));
            if (userChatDoc.exists()) {
                const chats = userChatDoc.data().chats;
                if (chats.length === 0) {
                    console.log("No chats found. Start adding friends!");
                } else {
                    console.log("Chats loaded successfully.");
                }
            }

            await fetchUserInfo(res.user.uid);
            toast.success("Login successful!");
        } catch (err) {
            console.error('Login error:', err);
            toast.error("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login'>
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" name="email" placeholder='Enter email' required />
                    <input type="password" name='password' placeholder='Enter password' required />
                    <button disabled={loading}>{loading ? 'Loading...' : 'Sign In'}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img
                            src={avatar.url || "./avatar.png"}
                            alt="Avatar"
                            onError={(e) => { e.target.src = "./avatar.png"; }}
                        />
                        Upload an image
                    </label>
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleAvatar}
                    />
                    <input type="text" name="username" placeholder='Enter username' required />
                    <input type="text" name="email" placeholder='Enter email' required />
                    <input type="password" name="password" placeholder='Enter password' required />
                    <button disabled={loading}>{loading ? 'Loading...' : 'Sign Up'}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
