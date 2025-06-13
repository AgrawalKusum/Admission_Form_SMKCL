import React from 'react';
import {auth, googleProvider} from '../config/firebase';
import {useState} from 'react';
import {createUserWithEmailAndPassword, signInWithPopup, signOut} from 'firebase/auth'; 
const Auth = () => {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");

    const signIn = async () =>{
        try{
            await createUserWithEmailAndPassword(auth, email, password)
    }catch(err){
        console.error(err);
    }
        };

    const signInGoogle = async () => {
        try{
            await signInWithPopup(auth, googleProvider);
    }catch(err){
        console.error(err);
    }
    };
    const logOut = async () => {
        try{
            await signOut(auth);
    }catch(err){
        console.error(err);
    }
    };
       
        
    return(
        <div>
            <input placeholder="Email..." 
            onChange={(e)=> setEmail(e.target.value)}/>
            <input placeholder="Password..." type="password" 
            onChange={(e)=> setPassword(e.target.value)}/>
            <button onClick={signIn}>SignIn</button>

            <button onClick={signInGoogle}> Sign In With Google</button>
            <button onClick={logOut}>LogOut</button>
        </div>
    );
};

export default Auth;