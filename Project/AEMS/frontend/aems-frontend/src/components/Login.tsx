import { useState } from 'react'

export const Login = () => {
    const [username, setUsername] = useState('')
    return (
        <div>
            <span>Login</span>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <button onClick={() => alert(`Logging in as ${username}`)}>Submit</button>
            <input
                type="password"
                placeholder="Password"
            />
        </div>
    )
}