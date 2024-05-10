import React, { useState } from 'react'
import { useLocalContext } from '../../context/context'
import { Avatar, Button, Dialog, Slide, TextField } from '@mui/material'
import { Close } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { SelectUsers } from '../../store/userSlice';
import { doc,getDoc, setDoc } from 'firebase/firestore';
import db from '../../lib/firebase';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
});

const JoinClass = () => {
    const currentUser = useSelector(SelectUsers);
    const { joinClassDialog, setJoinClassDialog ,loggedInUser } = useLocalContext();
    const [classCode,setClassCode] = useState('');
    const [email,setEmail] = useState('');
    const [error,setError] = useState();
    const [joinedData,setJoinedData]= useState();
    const [classExists,setClassExists] = useState(false);

    const handleSubmit=(e)=>{
        e.preventDefault();

        const mainDoc=doc(db,`CreatedClasses/${email}`);
        const childDoc=doc(mainDoc,`classes/${classCode}`);
        getDoc(childDoc).then((doc)=>{
            if(doc.exists() && doc.data().owner !== loggedInUser.email){
                setClassExists(true);
                setJoinedData(doc.data())
                setError(false);
            }
            else{
                setError(true)
                setClassExists(false)
                return;
            }
        })

        if(classExists=== true){
            const doc1=doc(db,`JoinedClasses/${loggedInUser.email}`)
            const doc2 = doc(doc1,`classes/${classCode}`)
            setDoc(doc2,joinedData).then(()=>{
                setJoinClassDialog(false);
            })
        }
    }

    return (
        <div className="">
            <Dialog
                fullScreen
                open={joinClassDialog}
                onClose={() => setJoinClassDialog(false)}
                TransitionComponent={Transition}
            >
                <div className="flex flex-col items-center">
                    <div className="flex w-full justify-between p-4 border-b-2 border-[#cfcecd] shadow-sm" >
                        <div className="joinClass cursor-pointer" onClick={() => setJoinClassDialog(false)}>
                            <Close />
                        </div>
                        <Button onClick={handleSubmit} className='font-bold' variant="contained" color="primary">
                            Join
                        </Button>
                    </div>
                    <div className=" border-2 rounded-md mt-4 container w-[24rem] sm:w-[33rem] p-4">
                        <p className='text-sm sm:text-lg mb-[0.8rem]'>
                            You're currently signed in as {currentUser?.currentUser?.email}
                        </p>
                        <div className="flex justify-between">
                            <div className="flex">
                                <Avatar src={currentUser?.currentUser?.photo} />
                                <div className="ml-4">
                                    <div className=" text-sm sm:text-lg font-bold">{currentUser?.currentUser?.name}</div>
                                    <div className="text-[#5f6368] text-sm sm:text-lg overflow-hidden text-ellipsis">{currentUser?.currentUser?.email}</div>
                                </div>
                            </div>
                            <Button variant='outlined' color='primary'>
                                Logout
                            </Button>
                        </div>
                    </div>
                    <div className="border-2 rounded-md mt-4 container w-[33rem] p-4">
                        <div className="text-[1.25rem] font-semibold color-[#3c4043]">
                            Class Code
                        </div>
                        <div className="">
                            Ask Your Teacher for the class code, then enter it here.
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:gap-6">
                            <TextField id="outlined-basic" label="Class Code" value={classCode} onChange={(e)=>setClassCode(e.target.value)} error={error} helperText={error &&  "No class was found"} variant="outlined" />
                            <TextField id="outlined-basic" label="owner's mail" value={email} onChange={(e)=>setEmail(e.target.value)} variant="outlined" />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default JoinClass