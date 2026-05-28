{
  /**
   * Displays a message for unavailable posts with a link to learn more.
   * Props: postType ('comment' | 'reply', default is 'reply').
   */
}

import Link from 'next/link';

import Text from '@/elements/Text';

type UnavailablePostProps = {
  postType?: 'comment' | 'reply';
};

export default function UnavailablePost({
  postType = 'reply',
}: UnavailablePostProps) {
  return (
    <div className="mt-2 rounded-xl bg-pink-300 p-3">
      <div className="flex flex-col gap-3 rounded border border-black p-3">
        <Text>This {postType} is unavailable.</Text>
        <Link
          href="/terms"
          className="text-sm font-semibold text-primary sm:text-base lg:text-lg"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
