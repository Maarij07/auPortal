import React, { useEffect } from 'react'
import TopBar from '../TopBar/TopBar'
import { Avatar, TextField, Button, Dialog, DialogActions, DialogTitle } from '@mui/material'
import { useState } from 'react';
import { storage } from '../../lib/firebase';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { useLocalContext } from '../../context/context';
import { collection, deleteDoc, doc, setDoc, Timestamp, addDoc } from 'firebase/firestore';
import db from '../../lib/firebase';
import QRCode from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdMore } from "react-icons/io";
import { Menu, MenuItem } from '@mui/material';
import { GoPencil } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { useSelector, useDispatch } from 'react-redux';
import { SelectUsers, SelectUid, setUid } from '../../store/userSlice';
import { AiOutlinePieChart } from "react-icons/ai";
import { IoExitOutline } from "react-icons/io5";

const Main = ({ classData }) => {
    // console.log(classData.call);
    const navigate = useNavigate();
    const { loggedInMail, loggedInUser,setCallClass,callClass } = useLocalContext();
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState();
    const [file, setFile] = useState(null);
    const [editOpen, setEditOpen] = useState(false)
    const [gradeOpen, setGradeOpen] = useState(false)
    const currentUser = useSelector(SelectUsers);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const currentMail = currentUser.currentUser.email
    const classOwnerMail = classData.owner
    const classId = classData.id
    const [className, setClassName] = useState(classData.className);
    const [courseName, setCourseName] = useState(classData.courseName);
    const [creditHours, setCreditHours] = useState(classData.creditHours);
    const [assignmentWeightage, setAssignmentWeightage] = useState(0);
    const [quizWeightage, setQuizWeightage] = useState(0);
    const [midsWeightage, setMidsWeightage] = useState(0);
    const [finalWeightage, setFinalWeightage] = useState(0);
    const [projectWeightage, setProjectWeightage] = useState(0);
    const [totalWeightage, setTotalWeightage] = useState(0);
    const [disabled, setDisabled] = useState(true);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }
    const handleUpload = (e) => {
        e.preventDefault()
        console.log("reference created");
        const uploadFile = ref(storage, `files/${file.name}`);
        const uploadPost = uploadBytesResumable(uploadFile, file);
        setShowInput(false);
        console.log(showInput);
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

    const handleDelete = async (e) => {
        await deleteDoc(doc(db, `CreatedClasses/${classOwnerMail}/classes/${classId}`))
        navigate('/');
        console.log("delete command sent");
    }
    const editClass = (e) => {
        e.preventDefault();
        const id = classData.id;
        const mainDoc = doc(db, `CreatedClasses/${loggedInMail}`);
        const childDoc = doc(mainDoc, `classes/${id}`);
        const docData = {
            owner: loggedInMail,
            className: className,
            creditHours: creditHours,
            courseName: courseName,
            teacher: loggedInUser.displayName,
            id: id
        };
        setDoc(childDoc, docData, { merge: true });
        setEditOpen(false);
    }
    useEffect(() => {
        setTotalWeightage(parseInt(assignmentWeightage) + parseInt(quizWeightage) + parseInt(midsWeightage) + parseInt(finalWeightage) + parseInt(projectWeightage))
        // console.log(totalWeightage);
        if (totalWeightage == 100)
            setDisabled(false)

    }, [assignmentWeightage, quizWeightage, midsWeightage, finalWeightage, projectWeightage])

    const gradeClass = (e) => {
        e.preventDefault()
        const id = classData.id;
        const mainDoc = doc(db, `CreatedClasses/${loggedInMail}`);
        const childDoc = doc(mainDoc, `classes/${id}`);
        const docData = {
            assignmentWeightage: assignmentWeightage,
            quizWeightage: quizWeightage,
            midsWeightage: midsWeightage,
            finalWeightage: finalWeightage,
            projectWeightage: projectWeightage
        }
        setDoc(childDoc, docData, { merge: true });
        setGradeOpen(false);
    }

    const leaveClass=(e)=>{
        e.preventDefault();
        console.log("classs leaved")
    }

    return (
        <div className="">
            <TopBar />
            <div className="flex flex-col gap-6 items-center pt-[1.2rem] w-full ">
                <div className="rounded-md bg-gradient-to-r from-[#07314B] via-[#1f5374] to-[#1174b1] text-white w-[30rem] sm:w-[70rem] sm:h-[11rem] flex justify-between p-6">
                    <div className="">
                        <h1 className='font-bold text-3xl sm:text-4xl'>{classData.courseName}</h1>
                        <h1 className='mt-[0.2rem]'>{classData.className}  {classData.section}</h1>
                        <h2 className='font-bold text-sm mt-3'>Class Code:</h2>
                        <h2>{classData.id}</h2>
                    </div>
                    {currentMail == classOwnerMail ?
                        <div className="text-4xl cursor-pointer">
                            <IoMdMore onClick={handleClick} />
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { setGradeOpen(true) }}><AiOutlinePieChart />&nbsp;Grading</MenuItem>
                                <MenuItem onClick={() => { setEditOpen(true) }}><GoPencil />&nbsp;Edit Class</MenuItem>
                                <MenuItem onClick={handleDelete}> <MdDeleteOutline />&nbsp;Delete Class</MenuItem>
                            </Menu>
                        </div>:
                        <div className="text-4xl cursor-pointer">
                            <IoMdMore onClick={handleClick} />
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={leaveClass} ><IoExitOutline />&nbsp;Leave Class</MenuItem>
                            </Menu>
                        </div>
                    }
                </div>
                <div className="sm:flex-row flex-col gap-4">
                    <div className="hidden sm:flex flex-col gap-2">
                        <div className="sm:flex flex-col border-2 p-4 rounded-md sm:w-[14rem]">
                            <h1 className='text-md font-semibold'>Upcoming</h1>
                            <p>No Work Due</p>
                        </div>
                        <div className="border-2 p-4 flex flex-col items-center gap-2 rounded-md sm:w-[14rem]">
                            <h1 className='text-md font-semibold'>AU Meet</h1>
                            {classData.call ? <Link to={`${classData.call}`} className='bg-gradient-to-r from-[#07314B] via-[#1f5374] to-[#1174b1] text-white font-bold text-lg text-center px-3 py-2 rounded-md w-[10rem]'>Join Now</Link>:  <Link to='/call' onClick={()=>setCallClass(classData.id)} className='bg-gradient-to-r from-[#07314B] via-[#1f5374] to-[#1174b1] text-white font-bold text-lg text-center px-3 py-2 rounded-md w-[10rem]'>Create Now</Link>}

                        </div>
                    </div>
                    <div className="flex border-2 cursor-pointer border-[#1174b1] py-6 h-[6rem] sm:h-[8rem] items-center gap-4 p-4 rounded-md w-[30rem] sm:w-[55rem]" onClick={() => setShowInput(true)}>
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
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                aria-labelledby='dialog-title'
            >
                {/* <DialogTitle id="dialog-title">Edit Class</DialogTitle> */}
                <div className="form p-4">
                    <h2 className='font-bold'>Edit Class</h2>
                    <div className="p-4 flex flex-col gap-2">
                        <TextField id="filled-basic" value={courseName} onChange={(e) => setCourseName(e.target.value)} label="Course Name *" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={className} onChange={(e) => setClassName(e.target.value)} label="Class Name *" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} label="Credit Hours" variant='filled' className='w-[30rem]' />
                    </div>
                    <DialogActions>
                        <Button onClick={editClass} color="primary">
                            Edit
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
            <Dialog
                open={gradeOpen}
                onClose={() => setGradeOpen(false)}
                aria-labelledby='dialog-title'
            >
                {/* <DialogTitle id="dialog-title">Edit Class</DialogTitle> */}
                <div className="form p-4">
                    <h2 className='font-bold'>Grading System (Total 100%) </h2>
                    <div className="p-4 flex flex-col gap-2">
                        <TextField id="filled-basic" value={assignmentWeightage} onChange={(e) => setAssignmentWeightage(e.target.value)} label="Assignment Weightage(%)" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={quizWeightage} onChange={(e) => setQuizWeightage(e.target.value)} label="Quiz Weightage(%)" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={midsWeightage} onChange={(e) => setMidsWeightage(e.target.value)} label="Mids Weightage(%)" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={finalWeightage} onChange={(e) => setFinalWeightage(e.target.value)} label="Final Weightage(%)" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={projectWeightage} onChange={(e) => setProjectWeightage(e.target.value)} label="Project Weightage(%)" variant='filled' className='w-[30rem]' />
                    </div>
                    <DialogActions>
                        <Button onClick={gradeClass} disabled={disabled} color="primary">
                            Grade
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    )
}

export default Main