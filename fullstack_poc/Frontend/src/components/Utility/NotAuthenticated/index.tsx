import { RiAlarmWarningFill } from 'react-icons/ri';

import HomeRedirect from '@/elements/HomeRedirect';

interface IProps {
  errorMessage?: string;
}
const NotAuthenticated = ({ errorMessage }: IProps) => {
  return (
    <section className="bg-white">
      <div className="layout flex min-h-screen flex-col items-center justify-center text-center text-black">
        <RiAlarmWarningFill
          size={60}
          className="drop-shadow-glow animate-flicker text-red-500"
        />
        <h1 className="mt-8 text-3xl lg:text-3xl">
          {errorMessage || 'Oops! Looks like you are not logged in'}
        </h1>
        <HomeRedirect className="mt-4 cursor-pointer underline lg:text-lg">
          Back to Home
        </HomeRedirect>
      </div>
    </section>
  );
};
export default NotAuthenticated;
