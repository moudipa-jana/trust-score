interface SwitchButtonProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const SwitchButton = ({ checked = false, onChange }: SwitchButtonProps) => {
  return (
    <div>
      <>
        <div className="group relative inline-flex h-5 w-10 shrink-0 items-center justify-center rounded-full outline-offset-2 outline-[#A4FF99] has-[:focus-visible]:outline has-[:focus-visible]:outline-2">
          <span className="absolute mx-auto h-4 w-9 rounded-full bg-[#E0F4FC] ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out group-has-[:checked]:bg-[#DFFFDB;]" />
          <span className="absolute left-0 size-5 rounded-full border border-[#74C7F1] bg-[#74C7F1] shadow-sm transition-transform duration-200 ease-in-out group-has-[:checked]:translate-x-5  group-has-[:checked]:bg-[#A4FF99] group-has-[:checked]:border-[#A4FF99]" />
          <input
            name="setting"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            aria-label="Use setting"
            className="absolute inset-0 appearance-none focus:outline-none"
          />
        </div>
      </>
    </div>
  );
};
export default SwitchButton;
