import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import social from '/public/images/o-logo.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { FETCH_CAMPFIRE_COVER_PICTURES } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';

interface CoverImage {
  id: string;
  key: string;
  url: string;
}

interface Props {
  nextStep: () => void;
  onSelectCoverImage?: (image: string) => void;
}

function CamfireCoverImageModal({ nextStep, onSelectCoverImage }: Props) {
  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();
  const previewRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const isMobile = useIsMobile();
  const isIpad = useIsipad();
  const isDesktop = useIsDesktop();

  const [campfireCoverPicture, setCampfireCoverPicture] = useState<string>('');
  const [previewPicture, setPreviewPicture] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleCoverPictureUpdate = async () => {
    onSelectCoverImage?.(campfireCoverPicture);
    nextStep();
  };
  const {
    data: campfireCoverPictureData,
    loading: campfireCoverPictureLoading,
    error,
  } = useQuery(FETCH_CAMPFIRE_COVER_PICTURES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    skip: token === '',
    fetchPolicy: 'no-cache',
  });

  const handleCoverPictureSelect = (url: string) => {
    setCampfireCoverPicture(url);
  };

  const handlePreview = () => {
    setShowPreview(true);

    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  return (
    <div
      className="bg-white text-white p-6 rounded-3xl min-h-[600px] flex flex-col"
      ref={previewRef}
    >
      <Heading priority={3} variant font="font-medium">
        Create a Campfire
      </Heading>
      {/* <div className="relative z-20 pb-6 border-b border-gray-800">
        <div className="flex justify-center items-center">
          <Heading priority={3} variant="default" font="font-medium" color="text-white">
            Create a Campfire
          </Heading>
        </div>
      </div> */}

      <div className="flex-1 overflow-y-auto mt-6 scrollbar-hide">
        {/* Large Preview */}
        <div className="w-full aspect-[3/1] bg-gray-900 rounded-2xl overflow-hidden mb-6 relative">
          {previewPicture ? (
            <CustomImage
              src={previewPicture}
              layout="fill"
              objectFit="cover"
              alt="Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No cover selected
            </div>
          )}
        </div>

        <div className="mb-6">
          <Text size="3xl" font="font-medium" color="text-black">
            Select your cover image for your campfire
          </Text>
        </div>

        {error && (
          <div className="flex h-36 flex-wrap gap-4 py-8 text-error">
            <Text size="base">
              Oops, something went wrong while fetching cover images.
            </Text>
          </div>
        )}

        {campfireCoverPictureLoading && !error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="pulse">
              <div className="relative h-[80px] w-[120px] cursor-pointer ">
                <CustomImage src={social} />
              </div>
            </div>
            <p className="pt-4 text-sm text-gray-400">
              Please wait while we load campfire cover images
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {(campfireCoverPictureData as any)?.campfire_cover_pictures.map(
              (avatar: {
                id: string;
                key: string;
                url: string;
                createdAt: string;
              }) => {
                const isSelected = avatar.url === campfireCoverPicture;
                return (
                  <div
                    key={avatar.id}
                    className={`relative w-full h-24 cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      isSelected ? 'border-white' : 'border-transparent'
                    }`}
                    onClick={() => handleCoverPictureSelect(avatar.url)}
                  >
                    <CustomImage
                      src={avatar.url}
                      layout="fill"
                      objectFit="cover"
                      alt={avatar.key}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-white border-white'
                            : 'border-white/50 bg-transparent'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-black" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        <div className="mb-8">
          <div className="flex gap-2">
            <Text size="sm" color="text-red-500">
              *
            </Text>
            <Text size="xs" color="text-black">
              any interaction or conversation occurring within a Campfire group
              will not be accessible outside the given group, the link or
              crossposting of the link elsewhere will not be functional
              whatsoever other than the origin Campfire itself
            </Text>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-gray-800">
        <Button
          size="md"
          type="secondary"
          textColor="text-black"
          customClassName="border-white hover:bg-white/10"
          block
          onClick={() => setPreviewPicture(campfireCoverPicture)}
          isdisabled={!campfireCoverPicture}
        >
          Preview
        </Button>
        <Button
          size="md"
          type="primary"
          block
          onClick={handleCoverPictureUpdate}
          isdisabled={!campfireCoverPicture}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default CamfireCoverImageModal;
