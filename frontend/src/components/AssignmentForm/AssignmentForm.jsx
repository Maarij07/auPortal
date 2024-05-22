import React, { useState } from 'react'
import { useLocalContext } from '../../context/context'
import { Button, Dialog, Slide } from '@mui/material';
import { Close } from '@mui/icons-material';
import img1 from '../../assets/assignment1.svg'
import img2 from '../../assets/assignment2.svg'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
});

const AssignmentForm = () => {

    const [formAssignmentNo, setFormAssignmentNo] = useState('');
    const [formAssignmentName, setFormAssignmentName] = useState('');
    const [formMarks, setFormMarks] = useState(0);
    const [formDeadline, setFormDeadline] = useState(new Date());
    const [formType, setFormType] = useState('individual');
    const [assignmentFile, setAssignmentFile] = useState(null);

    const { assignmentDialog, setAssignmentDialog } = useLocalContext();
    return (
        <div className="">
            <Dialog fullScreen open={assignmentDialog} onClose={() => setAssignmentDialog(false)} TransitionComponent={Transition}>
                <div className="">
                    <div className="flex w-full justify-between p-4 border-b-2 border-[#cfcecd] shadow-sm" >
                        <div className="joinClass cursor-pointer" onClick={() => setAssignmentDialog(false)}>
                            <Close />
                        </div>
                        <Button onClick={() => { }} className='font-bold' variant="contained" color="primary">
                            Assign
                        </Button>
                    </div>
                    <div className="flex w-full">
                        <div className="border-r h-[36rem] flex items-center justify-center w-[61rem]">
                            <div className='w-[48rem] h-[30rem] '>
                                <img className='relative top-0 z-0' src={img1} alt="" width={770} />
                                <div className="absolute top-[11rem] left-[12rem] sm:w-[37rem] sm:h-[24.5rem] bg-[#FFFAFA] opacity-10"></div>
                                <div className="absolute top-[11rem] flex flex-col items-center justify-center gap-8 left-[12rem] sm:w-[37rem] sm:h-[24.5rem] text-white p-4 z-10">
                                    <p className='opacity-100  font-bold text-3xl text-center'>Assignment Form</p>
                                    <form className='flex flex-col gap-4 w-[23rem]' >
                                        <div className="flex flex-col ">
                                            <label>Assignment Number</label>
                                            <input value={formAssignmentNo} onChange={(e) => setFormAssignmentNo(e.target.value)} className='bg-transparent border-b' type="text" />
                                        </div>
                                        <div className="flex flex-col ">
                                            <label>Assignment Name</label>
                                            <input value={formAssignmentName} onChange={(e) => setFormAssignmentName(e.target.value)} className='bg-transparent border-b' type="text" />
                                        </div>
                                        <div className="flex flex-col ">
                                            <label>Marks</label>
                                            <input value={formMarks} onChange={(e) => setFormMarks(e.target.value)} className='bg-transparent border-b' type="text" />
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </div>
                        <div className="w-[24.4rem] flex items-center justify-center">
                            <div className="w-[22rem]">
                                <img className='' src={img2} alt="" width={770} />
                                <div className="absolute top-[10rem] flex flex-col items-center justify-center gap-8 left-[53.5rem] sm:w-[37rem] sm:h-[24.5rem] text-white p-4 z-10">
                                    <form className='flex flex-col gap-4 w-[17rem]' >
                                        <div className="flex flex-col ">
                                            <label>Deadline</label>
                                            <input value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} className='bg-[#FFFAFA] opacity-30 h-[2rem]' type="date" />
                                        </div>
                                        <div className="flex text-black flex-col ">
                                            <label>Type</label>
                                            <select id="type" class="bg-[#FFFAFA] opacity-30 h-[2rem]" onChange={(e)=>setFormType(e.target.value)}>
                                                <option value="individual" selected={formType === 'individual'}>Individual</option>
                                                <option value="group" selected={formType === 'group'}>Group</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col ">
                                            <label>Upload File</label>
                                            <input className='bg-[#FFFAFA] opacity-30 h-[2rem]' type="file" />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AssignmentForm