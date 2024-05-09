import { configureStore } from "@reduxjs/toolkit";
import usersReducer from './userSlice.js';

export default configureStore({
    reducer:{
        users: usersReducer
    }
})