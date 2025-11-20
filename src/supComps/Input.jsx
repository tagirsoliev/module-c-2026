import { useState } from "react";

const Input = ({ name, label, value, onChange, type, minLength }) => {
    return (
        <label>
            {label}
            <input
                type={type || 'text'}
                name={name}
                value={value}
                onChange={onChange}
                lang="en-GB"
                minLength={minLength || null}
            />
        </label>
    )
}

export default Input