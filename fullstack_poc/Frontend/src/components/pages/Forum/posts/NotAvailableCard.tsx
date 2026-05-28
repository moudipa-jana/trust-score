import React from 'react';

import Text from '@/elements/Text';

function NotAvailableCard() {
  return (
    <div className="my-4 rounded-md bg-pink-300 p-3">
      <div className="space-y-3 rounded-md border border-black p-3">
        <Text size="md" color="text-black">
          This content is unavailable.
        </Text>
        {/* <Link href="/faqs">
          <Text size="md" color="text-primary" font="font-semibold">
            Learn more
          </Text>
        </Link> */}
      </div>
    </div>
  );
}
export default NotAvailableCard;
