interface RadioButtonProps {
  id: string;
  name: string;
  label: string;
  checked?: boolean;
}
const RadioButton = ({ id, name, label, checked }: RadioButtonProps) => {
  return (
    <>
      <div className="flex items-center custom-radio-btn">
        <input
          id={id}
          type="radio"
          name={name}
          className="hidden"
          checked={checked}
        />
        <label
          htmlFor={id}
          className="flex items-center cursor-pointer text-sm"
        >
          <span className="w-5 h-5 inline-block mr-1 rounded-full border border-grey"></span>
          {label}
        </label>
      </div>
    </>
  );
};
export default RadioButton;
