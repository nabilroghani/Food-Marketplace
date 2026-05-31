import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userData } = useSelector((state) => state.user);

    useEffect(() => {
        // FIXED: Ek hi object ke andar saari configurations pass ki hain aur polling ko priority di hai
        const socketInstance = io("https://nabilroghani-beanverse.hf.space", {
            transports: ["polling", "websocket"],
            withCredentials: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            if (userData?._id) {
                socketInstance.emit('identity', { userId: userData._id });
            }
        });

        return () => socketInstance.disconnect();
    }, [userData?._id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);