import React from 'react'
import img from "../../assets/logo.png";
import { Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import { SelectUsers } from '../../store/userSlice';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TopBar = () => {
    const currentUser = useSelector(SelectUsers);
    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        if (currentUser?.currentUser?.email) {
            const email = currentUser.currentUser.email;
            const atIndex = email.indexOf('@');
            const beforeAt = email.substring(0, atIndex);
            const isNotNumeric = /\D/.test(beforeAt); // Checks if any character before @ is non-numeric
            if (isNotNumeric) {
                setStudentId(null);
            } else {
                setStudentId(beforeAt);
            }
        } else {
            setStudentId(null);
        }
    }, [currentUser]);

    return (
        <div className="w-full flex border-b-2 justify-between px-10 h-[5rem]">
            <Link to='/' className="flex items-center">
                <img src={img} alt="" width={90} />
                <p className='font-bold text-3xl'>AU Classroom</p>
            </Link>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className='text-xl font-semibold'>{currentUser?.currentUser.name}</p>
                    <p>{studentId}</p>
                </div>
                <Avatar src={currentUser?.currentUser?.photo} sx={{ width: 48, height: 48 }} />
            </div>
        </div>
    )
}

export default TopBar