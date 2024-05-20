import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Avatar } from '@mui/material';
import { Document, Page } from 'react-pdf';
import db from '../../lib/firebase';

const Announcements = ({ classData }) => {
    const [announcement, setAnnouncement] = useState([]);

    useEffect(() => {
        if (classData) {
            const announcementRef = collection(db, `announcements/classes/${classData.id}`);
            const unsubscribe = onSnapshot(announcementRef, (querySnapshot) => {
                const documentsData = [];
                querySnapshot.forEach((doc) => {
                    documentsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setAnnouncement(documentsData);
            });
            return () => unsubscribe();
        }
    }, [classData]);

    const renderFilePreview = (fileUrl, fileType) => {
        switch (fileType) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
                return <img src={fileUrl} alt="file preview" style={{ maxWidth: '100%' }} />;
            case 'application/pdf':
                return (
                    <Document file={fileUrl}>
                        <Page pageNumber={1} />
                    </Document>
                );
            // Add cases for other file types as needed
            default:
                return <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download File</a>;
        }
    };

    return (
        <div className='flex flex-col gap-3'>
            {announcement.map((item) => (
                <div key={item.id} className="w-full bg-white sm:p-4 border-2 rounded-md">
                    <div className="flex gap-4 sm:pb-4 items-center">
                        <Avatar style={{ width: 40, height: 40 }} />
                        {item.sender}
                    </div>
                    <p>{item.text}</p>
                    {item.fileUrl && renderFilePreview(item.fileUrl, item.fileType)}
                </div>
            ))}
        </div>
    );
};

export default Announcements;
