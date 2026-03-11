import React, { useState } from 'react';

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const UserAvatar = ({ user, className = "w-8 h-8 rounded-xl", style = {} }) => {
    const [imgError, setImgError] = useState(false);

    if (!user) return null;

    if (user.image && !imgError) {
        return (
            <img 
                src={user.image} 
                alt={user.name} 
                className={`${className} object-cover flex-shrink-0`} 
                style={style}
                onError={() => { 
                    setImgError(true);
                }} 
            />
        );
    }

    // Default to initials
    return (
        <div 
            className={`${className} flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold uppercase flex-shrink-0`}
            style={style}
            title={user.name}
        >
            {getInitials(user.name)}
        </div>
    );
};

export default UserAvatar;
