import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SelectUsers } from './store/userSlice';
import { ClassCard, Home, Login, Signup ,ZegoCloud,ForgotPassword,UserProfile} from './components/index';
import { useLocalContext } from './context/context';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import db from './lib/firebase';
import {Main} from './components/index';

function App() {
  const user = useSelector(SelectUsers);
  let id=null;

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

  if (user.currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          {createdClasses.map((item) => (
            <Route key={item.id} exact path={`/${item.id}`} element={<Main classData={item} />}>
            </Route>
          ))}
          {joinedClasses.map((item) => (
            <Route key={item.id} exact path={`/${item.id}`} element={<Main classData={item} />}>
            </Route>
          ))}
          <Route index element={<Home />} />
          <Route path='/call' element={<ZegoCloud/>} />
          <Route path='/settings' element={<UserProfile/>}></Route>
          <Route path='*' element={<div>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    );
  } else {
    return (
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotPassword" element={<ForgotPassword/>} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
