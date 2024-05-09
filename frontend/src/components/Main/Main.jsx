import React from 'react'
import TopBar from '../TopBar/TopBar'
import { Avatar, TextField, Button } from '@mui/material'
import { useState } from 'react';
import { storage } from '../../lib/firebase';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { useLocalContext } from '../../context/context';
import { collection, doc, setDoc, Timestamp, addDoc } from 'firebase/firestore';
import db from '../../lib/firebase';
import QRCode from 'qrcode.react';
import { Link } from 'react-router-dom';
import { IoMdMore } from "react-icons/io";
import { Menu, MenuItem } from '@mui/material';
import { GoPencil } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";

const Main = ({ classData }) => {

    const { loggedInMail } = useLocalContext();
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState();
    const [file, setFile] = useState(null);
    // const classQr = classData.id;
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }
    const handleUpload = () => {
        console.log("reference created");
        const uploadFile = ref(storage, `files/${file.name}`);
        const uploadPost = uploadBytesResumable(uploadFile, file);

        uploadPost.on('state_changed', () => {
            // This function will be called multiple times during the upload process,
            // but we only need to handle the completion once, so we ignore it here.
        }, (error) => {
            console.error('Error uploading file:', error);
        }, () => {
            // The upload is complete, now we can get the download URL
            getDownloadURL(uploadPost.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);

                // Now you can proceed with storing the data to Firestore
                const mainDoc = doc(db, 'announcments/classes');
                const childDoc = doc(mainDoc, `posts/${classData.id}`);
                const time = Timestamp.fromDate(new Date());
                const docData = {
                    timestamp: time.seconds,
                    imageUrl: downloadURL,
                    text: inputValue,
                    sender: loggedInMail
                };
                setDoc(childDoc, docData).then(() => {
                    console.log('Document successfully written!');
                }).catch((error) => {
                    console.error('Error writing document:', error);
                });
            }).catch((error) => {
                console.error('Error getting download URL:', error);
            });
        });
    };

    return (
        <div className="">
            <TopBar />
            <div className="flex flex-col gap-6 items-center pt-[1.2rem]">
                <div className="rounded-md bg-[#45748b] text-white w-[70rem] h-[11rem] flex justify-between p-6">
                    <div className="">
                        <h1 className='font-bold text-4xl'>{classData.courseName}</h1>
                        <h1 className='mt-[0.2rem]'>{classData.className}  {classData.section}</h1>
                        <h2 className='font-bold text-sm mt-3'>Class Code:</h2>
                        <h2>{classData.id}</h2>
                    </div>
                    <div className="text-4xl cursor-pointer">
                        <IoMdMore onClick={handleClick} />
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => { }}><GoPencil/>&nbsp;Edit Class</MenuItem>
                            <MenuItem onClick={() => { }}> <MdDeleteOutline/>&nbsp;Delete Class</MenuItem>
                        </Menu>
                    </div>

                </div>
                <div className="flex gap-4">
                    <div className="flex sm:flex-col gap-2">
                        <div className="border-2 p-4 rounded-md sm:w-[14rem]">
                            <h1 className='text-md font-semibold'>Upcoming</h1>
                            <p>No Work Due</p>
                        </div>
                        <div className="border-2 p-4 flex flex-col items-center gap-2 rounded-md sm:w-[14rem]">
                            <h1 className='text-md font-semibold'>AU Meet</h1>
                            <Link to='/call' className='bg-[#45748b] text-white font-bold text-lg text-center px-3 py-2 rounded-md w-[10rem]'>Join Now</Link>
                        </div>
                    </div>
                    <div className="flex border-2 cursor-pointer sm:h-[8rem] items-center gap-4 p-4 rounded-md sm:w-[55rem]" onClick={() => setShowInput(true)}>
                        {showInput ?
                            <div className='w-full'>
                                <TextField
                                    multiline
                                    label="Announce Something to your class"
                                    variant='filled'
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className='w-full p-4'
                                />
                                <div className="flex justify-between sm:mt-[1.2rem]">
                                    <input onChange={handleChange} type="file" color='primary' variant="outlined" />
                                    <div className="flex">
                                        <Button onClick={() => setShowInput(false)}>Cancel</Button>
                                        <Button onClick={handleUpload} color='primary' variant='contained'>Post</Button>
                                    </div>
                                </div>
                            </div> :
                            (
                                <>
                                    <Avatar />
                                    <p>Announce Something to your Class</p>
                                </>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Main