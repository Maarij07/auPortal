import React from 'react'
import { useState, useEffect } from "react";
import db from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Avatar } from '@mui/material';

const Announcements = ({ classData }) => {
    const [announcement, setAnnouncement] = useState([]);

    useEffect(() => {
        if (classData) {
            const announcementRef = collection(db, `announcments/classes/${classData.id}`);
            const unsubscribe = onSnapshot(announcementRef, (querySnapshot) => {
                const documentsData = [];
                querySnapshot.forEach((doc) => {
                    console.log("Bus");
                    documentsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setAnnouncement(documentsData);
                console.log(announcement);
            });
            return () => unsubscribe();
        }
    }, [classData])

    return (
        <div className='flex flex-col gap-3  ' >
            {
                announcement.map((item) => (
                    <div className="w-full bg-white  sm:p-4 border-2 rounded-md">
                        <div className="flex gap-4 sm:pb-4 items-center">
                            <Avatar style={{width:40, height:40}} />
                            {item.sender}
                        </div>
                        <p >{item.text}</p>
                        <img src={item.imageUrl} alt={item.text} width={200} />
                    </div>
                ))
            }
        </div>
    )
}

export default Announcements