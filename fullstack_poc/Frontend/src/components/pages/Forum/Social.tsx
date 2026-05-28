import Facebook from '/public/images/fb-logo.svg';
import Google from '/public/images/google.svg';
import Apple from '/public/images/apple-logo.svg';
import { facebookLogin, googleLogin } from '@/actions/oauth';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';

function Social() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.authLoading);

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  const handleFacebookLogin = () => {
    dispatch(facebookLogin());
  };
  return (
    <>
      <div className="flex gap-3 justify-center mt-4 pb-8">
        <div className="mb-2 relative group">
          <Button
            color="!bg-[#D8DADC] !rounded-full !h-13 !w-13 !p-0 flex items-center justify-center "
            type="light"
            block
            isdisabled={true}
          >
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 opacity-60">
                <CustomImage src={Apple} />
              </div>
            </div>
          </Button>

          {/* Tooltip (show below the button) */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 !w-40 hidden group-hover:block ">
            <div className="bg-[#D8DADC] text-[#838B8D] text-xs px-2 py-1.5 rounded-full border border-gray-300 shadow-sm whitespace-nowrap">
              {' '}
              Available on the App Store
            </div>
          </div>
        </div>
        <div className="mb-2">
          <Button
            color="bg-white !rounded-full !h-13 !w-13 !p-0 flex items-center justify-center"
            type="light"
            block
            customClassName="rounded-full"
            isdisabled={isLoading}
            onClick={handleGoogleLogin}
          >
            <div className="flex items-center justify-center font-bold">
              <div className="h-5 w-5">
                <CustomImage src={Google} />
              </div>
            </div>
          </Button>
        </div>
        <div className="mb-2">
          <Button
            color="bg-white !rounded-full !h-13 !w-13 !p-0 flex items-center justify-center"
            type="light"
            isdisabled={isLoading}
            block
            onClick={handleFacebookLogin}
          >
            <div className="flex items-center justify-center font-bold">
              <div className="h-5 w-5">
                <CustomImage src={Facebook} />
              </div>
            </div>
          </Button>
        </div>
      </div>
    </>
  );
}
export default Social;
