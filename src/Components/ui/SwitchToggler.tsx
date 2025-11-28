interface InterfaceSwitchToggler {
    isOn: boolean,
    onToggle: Function,
    isDisabled?: boolean,
}

const SwitchToggler = ({ isOn, onToggle, isDisabled }: InterfaceSwitchToggler) => {
    const Toggle = () => onToggle(!isOn)

    return (
        <button
            className={`toggler ${isOn ? 'on' : ''}`}
            onClick={Toggle}
            disabled={isDisabled}
        >
            <span className="toggler_box"></span>
        </button>
    )
}

export default SwitchToggler