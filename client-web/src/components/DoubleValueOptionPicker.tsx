import React from 'react'

interface OptionPickerProps {
    label: string
    options: { label: string; value: string | number }[]
    value: string | number 
    onChange: (value: any) => void
    className?: string
}

/**
 * A React functional component that renders a dropdown select input with a label and options.
 *
 * @param label - The label to display for the dropdown.
 * @param options - An array of options to display in the dropdown, each with a label and value.
 * @param value - The currently selected value.
 * @param onChange - A callback function that is called when the selected value changes.
 * @returns A React element representing the dropdown select input.
 */
const DoubleValueOptionPicker: React.FC<OptionPickerProps> = ({ className, label, options, value, onChange }) => {
    return (
        <div className="mb-4 flex flex-col items-start">
            <select value={value} onChange={e => onChange(e.target.value)} className={className}>
                <option value="">Select {label}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default DoubleValueOptionPicker
