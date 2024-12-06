import React, { useEffect, useState } from 'react'
import './css/Login.css'

const Login = () => {
    const[loginTypes, setLoginTypes] = useState(["Email", "Phone Number", "UserName", "FaceBook"]);
    const[item, setItem] = useState("");
    const handleClick = (item) =>{
        console.log(item)
        setItem(item);
    }
  return (
    <div className='login-page'>
    <h1 className='app-title'>Go Laundry</h1>
    <section className='login-card'>
        <p className='authenticate-text'>Authenticate and enjoy the services</p>
        <p>Use one of the option to login</p>
        <span className='item-display'>{item}</span>
        <section className='login-types'>
            {loginTypes && loginTypes.map((loginType, index) =>(
                <React.Fragment key={index}>
                    <button className='login-item'>{loginType}</button>
                    {index < loginTypes.length-1  && <span>OR</span>}
                </React.Fragment>
            ))}
        </section>
        <br/><br/>
        <span className='login-link'>Already have an account click here to login ?</span>
    </section>
    </div>
  )
}



export default Login