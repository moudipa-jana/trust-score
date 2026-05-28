{
  /**
   * A search input component with various styles and an optional "Suggest" button.
   * It allows dynamic styling based on the `type` and `variant` props,
   * and includes an optional button when `suggest` is true.
   */
}
import Button from '@/components/Utility/Button';

interface SearchComponentProps {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  ref?: React.RefObject<HTMLInputElement>;
  type?: 'light' | 'transparent' | 'outline' | string;
  isActive?: boolean;
  variant?: 'sm';
  suggest?: boolean;
  size?: 'sm';
}

function SearchComponent({
  placeholder,
  onChange,
  value,
  ref,
  type,
  isActive,
  variant,
  suggest,
  size,
}: SearchComponentProps) {
  return (
    <form className="flex " onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="voice-search" className="sr-only">
        Search
      </label>
      <div className="relative flex w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          type=""
          name="q"
          className={`w-full pl-10 ${size === 'sm' ? 'text-sm' : 'text-base'} ${
            type == 'light'
              ? 'border-[1px] border-gray-100 bg-white py-2 text-lg outline-0 placeholder:text-lg '
              : type == 'transparent'
                ? `rounded-none border-b-[1px] border-gray-200 bg-white placeholder:text-base ${
                    variant == 'sm' ? 'py-0  text-sm' : 'py-2 text-lg'
                  }   outline-0 placeholder:text-sm placeholder:text-gray-200 `
                : type == 'outline'
                  ? ' border-[1px] border-gray-200 py-1.5 placeholder:text-[#6B7280] focus:border-primary  focus:outline-none'
                  : 'bg-gray-100 py-1 text-xl   placeholder:text-sm placeholder:text-black-400 lg:py-3 lg:placeholder:text-xl'
          }  rounded-md  text-black-400 focus:outline-none`}
          placeholder={placeholder}
          autoComplete="off"
          onChange={onChange}
          value={value}
          ref={ref}
        />
      </div>
      {type == 'transparent' && suggest && (
        <div className=" inline-flex items-end">
          <Button
            type={isActive ? 'secondary' : 'light'}
            size="sm"
            textColor={isActive ? 'text-primary' : 'text-gray-200'}
            color="bg-white"
          >
            Suggest
          </Button>
        </div>
      )}
    </form>
  );
}

export default SearchComponent;
