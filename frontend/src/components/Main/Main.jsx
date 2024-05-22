import React, { useEffect } from 'react'
import TopBar from '../TopBar/TopBar'
import { Avatar, TextField, Button, Dialog, DialogActions, DialogTitle } from '@mui/material'
import { useState } from 'react';
import { storage } from '../../lib/firebase';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { useLocalContext } from '../../context/context';
import { collection, deleteDoc, doc, setDoc, Timestamp, addDoc, onSnapshot } from 'firebase/firestore';
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
import Announcements from '../Announcements/Announcements';
import { FaPlus } from "react-icons/fa6";
import AssignmentForm from '../AssignmentForm/AssignmentForm';
import { MainTabs } from '../index';

const Main = ({ classData }) => {
    // console.log(classData.call);
    const navigate = useNavigate();
    const { loggedInMail, loggedInUser, setCallClass, callClass, setAssignmentDialog } = useLocalContext();
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
    const [postCount, setPostCount] = useState(0)
    const [assignmentEl, setAssignmentEl] = useState(null);

    const handleCloseAssignment = () => setAssignmentEl(null);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }
    const handleUpload = (e) => {
        e.preventDefault();
        if (!file) {
            console.error("No file selected for upload");
            return;
        }

        console.log("Reference created");
        const uploadFile = ref(storage, `files/${file.name}`);
        const uploadPost = uploadBytesResumable(uploadFile, file);
        setShowInput(false);

        uploadPost.on(
            'state_changed',
            null,  // We ignore progress updates for now
            (error) => {
                console.error('Error uploading file:', error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadPost.snapshot.ref);
                    console.log('File available at', downloadURL);

                    // Use setPostCount to update the state correctly
                    setPostCount((prevCount) => {
                        const newCount = prevCount + 1;
                        const mainDoc = doc(db, 'announcments/classes');
                        const childDoc = doc(mainDoc, `${classData.id}/${newCount}`);
                        const time = Timestamp.fromDate(new Date());
                        const docData = {
                            timestamp: time.seconds,
                            imageUrl: downloadURL,
                            text: inputValue,
                            sender: loggedInMail
                        };

                        setDoc(childDoc, docData)
                            .then(() => {
                                console.log('Document successfully written!');
                            })
                            .catch((error) => {
                                console.error('Error writing document:', error);
                            });

                        return newCount;  // Return the updated count
                    });
                } catch (error) {
                    console.error('Error getting download URL:', error);
                }
            }
        );
    };

    const handleAssignment = () => {
        handleCloseAssignment();
        setAssignmentDialog(true);
    }

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

    const leaveClass = async (e) => {
        e.preventDefault();

        // Check if classData is defined and has an id property
        if (classData && classData.id) {
            const id = classData.id;
            const mainDoc = doc(db, `JoinedClasses/${loggedInMail}`);
            const childDoc = doc(mainDoc, `classes/${id}`);

            try {
                deleteDoc(childDoc);
                console.log("Class left successfully");
                navigate('/');
            } catch (error) {
                console.error("Error leaving class:", error);
            }
        } else {
            console.error("classData is not defined or does not have an id property");
        }
    };


    useEffect(() => {
        const callRef = collection(db, `Calls`);
        const unsubscribe = onSnapshot(callRef, (querySnapshot) => {
            const documentsData = [];
            console.log(querySnapshot.docs);
            querySnapshot.forEach((doc) => {
                documentsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            // setCreatedClasses(documentsData);
        });
        return () => unsubscribe();
    }, [])

    const tabs = [
        {
            id: 'announcements', title: 'Announcements',
            content: <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex-grow flex border-2 cursor-pointer border-[#1174b1] py-6 h-[4rem] sm:h-[8rem] items-center gap-4 p-4 rounded-md shadow-md shadow-black" onClick={() => setShowInput(true)}>
                    {showInput ? (
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
                        </div>
                    ) : (
                        <>
                            <Avatar />
                            <p>Announce Something to your Class</p>
                        </>
                    )}
                </div>
                <div className="w-full flex flex-col gap-2 sm:w-[53rem] "><Announcements classData={classData} />
                </div>
            </div>
        },
        { id: 'classWork', title: 'Classwork', content: <p>Content for Classwork</p> },
        { id: 'people', title: 'People', content: <p>Content for People</p> },
        { id: 'group', title: 'Group', content: <p>Content for Group</p> },
    ];

    return (
        <div className="sm:w-full w-[35rem]">
            <TopBar />
            <div className="flex mt-[6rem] flex-col gap-6  items-center pt-[1.2rem] w-full ">
                <div className="rounded-md bg-gradient-to-r from-[#07314B] via-[#1f5374] to-[#1174b1] text-white w-[30rem] sm:w-[70rem] sm:h-[11rem] flex justify-between p-6">
                    <div>
                        <h1 className='font-bold text-3xl sm:text-4xl'>{classData.courseName}</h1>
                        <h1 className='mt-[0.2rem]'>{classData.className} {classData.section}</h1>
                        <h2 className='font-bold text-sm mt-3'>Class Code:</h2>
                        <h2>{classData.id}</h2>
                    </div>
                    {currentMail === classOwnerMail ? (
                        <div className="text-4xl cursor-pointer">
                            <IoMdMore onClick={handleClick} />
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => setGradeOpen(true)}><AiOutlinePieChart />&nbsp;Grading</MenuItem>
                                <MenuItem onClick={() => setEditOpen(true)}><GoPencil />&nbsp;Edit Class</MenuItem>
                                <MenuItem onClick={handleDelete}><MdDeleteOutline />&nbsp;Delete Class</MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <div className="text-4xl cursor-pointer">
                            <IoMdMore onClick={handleClick} />
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={leaveClass}><IoExitOutline />&nbsp;Leave Class</MenuItem>
                            </Menu>
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row sm:px-[8rem] gap-4 w-full">
                    <div className="flex flex-col gap-2 sm:w-[14rem]">
                        <div className="border-2 p-4 rounded-md">
                            <h1 className='text-md font-semibold'>Upcoming</h1>
                            <p>No Work Due</p>
                        </div>
                        <div className="border-2 p-4 flex flex-col items-center gap-2 rounded-md">
                            <h1 className='text-md font-semibold'>AU Meet</h1>
                            {classData.call ? (
                                <Link onClick={() => setCallClass(classData.id)} to={`${classData.call}`} className='bg-gradient-to-r from-[#07314B] via-[#1f5374] to-[#1174b1] text-white font-bold text-lg text-center px-3 py-2 rounded-md w-[10rem]'>Join Now</Link>
                            ) : (
                                <Link to='/call' onClick={() => setCallClass(classData.id)} className='bg-gradient-to-r from-[#07314B] via-[#1f5374] to-[#1174b1] text-white font-bold text-lg text-center px-3 py-2 rounded-md w-[10rem]'>Create Now</Link>
                            )}
                        </div>
                    </div>
                    <MainTabs tabs={tabs} />
                </div>
            </div>
            <button onClick={handleAssignment} className='rounded-full shadow-xl font-extralight border-2 text-3xl p-3 fixed bottom-7 right-7' ><FaPlus /></button>
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                aria-labelledby='dialog-title'
            >
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
                <div className="form p-4">
                    <h2 className='font-bold'>Grading System (Total 100%)</h2>
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
            <AssignmentForm />
        </div>
    );
}

export default Main