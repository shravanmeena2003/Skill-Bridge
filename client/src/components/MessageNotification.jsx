import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';

const MessageNotification = ({ companyToken, backendUrl }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/messages/unread`,
                {
                    headers: {
                        'Authorization': `Bearer ${companyToken}`,
                        'token': companyToken
                    }
                }
            );

            if (data.success) {
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return unreadCount > 0 ? (
        <div className="relative inline-block">
            <img src={assets.message_icon} alt="Messages" className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
            </span>
        </div>
    ) : (
        <img src={assets.message_icon} alt="Messages" className="w-6 h-6" />
    );
};

export default MessageNotification;