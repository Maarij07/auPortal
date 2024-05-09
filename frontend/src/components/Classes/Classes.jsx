import React from 'react'
import ClassCard from '../ClassCard/ClassCard'
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { useLocalContext } from '../../context/context';
import { useState,useEffect } from 'react';
import db from '../../lib/firebase';

export default function Classes() {
  const { loggedInMail } = useLocalContext();
  const [createdClasses, setCreatedClasses] = useState([]);
  const [joinedClasses, setJoinedClasses] = useState([]);

  useEffect(() => {
    if (loggedInMail) {
      const classesCollectionRef = collection(db, `CreatedClasses/${loggedInMail}/classes`);
      const unsubscribe = onSnapshot(classesCollectionRef, (querySnapshot) => {
        const documentsData = [];
        querySnapshot.forEach((doc) => {
          documentsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCreatedClasses(documentsData);
      });
      return () => unsubscribe();
    }
  }, [loggedInMail]);

  useEffect(() => {
    if (loggedInMail) {
      const classesCollectionRef = collection(db, `JoinedClasses/${loggedInMail}/classes`);
      const unsubscribe = onSnapshot(classesCollectionRef, (querySnapshot) => {
        const documentsData = [];
        querySnapshot.forEach((doc) => {
          documentsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setJoinedClasses(documentsData);
      });
      return () => unsubscribe();
    }
  }, [loggedInMail])

  return (
    <div className="overflow-hidden sm:w-[54.5rem] px-6 py-4 gap-6 justify-around flex flex-wrap ">
      {createdClasses.map((item)=>(
        <ClassCard key={item.id} classData={item} />
      ))}
      {joinedClasses.map((item)=>(
        <ClassCard key={item.id} classData={item} />
      ))}
    </div>
  )
}
