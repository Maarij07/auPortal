import React, { useState } from 'react';
import { useLocalContext } from "../../context/context";
import { Button, Dialog, DialogActions, TextField } from '@mui/material';
import { v4 as uuidV4 } from 'uuid';
import { doc, setDoc } from 'firebase/firestore';
import db from '../../lib/firebase';

const createClass = () => {
    const { createClassDialog, setCreateClassDialog, loggedInMail, loggedInUser } = useLocalContext();
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [courseName, setCourseName] = useState('');

    const addClass = (e) => {
        e.preventDefault();
        const id = uuidV4();
        const mainDoc = doc(db, `CreatedClasses/${loggedInMail}`);
        const childDoc = doc(mainDoc, `classes/${id}`);
        const docData = {
            owner: loggedInMail,
            className: className,
            section: section,
            courseName: courseName,
            teacher: loggedInUser.displayName,
            id: id
        };
        setDoc(childDoc, docData);
        setCreateClassDialog(false);
    }
    return (
        <div className="">
            <Dialog
                onClose={() => setCreateClassDialog(false)}
                aria-labelledby="customized-dialog-title"
                open={createClassDialog}
                maxWidth="lg"
            >
                <div className="form p-4">
                    <h2 className='font-bold'>Create Class</h2>
                    <div className="p-4 flex flex-col gap-2">
                        <TextField id="filled-basic" value={courseName} onChange={(e) => setCourseName(e.target.value)} label="Course Name *" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={section} onChange={(e) => setSection(e.target.value)} label="Section" variant='filled' className='w-[30rem]' />
                        <TextField id="filled-basic" value={className} onChange={(e) => setClassName(e.target.value)} label="Class Name *" variant='filled' className='w-[30rem]' />
                    </div>
                    <DialogActions>
                        <Button onClick={addClass} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    )
}

export default createClass;