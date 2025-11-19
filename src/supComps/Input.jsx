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
                required
                minLength={minLength || null}
            />
        </label>
    )
}

export default Input