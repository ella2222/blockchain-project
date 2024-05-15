import React from 'react';
import '../styles/Profile.css';

export const Profile = ({ userAddress }) => {
    return (
        <div className="profile-container">
            <h1>Profile</h1>
            <p>Address: {userAddress}</p>
        </div>
    );
};

export default Profile;

